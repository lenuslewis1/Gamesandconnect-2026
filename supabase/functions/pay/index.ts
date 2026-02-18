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
        const {
            event_id,
            registration_id,
            account_number,
            account_name,
            amount,
            total_amount,
            payment_amount,
            network,
            narration
        } = await req.json();

        // Use payment_amount if provided (part payment), otherwise fall back to amount
        const actualPaymentAmount = payment_amount || amount;
        const actualTotalAmount = total_amount || amount;

        console.log('Payment request:', {
            event_id,
            registration_id,
            account_number,
            account_name,
            amount: actualPaymentAmount,
            total_amount: actualTotalAmount,
            network,
            narration
        });

        // Validate required fields
        if (!registration_id || !account_number || !amount || !network) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing required fields: registration_id, account_number, amount, network'
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get API credentials from environment
        const paymentApiUrl = Deno.env.get('PAYMENT_API_URL');
        const partnerCode = Deno.env.get('DCM_PARTNER_CODE');
        const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`;

        if (!paymentApiUrl || !partnerCode) {
            console.error('Payment gateway not configured (missing vars)');
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Payment gateway configuration missing'
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Map frontend network IDs to API codes/names
        // Frontend sends: 300591 (MTN), 300592 (AirtelTigo), 300594 (Telecel)
        // User example payload showed "network": "mtn"
        let networkCode = network;
        if (network === '300591') networkCode = 'mtn';
        if (network === '300592') networkCode = 'airteltigo';
        if (network === '300594') networkCode = 'vodafone'; // Telecel was Vodafone

        console.log(`Mapped network ${network} to ${networkCode}`);

        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Prepare DCM API request payload
        // Structure based on user provided JSON:
        // { "accountNumber": "...", "amount": "...", "narration": "...", "network": "..." }
        const paymentPayload = {
            accountNumber: account_number,
            amount: String(actualPaymentAmount), // Use the actual payment amount (may be partial)
            narration: narration || 'Event Payment',
            network: networkCode,
            partnerCode: partnerCode,
            callbackUrl: callbackUrl,
        };

        console.log('Calling Payment API:', paymentApiUrl);
        console.log('Payload:', JSON.stringify(paymentPayload, null, 2));

        // Call Payment API
        const apiResponse = await fetch(paymentApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add partner code in header if expected there too
                'x-partner-code': partnerCode
            },
            body: JSON.stringify(paymentPayload),
        });

        let responseData;
        const responseText = await apiResponse.text();
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response JSON:', responseText);
            responseData = { raw: responseText };
        }

        console.log('API Response:', responseData);

        if (!apiResponse.ok) {
            console.error('Payment API error:', responseData);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: responseData?.message || responseData?.error || 'Payment initiation failed upstream',
                    details: responseData
                }),
                { status: apiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Extract transaction reference from DCM response
        // DCM returns: collectionTransactionID, data.collection.data.transactionId, paymentId
        const transactionReference =
            responseData.collectionTransactionID ||
            responseData.data?.collection?.data?.transactionId ||
            responseData.transactionId ||
            responseData.transaction_id ||
            responseData.reference ||
            responseData.paymentId ||
            responseData.data?.transactionId ||
            responseData.data?.reference ||
            `TXN-${Date.now()}`;

        console.log('Transaction reference:', transactionReference);

        // Determine initial payment status from DCM response
        // DCM may return success:true with data.collection.data.description = "Transaction initiated. Awaiting processing"
        // which means it's still pending. Or it may return a final status.
        const collectionStatus = responseData.data?.collection?.data?.status?.toString() || '';
        const collectionDesc = responseData.data?.collection?.data?.description || '';
        const topLevelStatus = (responseData.status || '').toString().toLowerCase();

        let initialStatus = 'pending';

        // DCM's "Payment processed successfully" means the request was accepted (prompt sent to phone)
        // It does NOT mean the user has approved. Always start as pending.
        // Only mark as completed/failed based on explicit status values.
        if (['success', 'successful', 'completed', 'paid'].includes(topLevelStatus)) {
            initialStatus = 'completed';
        } else if (topLevelStatus === 'failed' && !responseData.success) {
            // Only treat as failed if success is also false (true failure)
            initialStatus = 'failed';
        }
        // All other cases (including success:true + status:'failed' DCM quirk) = pending

        console.log(`Initial payment status determined: ${initialStatus} (collection: ${collectionStatus}, topLevel: ${topLevelStatus})`);

        // Store payment record in database
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                registration_id: registration_id,
                event_id: event_id || null,
                transaction_id: transactionReference,
                partner_code: partnerCode,
                dest_bank: networkCode,
                account_number: account_number,
                account_name: account_name || 'Customer',
                amount: Number(actualPaymentAmount),
                narration: narration || 'Event Payment',
                status: initialStatus,
                response: responseData,
            });

        if (paymentError) {
            console.error('Error storing payment record:', paymentError);
        } else {
            console.log('Payment record stored successfully');
        }

        // Update registration with total_amount and amount_paid
        const isPartPayment = actualPaymentAmount < actualTotalAmount;
        const regUpdate: Record<string, any> = {
            total_amount: actualTotalAmount,
        };

        if (initialStatus === 'completed') {
            // Payment already confirmed by gateway immediately
            regUpdate.amount_paid = actualPaymentAmount;
            regUpdate.payment_status = isPartPayment ? 'partial' : 'paid';
        } else {
            // Payment still pending gateway confirmation
            // Don't update amount_paid yet — wait for callback
            regUpdate.payment_status = 'pending';
        }

        const { error: regError } = await supabase
            .from('registrations')
            .update(regUpdate)
            .eq('id', registration_id);

        if (regError) {
            console.error('Error updating registration:', regError);
        } else {
            console.log('Registration updated:', regUpdate);
        }

        // Also update event_registrations if it exists
        await supabase
            .from('event_registrations')
            .update({
                total_amount: actualTotalAmount,
                amount_paid: initialStatus === 'completed' ? actualPaymentAmount : 0,
            })
            .eq('id', registration_id);

        // Return success response with status info for frontend
        return new Response(
            JSON.stringify({
                success: true,
                message: initialStatus === 'completed'
                    ? 'Payment completed successfully'
                    : 'Payment initiated successfully',
                transaction_reference: transactionReference,
                payment_status: initialStatus,
                data: responseData,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Payment initiation error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                message: 'Failed to process payment request'
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
