import test from 'node:test';
import assert from 'node:assert/strict';
import { createBulkSmsHandler } from '../supabase/functions/bulk-sms/handler.mjs';
import { smsEstimate, safeContactSearch } from '../src/legacy/lib/bulkSms.mjs';

const campaignId = '11111111-1111-4111-8111-111111111111';
const contactId = '22222222-2222-4222-8222-222222222222';
function setup(overrides = {}) {
    const campaigns = new Map(); let calls = 0;
    const dependencies = {
        authenticate: async () => ({ id: 'admin-id', email: 'gamesandconnectgh@gmail.com' }),
        apiKey: 'secret', senderId: 'GamesConect',
        database: {
            getCampaign: async id => campaigns.get(id),
            getContacts: async ids => ids.map(id => ({ id, normalized_phone: '233241234567', sms_opt_out: false })),
            claimCampaign: async campaign => { if (campaigns.has(campaign.id)) return false; campaigns.set(campaign.id, { ...campaign }); return true; },
            completeCampaign: async (id, changes) => { const row = { ...campaigns.get(id), ...changes }; campaigns.set(id, row); return row; },
        },
        send: async (phones, message) => { calls++; assert.deepEqual(phones, ['233241234567']); assert.equal(message, 'Hello customers'); return { outcome: 'accepted', acceptedCount: 1, data: { campaign_id: 'bms-1' } }; },
    };
    const handler = createBulkSmsHandler({ ...dependencies, ...overrides, database: { ...dependencies.database, ...overrides.database } });
    const request = (payload = {}) => handler(new Request('https://example.test/bulk-sms', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
        body: JSON.stringify({ campaign_id: campaignId, contact_ids: [contactId], message: 'Hello customers', ...payload }),
    }));
    return { request, campaigns, calls: () => calls };
}

test('rejects anonymous users and ordinary members before touching contacts or sending', async () => {
    for (const [user, expected] of [[null, 401], [{ id: 'member', email: 'member@example.com' }, 403]]) {
        const env = setup({ authenticate: async () => user, database: { getCampaign: async () => { throw new Error('must not query'); } } });
        assert.equal((await env.request()).status, expected); assert.equal(env.calls(), 0);
    }
});
test('configuration status reveals no API secret and missing configuration cannot send', async () => {
    const env = setup({ apiKey: undefined });
    const status = await (await env.request({ action: 'status' })).json();
    assert.equal(status.configured, false); assert.equal(status.apiKey, undefined);
    assert.equal((await env.request()).status, 503); assert.equal(env.calls(), 0);
});
test('revalidates saved contacts and their current SMS preference', async () => {
    for (const rows of [[], [{ id: contactId, sms_opt_out: true, normalized_phone: '233241234567' }], [{ id: contactId, sms_opt_out: false, normalized_phone: null }]]) {
        const env = setup({ database: { getContacts: async () => rows } });
        assert.equal((await env.request()).status, 409); assert.equal(env.calls(), 0);
    }
});
test('rejects malformed requests and prevents unbounded sends', async () => {
    for (const payload of [{ message: '' }, { message: 'x'.repeat(1001) }, { campaign_id: 'bad' }, { contact_ids: [] }, { contact_ids: ['bad'] }, { contact_ids: Array(501).fill(contactId) }]) {
        const env = setup(); assert.equal((await env.request(payload)).status, 400); assert.equal(env.calls(), 0);
    }
});
test('deduplicates numbers and persists campaign results', async () => {
    const env = setup();
    const response = await env.request({ contact_ids: [contactId, '33333333-3333-4333-8333-333333333333'] });
    const { campaign } = await response.json();
    assert.equal(campaign.recipient_count, 1); assert.equal(campaign.accepted_count, 1);
    assert.equal(campaign.status, 'accepted'); assert.equal(campaign.provider_campaign_id, 'bms-1'); assert.equal(env.calls(), 1);
});
test('retries and concurrent requests with the same reference send only once', async () => {
    const env = setup();
    await Promise.all([env.request(), env.request()]);
    const retry = await (await env.request()).json();
    assert.equal(retry.duplicate, true); assert.equal(env.calls(), 1);
});
test('ambiguous provider failures stay unknown and never automatically resend', async () => {
    let calls = 0;
    const env = setup({ send: async () => { calls++; throw new Error('network'); } });
    const result = await (await env.request()).json();
    assert.equal(result.campaign.status, 'unknown');
    await env.request(); assert.equal(calls, 1);
});
test('failure to save the provider result does not allow a second send', async () => {
    const env = setup({ database: { completeCampaign: async () => { throw new Error('database unavailable'); } } });
    const result = await (await env.request()).json();
    assert.match(result.warning, /could not be saved/);
    await env.request(); assert.equal(env.calls(), 1);
});
test('GSM, extended GSM and Unicode estimates respect multipart boundaries', () => {
    assert.equal(smsEstimate('a'.repeat(160), 10).credits, 10);
    assert.equal(smsEstimate('a'.repeat(161), 10).credits, 20);
    assert.equal(smsEstimate('€'.repeat(81), 1).segments, 2);
    assert.equal(smsEstimate('😀'.repeat(35), 1).segments, 1);
    assert.equal(smsEstimate('😀'.repeat(36), 1).segments, 2);
    assert.equal(smsEstimate('', 1).segments, 0);
    assert.equal(safeContactSearch('name),sms_opt_out.eq.true'), 'namesmsoptout.eq.true');
});
