import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
    to: string;
    customer_name: string;
    event_title: string;
    event_date: string;
    event_time: string;
    event_location: string;
    ticket_count: number;
    ticket_tier: string;
    total_amount: number;
    booking_reference: string | number;
    transaction_id: string;
}

function generateEmailHtml(data: EmailPayload): string {
    const formattedDate = data.event_date
        ? new Date(data.event_date).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'TBA';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FDF8F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FDF8F4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #fd4c01, #ff6b2b); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                🎉 Booking Confirmed!
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                Your ticket${data.ticket_count > 1 ? 's have' : ' has'} been secured
                            </p>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 32px 40px 0;">
                            <p style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                                Hey ${data.customer_name}! 👋
                            </p>
                            <p style="margin: 12px 0 0; color: #555; font-size: 15px; line-height: 1.6;">
                                Thank you for your purchase! Here are your booking details:
                            </p>
                        </td>
                    </tr>

                    <!-- Event Details Card -->
                    <tr>
                        <td style="padding: 24px 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FDF8F4; border-radius: 12px; border: 1px solid #f0e6dc;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h2 style="margin: 0 0 16px; color: #fd4c01; font-size: 20px; font-weight: 700;">
                                            ${data.event_title}
                                        </h2>
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="padding: 6px 0; color: #777; font-size: 13px; width: 100px; vertical-align: top;">📅 Date</td>
                                                <td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${formattedDate}</td>
                                            </tr>
                                            ${data.event_time ? `
                                            <tr>
                                                <td style="padding: 6px 0; color: #777; font-size: 13px; vertical-align: top;">🕐 Time</td>
                                                <td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.event_time}</td>
                                            </tr>` : ''}
                                            <tr>
                                                <td style="padding: 6px 0; color: #777; font-size: 13px; vertical-align: top;">📍 Location</td>
                                                <td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.event_location}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Ticket Summary -->
                    <tr>
                        <td style="padding: 0 40px 24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius: 12px; border: 1px solid #e8e8e8;">
                                <tr>
                                    <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="color: #555; font-size: 14px;">Ticket Type</td>
                                                <td align="right" style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${data.ticket_tier}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="color: #555; font-size: 14px;">Quantity</td>
                                                <td align="right" style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${data.ticket_count}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 20px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="color: #1a1a1a; font-size: 16px; font-weight: 700;">Total Paid</td>
                                                <td align="right" style="color: #fd4c01; font-size: 18px; font-weight: 700;">GH₵${data.total_amount}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Booking Reference -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="margin: 0 0 4px; color: #15803d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                            Booking Reference
                                        </p>
                                        <p style="margin: 0; color: #15803d; font-size: 24px; font-weight: 700; letter-spacing: 1px;">
                                            #${data.booking_reference}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px 32px; border-top: 1px solid #f0f0f0; text-align: center;">
                            <p style="margin: 0 0 8px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                                See you there! 🎮🏕️
                            </p>
                            <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.5;">
                                If you have any questions, feel free to reach out to us.<br>
                                — The Vibes Ventures Team
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`.trim();
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not set');
            return new Response(
                JSON.stringify({ error: 'Email service not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const payload: EmailPayload = await req.json();
        console.log('Sending confirmation email to:', payload.to);

        // Validate required fields
        if (!payload.to || !payload.customer_name || !payload.event_title) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: to, customer_name, event_title' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const html = generateEmailHtml(payload);

        // Send via Resend API
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Vibes Ventures <onboarding@resend.dev>',
                to: [payload.to],
                subject: `🎟️ Booking Confirmed — ${payload.event_title}`,
                html: html,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Resend API error:', data);
            return new Response(
                JSON.stringify({ error: 'Failed to send email', details: data }),
                { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('Confirmation email sent successfully:', data);

        return new Response(
            JSON.stringify({ success: true, message: 'Confirmation email sent', data }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Send confirmation email error:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Internal server error'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
