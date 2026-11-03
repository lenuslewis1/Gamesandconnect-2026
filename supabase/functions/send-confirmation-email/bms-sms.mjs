export function normalizeGhanaPhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('233') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10) return `233${digits.slice(1)}`;
    if (digits.length === 9) return `233${digits}`;
    throw new Error('Invalid Ghana phone number');
}

// BMS Africa's documented v2 API is hosted by mNotify.
export async function sendBmsSms(to, message, { apiKey, senderId, fetcher = fetch }) {
    return sendBmsBulkSms([to], message, { apiKey, senderId, fetcher });
}

export async function sendBmsBulkSms(recipients, message, { apiKey, senderId, fetcher = fetch }) {
    if (!apiKey || !senderId) {
        return { success: false, outcome: 'failed', error: 'BMS Africa SMS service is not configured' };
    }
    if (senderId.length > 11) {
        return { success: false, error: 'BMS sender ID must be at most 11 characters' };
    }
    try {
        const recipient = [...new Set(recipients.map(normalizeGhanaPhone))];
        if (!recipient.length || recipient.length > 500) return { success: false, outcome: 'failed', error: 'Select between 1 and 500 recipients' };
        const response = await fetcher(`https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ recipient, sender: senderId, message, is_schedule: false }),
            signal: AbortSignal.timeout(15000),
        });
        const data = await response.json();
        const summary = data?.summary;
        const success = response.ok && data?.status === 'success' && String(data?.code) === '2000'
            && Number(summary?.total_sent) > 0 && Number(summary?.total_rejected ?? 0) === 0;
        // Return only delivery metadata, never raw responses or request URLs containing the key.
        const acceptedCount = response.ok && data?.status === 'success' && String(data?.code) === '2000'
            ? Math.min(recipient.length, Math.max(0, Number(summary?.total_sent) || 0)) : 0;
        return {
            success,
            acceptedCount,
            outcome: success ? 'accepted' : acceptedCount > 0 ? 'partial' : 'failed',
            status: response.status,
            data: { provider: 'bms', code: data?.code, campaign_id: summary?._id },
            error: success ? undefined : 'BMS Africa did not accept the SMS',
        };
    } catch {
        return { success: false, outcome: 'unknown', error: 'SMS acceptance could not be confirmed. Check BMS campaign history before sending again.' };
    }
}
