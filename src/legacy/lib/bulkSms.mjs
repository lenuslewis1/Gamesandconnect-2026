export const CONTACT_SOURCES = {
    community_members: 'Community members',
    contact_messages: 'Contact form', corporate_enquiries: 'Corporate enquiries',
    registrations: 'Bookings', event_registrations: 'Event registrations',
    team_registrations: 'Team registrations', profiles: 'Accounts',
};

// GSM extension characters consume two septets; non-GSM text uses UCS-2 segments.
const gsm = new Set(Array.from('@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\u001bÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'));
const extension = new Set(Array.from('^{}\\[~]|€\f'));
export function smsEstimate(message, recipientCount) {
    let units = 0;
    let unicode = false;
    for (const char of message) {
        if (extension.has(char)) units += 2;
        else if (gsm.has(char)) units++;
        else { unicode = true; break; }
    }
    if (unicode) units = message.length;
    const single = unicode ? 70 : 160;
    const multipart = unicode ? 67 : 153;
    const segments = units ? units <= single ? 1 : Math.ceil(units / multipart) : 0;
    return { encoding: unicode ? 'Unicode' : 'GSM-7', units, segments, credits: segments * recipientCount };
}

export const canReceiveSms = contact => Boolean(contact.normalized_phone && !contact.sms_opt_out);
export function safeContactSearch(value) { return value.replace(/[^\p{L}\p{N}@+ .-]/gu, '').trim().slice(0,100); }
