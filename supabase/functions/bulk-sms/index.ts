import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.93.2';
import { createBulkSmsHandler } from './handler.mjs';

const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
});
const columns = 'id,created_at,message,recipient_count,accepted_count,status,provider_campaign_id,error,completed_at';
const database = {
    async getCampaign(id: string) {
        const { data, error } = await client.from('sms_campaigns').select(columns).eq('id', id).maybeSingle();
        if (error) throw error;
        return data;
    },
    async getContacts(ids: string[]) {
        const { data, error } = await client.from('website_contacts').select('id,normalized_phone,sms_opt_out').in('id', ids);
        if (error) throw error;
        return data;
    },
    async claimCampaign(campaign: Record<string, unknown>) {
        const { error } = await client.from('sms_campaigns').insert(campaign);
        if (error?.code === '23505') return false;
        if (error) throw error;
        return true;
    },
    async completeCampaign(id: string, changes: Record<string, unknown>) {
        const { data, error } = await client.from('sms_campaigns').update(changes).eq('id', id).select(columns).single();
        if (error) throw error;
        return data;
    },
};
Deno.serve(createBulkSmsHandler({
    async authenticate(authorization: string | null) {
        if (!authorization?.startsWith('Bearer ')) return null;
        const { data, error } = await client.auth.getUser(authorization.slice(7));
        return error ? null : data.user;
    },
    database,
    apiKey: Deno.env.get('BMS_API_KEY'),
    senderId: Deno.env.get('BMS_SENDER_ID'),
}));
