import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGhanaPhone, sendBmsSms } from '../supabase/functions/send-confirmation-email/bms-sms.mjs';

const accepted = { status: 'success', code: '2000', summary: { _id: 'campaign-1', total_sent: 1, total_rejected: 0 } };
const config = (data = accepted, status = 200) => ({ apiKey: 'test-secret', senderId: 'GamesConect', fetcher: async () => Response.json(data, { status }) });

test('normalizes local and international Ghana phone formats', () => {
    for (const phone of ['0241234567', '+233 24 123 4567', '241234567']) {
        assert.equal(normalizeGhanaPhone(phone), '233241234567');
    }
    assert.throws(() => normalizeGhanaPhone('+447123456789'), /Invalid Ghana/);
});

test('sends documented BMS payload and returns safe campaign metadata', async () => {
    const result = await sendBmsSms('0241234567', 'Booking received. Payment pending.', {
        ...config(), fetcher: async (url, request) => {
            assert.equal(url, 'https://api.mnotify.com/api/sms/quick?key=test-secret');
            assert.equal(request.method, 'POST');
            assert.deepEqual(JSON.parse(request.body), {
                recipient: ['233241234567'], sender: 'GamesConect',
                message: 'Booking received. Payment pending.', is_schedule: false,
            });
            return Response.json(accepted);
        },
    });
    assert.equal(result.success, true);
    assert.equal(result.data.campaign_id, 'campaign-1');
    assert.ok(!JSON.stringify(result).includes('test-secret'));
});

test('HTTP 200 alone never counts as SMS acceptance', async () => {
    for (const data of [
        { status: 'error', code: '4000' },
        { ...accepted, summary: { total_sent: 0, total_rejected: 1 } },
        { ...accepted, summary: undefined },
    ]) {
        assert.equal((await sendBmsSms('0241234567', 'Test', config(data))).success, false);
    }
    assert.equal((await sendBmsSms('0241234567', 'Test', config(accepted, 401))).success, false);
});

test('configuration, invalid recipients and network errors fail without leaking the key', async () => {
    let called = false;
    const fetcher = async () => { called = true; throw new Error('URL contains test-secret'); };
    assert.equal((await sendBmsSms('0241234567', 'Test', { fetcher })).success, false);
    assert.equal((await sendBmsSms('bad', 'Test', { ...config(), fetcher })).success, false);
    assert.equal(called, false);
    const result = await sendBmsSms('0241234567', 'Test', { ...config(), fetcher });
    assert.equal(result.success, false);
    assert.ok(!JSON.stringify(result).includes('test-secret'));
});
