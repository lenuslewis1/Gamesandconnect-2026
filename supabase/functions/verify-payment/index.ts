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
        const { registration_id, transaction_reference } = await req.json();

        if (!registration_id) {
            return new Response(
                JSON.stringify({ error: 'Missing registration_id' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`=== VERIFY PAYMENT for registration: ${registration_id} ===`);

        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Query the payments table for this registration
        const { data: payments, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('registration_id', registration_id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (paymentError) {
            console.error('Error fetching payment:', paymentError);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch payment status' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const payment = payments && payments.length > 0 ? payments[0] : null;

        if (!payment) {
            console.log('No payment record found, checking registration status');

            const { data: registrations, error: regError } = await supabase
                .from('registrations')
                .select('payment_status, updated_at')
                .eq('id', registration_id)
                .limit(1);

            if (regError) {
                console.error('Error fetching registration:', regError);
                return new Response(
                    JSON.stringify({ error: 'Failed to fetch registration status' }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const registration = registrations && registrations.length > 0 ? registrations[0] : null;
            const regStatus = (registration?.payment_status || 'pending').toLowerCase().trim();
            const regConfirmed = ['completed', 'confirmed', 'success', 'successful', 'paid'].includes(regStatus);
            const regPartial = regStatus === 'partial';
            const regFailed = ['failed', 'declined', 'cancelled', 'canceled', 'rejected', 'error'].includes(regStatus);
            const responseStatus = regConfirmed ? 'confirmed' : regPartial ? 'confirmed' : regFailed ? 'failed' : 'pending';

            return new Response(
                JSON.stringify({
                    success: true,
                    registration_id,
                    status: responseStatus,
                    is_confirmed: regConfirmed || regPartial,
                    is_failed: regFailed,
                    message: regConfirmed
                        ? 'Payment confirmed'
                        : regPartial
                            ? 'Part payment confirmed'
                            : regFailed
                                ? 'Payment failed'
                                : 'Payment is still being processed',
                    payment_status: regStatus,
                    total_amount: Number(registration?.total_amount || 0),
                    amount_paid: Number(registration?.amount_paid || 0),
                    balance_remaining: Math.max(0, Number(registration?.total_amount || 0) - Number(registration?.amount_paid || 0)),
                    updated_at: registration?.updated_at,
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Normalize status from payment record
        let paymentStatus = payment.status?.toLowerCase().trim() || 'pending';

        // If status is still pending, check if the stored DCM response already has a final status
        // DCM returns success:true and data.collection status
        if (paymentStatus === 'pending' && payment.response) {
            const dcmResponse = payment.response;
            const dcmSuccess = dcmResponse.success;
            const collectionStatus = dcmResponse.data?.collection?.data?.status;
            const collectionDesc = dcmResponse.data?.collection?.data?.description || '';

            console.log(`Checking stored DCM response: success=${dcmSuccess}, collectionStatus=${collectionStatus}, desc=${collectionDesc}`);

            // If DCM said success:true and collection status is 200 and description says "Awaiting", 
            // we check if enough time has passed (DCM should have processed by now)
            // For now, keep as pending - the callback or manual check should update this
        }

        // Also check if there's a verification_response (from callback)
        // DCM status codes: "000" = success, "SUCCESS" = success (legacy), "-200" = rejected
        if (paymentStatus === 'pending' && payment.verification_response) {
            const callbackData = payment.verification_response;
            const callbackStatus = (callbackData.status || '').toString().toLowerCase().trim();
            const callbackDesc = (callbackData.description || '').toString().toLowerCase().trim();
            console.log(`Checking verification_response status: "${callbackStatus}", description: "${callbackDesc}"`);

            const cbSuccess = ['success', 'successful', 'completed', 'paid', '200', '000'].includes(callbackStatus) || callbackDesc === 'success';
            const cbFailed = !cbSuccess && (
                ['failed', 'declined', 'cancelled', 'error', 'rejected', '-200', 'could_not_perform_transaction'].includes(callbackStatus)
                || callbackStatus.startsWith('-')
                || callbackDesc === 'could_not_perform_transaction'
            );

            if (cbSuccess) {
                paymentStatus = 'completed';
                await supabase
                    .from('payments')
                    .update({ status: 'completed', completed_at: new Date().toISOString() })
                    .eq('id', payment.id);
            } else if (cbFailed) {
                paymentStatus = 'failed';
                await supabase
                    .from('payments')
                    .update({ status: 'failed', completed_at: new Date().toISOString() })
                    .eq('id', payment.id);
            }
        }

        // Check if payment is confirmed/completed
        const isConfirmed = ['completed', 'confirmed', 'success', 'successful', 'paid'].includes(paymentStatus);

        // Check if payment failed
        const isFailed = ['failed', 'declined', 'cancelled', 'canceled', 'rejected', 'error'].includes(paymentStatus);

        const responseStatus = isConfirmed ? 'confirmed' : isFailed ? 'failed' : 'pending';

        console.log(`Payment status in DB: ${paymentStatus}, returning: ${responseStatus}, is_confirmed: ${isConfirmed}, is_failed: ${isFailed}`);

        // If confirmed, also update the registration with proper part-payment handling
        if (isConfirmed) {
            // Fetch current registration to check part payment status
            const { data: regData } = await supabase
                .from('registrations')
                .select('total_amount, amount_paid')
                .eq('id', registration_id)
                .single();

            const totalAmount = Number(regData?.total_amount || 0);
            const currentAmountPaid = Number(regData?.amount_paid || 0);
            const newAmountPaid = currentAmountPaid > 0 ? currentAmountPaid : Number(payment.amount || 0);
            const fullyPaid = totalAmount > 0 ? newAmountPaid >= totalAmount : true;

            await supabase
                .from('registrations')
                .update({
                    payment_status: fullyPaid ? 'paid' : 'partial',
                    amount_paid: newAmountPaid,
                })
                .eq('id', registration_id);
        }

        // Fetch registration for amount data in response
        const { data: regForResponse } = await supabase
            .from('registrations')
            .select('total_amount, amount_paid, payment_status')
            .eq('id', registration_id)
            .single();

        const regTotalAmount = Number(regForResponse?.total_amount || 0);
        const regAmountPaid = Number(regForResponse?.amount_paid || 0);
        const regPaymentStatus = regForResponse?.payment_status || '';
        const isPartialPayment = regPaymentStatus === 'partial';

        // Return the payment status
        return new Response(
            JSON.stringify({
                success: true,
                registration_id,
                status: isPartialPayment ? 'confirmed' : responseStatus,
                is_confirmed: isConfirmed || isPartialPayment,
                is_failed: isFailed,
                message: isConfirmed
                    ? (isPartialPayment ? 'Part payment confirmed' : 'Payment confirmed')
                    : isFailed
                        ? 'Payment failed'
                        : 'Payment is still being processed',
                payment_status: isPartialPayment ? 'partial' : paymentStatus,
                transaction_id: payment.transaction_id,
                total_amount: regTotalAmount,
                amount_paid: regAmountPaid,
                balance_remaining: Math.max(0, regTotalAmount - regAmountPaid),
                created_at: payment.created_at,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Verify payment error:', error);
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
