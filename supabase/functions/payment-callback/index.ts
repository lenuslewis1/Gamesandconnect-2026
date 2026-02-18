import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log('Payment callback received:', JSON.stringify(payload, null, 2));

        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Store raw callback in payment_callbacks table for audit
        await supabase.from('payment_callbacks').insert({
            payload: payload,
            transaction_id: payload.collectionTransactionID || payload.transactionId || payload.transaction_id || null,
            transaction_reference: payload.collectionTransactionID || payload.transactionReference || null,
            status: payload.status || null,
            processed: false,
        });

        // Extract transaction ID from callback - DCM uses collectionTransactionID
        const transactionId =
            payload.collectionTransactionID ||
            payload.transactionId ||
            payload.transaction_id ||
            payload.transactionReference ||
            payload.transaction_reference ||
            payload.data?.collection?.data?.transactionId ||
            payload.data?.transactionId ||
            payload.data?.transaction_id ||
            null;

        // Also try to get registration_id if DCM passes it back
        const registrationId =
            payload.registration_id ||
            payload.registrationId ||
            payload.data?.registration_id ||
            payload.data?.registrationId ||
            null;

        if (!transactionId && !registrationId) {
            console.error('No transaction ID or registration ID found in callback payload');
            return new Response(
                JSON.stringify({ error: 'Missing transaction or registration ID' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Normalize payment status from callback
        const rawStatus = (
            payload.status ||
            payload.payment_status ||
            payload.paymentStatus ||
            payload.data?.status ||
            payload.data?.collection?.data?.status ||
            ''
        ).toString().toLowerCase().trim();

        // Also check description field (DCM sends description: "success" alongside status: "000")
        const rawDescription = (
            payload.description ||
            payload.data?.description ||
            ''
        ).toString().toLowerCase().trim();

        // Determine if payment was successful or failed
        // DCM status codes: "000" = success, "SUCCESS" = success (legacy), "-200" = rejected
        const isSuccess = [
            'success', 'successful', 'confirmed', 'paid', 'completed', '200', '000'
        ].includes(rawStatus) || rawDescription === 'success';

        // Handle negative status codes (like -200) and known failure strings
        const isFailed = !isSuccess && ([
            'failed', 'declined', 'cancelled', 'canceled', 'error', 'rejected',
            '-200', 'could_not_perform_transaction'
        ].includes(rawStatus) || rawStatus.startsWith('-') || rawDescription === 'could_not_perform_transaction');

        const paymentStatus = isSuccess ? 'completed' : isFailed ? 'failed' : 'pending';

        console.log(`Raw status: "${rawStatus}", mapped to: "${paymentStatus}", isSuccess: ${isSuccess}, isFailed: ${isFailed}`);

        // Try to find and update the payment record
        // First by transaction_id, then by registration_id
        let updated = false;

        if (transactionId) {
            console.log(`Looking up payment by transaction_id: ${transactionId}`);
            const { data: updatedPayments, error: updateError } = await supabase
                .from('payments')
                .update({
                    status: paymentStatus,
                    verification_response: payload,
                    completed_at: isSuccess || isFailed ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString(),
                })
                .eq('transaction_id', transactionId)
                .select('id, registration_id');

            if (updateError) {
                console.error('Error updating payment by transaction_id:', updateError);
            } else if (updatedPayments && updatedPayments.length > 0) {
                updated = true;
                console.log(`Updated payment record(s):`, updatedPayments);

                // Update registrations table with accumulated amount_paid
                for (const p of updatedPayments) {
                    if (p.registration_id) {
                        if (isSuccess) {
                            // Fetch the payment amount and current registration
                            const { data: paymentRecord } = await supabase
                                .from('payments')
                                .select('amount')
                                .eq('id', p.id)
                                .single();

                            const { data: registration } = await supabase
                                .from('registrations')
                                .select('total_amount, amount_paid')
                                .eq('id', p.registration_id)
                                .single();

                            const paymentAmount = paymentRecord?.amount || 0;
                            const currentAmountPaid = Number(registration?.amount_paid || 0);
                            const totalAmount = Number(registration?.total_amount || 0);
                            const newAmountPaid = currentAmountPaid + Number(paymentAmount);
                            const fullyPaid = totalAmount > 0 ? newAmountPaid >= totalAmount : true;

                            await supabase
                                .from('registrations')
                                .update({
                                    payment_status: fullyPaid ? 'paid' : 'partial',
                                    amount_paid: newAmountPaid,
                                })
                                .eq('id', p.registration_id);
                            console.log(`Updated registration ${p.registration_id}: amount_paid=${newAmountPaid}, status=${fullyPaid ? 'paid' : 'partial'}`);
                        } else {
                            const regStatus = isFailed ? 'pending' : 'pending';
                            await supabase
                                .from('registrations')
                                .update({ payment_status: regStatus })
                                .eq('id', p.registration_id);
                            console.log(`Updated registration ${p.registration_id} to ${regStatus}`);
                        }
                    }
                }
            } else {
                console.log('No payment found with transaction_id:', transactionId);
            }
        }

        // Fallback: try by registration_id
        if (!updated && registrationId) {
            console.log(`Looking up payment by registration_id: ${registrationId}`);
            const { data: updatedPayments, error: updateError } = await supabase
                .from('payments')
                .update({
                    status: paymentStatus,
                    verification_response: payload,
                    completed_at: isSuccess || isFailed ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString(),
                })
                .eq('registration_id', registrationId)
                .select('id');

            if (updateError) {
                console.error('Error updating payment by registration_id:', updateError);
            } else if (updatedPayments && updatedPayments.length > 0) {
                updated = true;
            }

            // Also update registrations table with accumulated amount_paid
            if (isSuccess) {
                const { data: paymentRecord } = await supabase
                    .from('payments')
                    .select('amount')
                    .eq('registration_id', registrationId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                const { data: registration } = await supabase
                    .from('registrations')
                    .select('total_amount, amount_paid')
                    .eq('id', registrationId)
                    .single();

                const paymentAmount = paymentRecord?.amount || 0;
                const currentAmountPaid = Number(registration?.amount_paid || 0);
                const totalAmount = Number(registration?.total_amount || 0);
                const newAmountPaid = currentAmountPaid + Number(paymentAmount);
                const fullyPaid = totalAmount > 0 ? newAmountPaid >= totalAmount : true;

                await supabase
                    .from('registrations')
                    .update({
                        payment_status: fullyPaid ? 'paid' : 'partial',
                        amount_paid: newAmountPaid,
                    })
                    .eq('id', registrationId);
            } else {
                const regStatus = isFailed ? 'pending' : 'pending';
                await supabase
                    .from('registrations')
                    .update({ payment_status: regStatus })
                    .eq('id', registrationId);
            }
        }

        // Mark callback as processed
        if (transactionId) {
            await supabase
                .from('payment_callbacks')
                .update({ processed: true })
                .eq('transaction_id', transactionId);
        }

        // Send confirmation email on successful payment (best-effort, non-blocking)
        if (isSuccess) {
            try {
                // Determine the registration ID to look up details
                const regId = registrationId ||
                    (transactionId
                        ? (await supabase
                            .from('payments')
                            .select('registration_id')
                            .eq('transaction_id', transactionId)
                            .single()
                        ).data?.registration_id
                        : null
                    );

                if (regId) {
                    // Fetch registration details
                    const { data: registration } = await supabase
                        .from('registrations')
                        .select('*')
                        .eq('id', regId)
                        .single();

                    if (registration) {
                        // Fetch event details
                        const { data: event } = await supabase
                            .from('events')
                            .select('title, date, time, location')
                            .eq('id', registration.event_id)
                            .single();

                        // Fetch payment details for total amount
                        const { data: payment } = await supabase
                            .from('payments')
                            .select('amount, transaction_id')
                            .eq('registration_id', regId)
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .single();

                        // Try to get ticket tier info
                        let ticketTierName = 'Standard';
                        if (registration.ticket_tier_id) {
                            const { data: tier } = await supabase
                                .from('ticket_tiers')
                                .select('name')
                                .eq('id', registration.ticket_tier_id)
                                .single();
                            if (tier) ticketTierName = tier.name;
                        }

                        const emailPayload = {
                            to: registration.email,
                            customer_name: registration.full_name,
                            event_title: event?.title || 'Event',
                            event_date: event?.date || '',
                            event_time: event?.time || '',
                            event_location: event?.location || 'TBA',
                            ticket_count: registration.number_of_participants || 1,
                            ticket_tier: ticketTierName,
                            total_amount: payment?.amount || 0,
                            booking_reference: regId,
                            transaction_id: payment?.transaction_id || transactionId || '',
                        };

                        console.log('Sending confirmation email:', JSON.stringify(emailPayload));

                        // Call the send-confirmation-email Edge Function
                        const emailRes = await fetch(
                            `${supabaseUrl}/functions/v1/send-confirmation-email`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${supabaseServiceKey}`,
                                },
                                body: JSON.stringify(emailPayload),
                            }
                        );

                        const emailResult = await emailRes.json();

                        if (!emailRes.ok) {
                            console.error('Confirmation email failed:', emailResult);
                        } else {
                            console.log('Confirmation email sent successfully:', emailResult);
                        }
                    }
                }
            } catch (emailError) {
                // Never fail the callback due to email errors
                console.error('Error sending confirmation email (non-fatal):', emailError);
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Callback processed',
                payment_updated: updated,
                status: paymentStatus,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Payment callback error:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Internal server error'
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
