# Website contacts and bulk SMS

Admin **Contacts & SMS** is available at `/admin/sms` after deployment. It combines contact form submissions, corporate enquiries, bookings, event and team registrations, and account profiles. The contact form now accepts an optional phone number. Email-only contacts remain visible but cannot be selected for SMS.

The database migration backfills existing records and adds private capture triggers for future submissions. Contacts sharing a normalized Ghana phone number are merged, their source labels are combined, and their SMS exclusion setting is preserved. Contacts without a supported phone number remain saved. The feature does not subscribe contacts to an external BMS contact group.

## Sending

Search contacts or filter by source and SMS availability. Select recipients across pages, up to 500 contacts per campaign. Compose the message and review its text, unique phone count, sender, and estimated credit usage before sending. GSM extension characters and Unicode are included in multipart estimates. Final charges and delivery results are determined by BMS Africa.

The `bulk-sms` Edge Function verifies the caller with Supabase Auth and checks the existing administrator email allowlist. It resolves numbers and SMS preferences from stored contacts immediately before sending; the browser cannot supply arbitrary recipient numbers. Campaign history is admin-readable but can only be written server-side. A unique campaign UUID is claimed before contacting BMS, preventing repeated or concurrent submissions of the same reference from sending twice. The browser retains an unresolved reference across reloads. Provider timeouts are recorded as unknown; they never trigger automatic retransmission. BMS acceptance is distinct from handset delivery.

## Activation status

The contact and campaign database migration was applied to production on November 3, 2026, together with the community-member import described in `community-members.md`. Existing website submissions were backfilled. The dashboard code and bulk sending function have been verified locally; their deployment remains pending. No live SMS was sent. The previously inspected BMS account had no API keys; key creation approval remains pending.

To activate using an authorized Supabase administrator session:

1. The migration `supabase/migrations/20261103161618_website_contacts_bulk_sms.sql` has already been applied to Games and Connect project `fxqzihpsasuerpfjzwfr` and recorded in its migration history. Do not reapply it. The repository contains partial historical migrations; do not reset the database or blindly push all old migrations.
2. Create the dedicated BMS key after approval, verify an approved sender ID of at most 11 characters, and save `BMS_API_KEY` and `BMS_SENDER_ID` as Supabase Edge Function secrets. Never prefix either with `VITE_` or commit their values. Both the confirmation and bulk functions share these secrets.
3. Deploy `bulk-sms` with JWT verification enabled. Deploy the separately prepared `send-confirmation-email` change when ready to switch registration notifications as well.
4. Deploy the frontend only after the contact-message phone column and contact tables are present.
5. Sign in as an allowed admin and verify contact backfill, restricted access, and a controlled SMS delivery report. Recheck the provider history before retransmitting any unknown or stuck campaign.

## Verification

`npm run test:sms` runs provider-contract, authorization, idempotency, credit-estimate, and real PostgreSQL-engine migration/RLS tests using PGlite in memory. It uses synthetic data and mocked SMS requests.

`scripts/audit-bulk-sms.js` is a Playwright CLI audit (`run-code --filename scripts/audit-bulk-sms.js`) against the local Vite server. It intercepts Supabase calls with synthetic contacts and verifies selection, disabled recipients, review cancellation, mock send history, exclusions, filtering, mobile layout and the contact form phone payload. Screenshots are written to ignored `output/playwright/`. The audit does not use a live admin login or contact BMS.
