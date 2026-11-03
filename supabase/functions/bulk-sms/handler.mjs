import { sendBmsBulkSms } from '../send-confirmation-email/bms-sms.mjs';

const admins = new Set(['mariame@ryamchouu.com', 'tunde@ryamchouu.com', 'gamesandconnectgh@gmail.com']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-region, x-supabase-api-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (data, status = 200) => Response.json(data, { status, headers: cors });

// Dependencies are injected so authorization and duplicate-send protection can be tested without SMS.
export function createBulkSmsHandler({ authenticate, database, apiKey, senderId, send = sendBmsBulkSms }) {
    return async (request) => {
        if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
        if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
        try {
            const user = await authenticate(request.headers.get('authorization'));
            if (!user) return reply({ error: 'Sign in to continue' }, 401);
            if (!admins.has(user.email?.trim().toLowerCase())) return reply({ error: 'Administrator access required' }, 403);
            const input = await request.json();
            if (input.action === 'status') return reply({ configured: Boolean(apiKey && senderId), sender: senderId || null });
            if (!uuid.test(input.campaign_id || '')) return reply({ error: 'Invalid campaign reference' }, 400);

            // Rechecking a known reference never calls the provider, even after a lost HTTP response.
            const existing = await database.getCampaign(input.campaign_id);
            if (existing) return reply({ campaign: existing, duplicate: true });
            if (!apiKey || !senderId) return reply({ error: 'BMS Africa is not configured. Add the API key and approved sender ID before sending.' }, 503);
            const message = typeof input.message === 'string' ? input.message.trim() : '';
            if (!message || message.length > 1000) return reply({ error: 'Enter a message of 1–1,000 characters' }, 400);
            if (!Array.isArray(input.contact_ids) || !input.contact_ids.length || input.contact_ids.length > 500 || input.contact_ids.some(id => !uuid.test(id))) {
                return reply({ error: 'Select between 1 and 500 saved contacts' }, 400);
            }
            const ids = [...new Set(input.contact_ids)];
            const contacts = await database.getContacts(ids);
            // Revalidate stored numbers and preferences at send time, never trust phone numbers from the browser.
            if (contacts.length !== ids.length || contacts.some(c => c.sms_opt_out || !c.normalized_phone)) {
                return reply({ error: 'Some selected contacts are unavailable, excluded from SMS, or have no valid Ghana number. Refresh your selection.' }, 409);
            }
            const phones = [...new Set(contacts.map(c => c.normalized_phone))];
            const campaign = { id: input.campaign_id, created_by: user.id, message, recipient_ids: ids, recipient_count: phones.length, status: 'sending' };
            const claimed = await database.claimCampaign(campaign);
            if (!claimed) return reply({ campaign: await database.getCampaign(campaign.id), duplicate: true });

            let result;
            try { result = await send(phones, message, { apiKey, senderId }); }
            catch { result = { outcome: 'unknown', error: 'Provider response unavailable. Check BMS history before sending again.' }; }
            const completed = {
                status: result.outcome || 'unknown', accepted_count: result.acceptedCount || 0,
                provider_campaign_id: result.data?.campaign_id || null, error: result.error || null,
                completed_at: new Date().toISOString(),
            };
            try { return reply({ campaign: await database.completeCampaign(campaign.id, completed) }); }
            catch { return reply({ campaign: { ...campaign, ...completed }, warning: 'The SMS request was made, but its final status could not be saved. Check BMS history before sending again.' }); }
        } catch {
            return reply({ error: 'The SMS request could not be completed. Recheck the same campaign reference before starting another send.' }, 500);
        }
    };
}
