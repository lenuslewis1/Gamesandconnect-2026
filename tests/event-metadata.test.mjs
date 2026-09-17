import test from 'node:test';
import assert from 'node:assert/strict';
import { eventDates, eventMetadata, offerFields } from '../src/legacy/components/seo/eventMetadata.mjs';

test('known time ranges produce Ghana datetimes, including noon and midnight', () => {
    assert.deepEqual(eventDates('2026-08-29', '4:00 PM - 8:00 PM'), {
        startDate: '2026-08-29T16:00:00+00:00', endDate: '2026-08-29T20:00:00+00:00',
    });
    assert.equal(eventDates('2026-08-29', '12 AM – 12 PM').endDate, '2026-08-29T12:00:00+00:00');
    assert.equal(eventDates('2026-08-29', '22:00 - 02:00').endDate, '2026-08-30T02:00:00+00:00');
});
test('missing or ambiguous hours are not invented', () => {
    for (const range of ['2am', '6:00 AM - Evening', '9 - 6', '25:00 - 28:00']) {
        assert.deepEqual(eventDates('2026-09-18', range), { startDate: '2026-09-18' });
    }
});
test('multi-day trips preserve the published end date without fabricating return times', () => {
    const event = { id: 40, date: '2026-09-18' };
    assert.deepEqual(eventDates(event.date, '2am', eventMetadata(event).endDate), {
        startDate: '2026-09-18', endDate: '2026-09-20',
    });
    assert.equal(eventMetadata({ id: 35, date: '2026-03-07' }).endDate, '2026-03-08');
    assert.equal(eventMetadata({ id: 40, date: '2027-09-18' }).endDate, undefined);
});
test('active booking offers have availability; completed events have no ticket offer', () => {
    assert.deepEqual(offerFields({ bookingOpen: true }), { availability: 'https://schema.org/InStock' });
    assert.equal(offerFields({ bookingOpen: false }), undefined);
});
test('only explicit ticket-sale dates become validFrom', () => {
    const now = Date.parse('2026-09-17T00:00:00Z');
    assert.deepEqual(offerFields({ bookingOpen: true, ticketSalesStart: '2026-09-01T12:00:00Z', now }), {
        validFrom: '2026-09-01T12:00:00Z', availability: 'https://schema.org/InStock',
    });
    assert.deepEqual(offerFields({ bookingOpen: true, ticketSalesStart: '2026-09-18T12:00:00Z', now }), {
        validFrom: '2026-09-18T12:00:00Z',
    });
    assert.equal(offerFields({ bookingOpen: true, ticketSalesStart: 'not a date' }).validFrom, undefined);
    assert.equal(eventMetadata({ created_at: '2026-07-25T00:00:00Z' }).ticketSalesStart, undefined);
});
test('an organiser is not automatically a performer', () => {
    assert.deepEqual(eventMetadata({ organizer: 'Games and Connect' }).performers, []);
});
