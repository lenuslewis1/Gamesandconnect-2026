// Verified exceptions to the legacy single-date records. Guard by start date so
// rescheduling an event cannot silently reuse an old end date.
const verifiedDates = {
    40: { startDate: '2026-09-18', endDate: '2026-09-20' }, // public Savannah flyer: 18–20 September
    35: { startDate: '2026-03-07', endDate: '2026-03-08' }, // description: two-day riverside getaway
    4: { startDate: '2025-08-22', endDate: '2025-08-23' }, // description: Friday/Saturday itinerary
    26: { startDate: '2025-09-20', endDate: '2025-09-20' }, // schedule ends the same evening; no invented hour
};

export function eventMetadata(event) {
    const verified = verifiedDates[event.id];
    return {
        endDate: event.end_date || (verified && verified.startDate === event.date ? verified.endDate : undefined),
        // Populate these only from confirmed event facts, never created_at.
        ticketSalesStart: event.ticket_sales_start || undefined,
        performers: Array.isArray(event.performers) ? event.performers : [],
    };
}

function clock(value) {
    const match = value.trim().match(/^(\d{1,2})(?::([0-5]\d))?\s*(am|pm)?$/i);
    if (!match) return undefined;
    let hour = Number(match[1]);
    const minute = Number(match[2] || 0);
    if (match[3]) {
        if (hour < 1 || hour > 12) return undefined;
        hour = hour % 12 + (match[3].toLowerCase() === 'pm' ? 12 : 0);
    } else if (!match[2] || hour > 23) return undefined;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

export function eventDates(startDate, timeRange = '', endDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return { startDate };
    if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) && endDate >= startDate) {
        // An end date without a known return time remains a date, not midnight.
        return { startDate, endDate };
    }
    const parts = timeRange.split(/\s*[-–—]\s*/);
    const start = clock(parts[0] || '');
    const end = parts.length === 2 ? clock(parts[1]) : undefined;
    if (!start || !end) return { startDate };
    const endingDay = end < start
        ? new Date(Date.parse(startDate + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10)
        : startDate;
    return { startDate: `${startDate}T${start}+00:00`, endDate: `${endingDay}T${end}+00:00` };
}

export function offerFields({ bookingOpen, ticketSalesStart, now = Date.now() }) {
    // Past events have no live ticket offer; they are not assumed to be sold out.
    if (!bookingOpen) return undefined;
    const timestamp = typeof ticketSalesStart === 'string' && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(ticketSalesStart)
        ? Date.parse(ticketSalesStart) : NaN;
    return {
        ...(Number.isFinite(timestamp) ? { validFrom: ticketSalesStart } : {}),
        ...(!Number.isFinite(timestamp) || timestamp <= now ? { availability: 'https://schema.org/InStock' } : {}),
    };
}
