# Event structured data follow-up

Reviewed against Google's Event documentation on 17 September 2026:
https://developers.google.com/search/docs/appearance/structured-data/event

## Implemented

- Parse unambiguous time ranges into Ghana start/end datetimes, including overnight ranges.
- Preserve date-only values when precise times are unknown.
- Use source-backed multi-day dates: Savannah (18–20 September, existing public flyer), Camp by the River (two-day description), Cape Coast (Friday/Saturday itinerary). Overrides are guarded by the original start date so rescheduling cannot reuse stale dates.
- Display the multi-day date range on the event detail page.
- Emit offers only while the existing booking action is open. Completed events retain Event markup without an obsolete ticket offer.
- Include InStock for current open bookings. The current site has no authoritative public sold-out flag; future stock controls must feed both the booking UI and schema.
- Accept explicit ticket-sale opening timestamps and actual Person/PerformingGroup performer names through the metadata adapter.

## Facts still needed

The public event records have no ticket-sale opening dates or named performers. `created_at` is not proof of when sales began (some historical events were entered after their event date). Do not use the build date either. An organiser is not automatically a performer.

The adapter supports optional `end_date`, `ticket_sales_start`, and `performers` properties, but no database columns or records were changed. Before populating these in future, confirm the facts, persist them through the event-management flow, and show performer and sales details on the visible event page as well. For events without performers or date-restricted sales, the corresponding optional warnings can remain.

## Validation and release

`npm run test:seo` includes time-range, overnight, multi-day, booking-state and missing-fact regression tests. `npm run build` regenerates the HTML used by crawlers.

After deployment, inspect event URLs with Google's Rich Results Test and request validation in Search Console. Local validation does not clear Google's stored warning report; Google must recrawl the deployed changes. Rebuild when booking status or event details change so static metadata does not become stale.
