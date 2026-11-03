# Community members

The supplied `contacts_import.csv` was imported into the live Games and Connect Supabase project (`fxqzihpsasuerpfjzwfr`) on November 3, 2026.

Verified live database totals:

- 123 source records preserved in `public.community_members`.
- 105 unique normalized Ghana phone numbers linked to `public.website_contacts` with source `community_members`.
- 118 source rows have email addresses. No birth dates were supplied.
- 18 rows repeat a phone number. The original records, including differing names and emails, remain intact. SMS uses one contact per number.
- Public reads are denied; row-level security permits the existing approved administrators to read member records.

The migration `20261103161618_website_contacts_bulk_sms.sql` and new migration `20261103163352_community_members_import.sql` were applied in the same transaction as the import, using the signed-in Supabase SQL Editor. Both migrations were recorded in `supabase_migrations.schema_migrations`. The file fingerprint is `580f8d5b6ccaed197d75aa8d89f3281e9fb6c427f15617e555c84b3e534a59c7`.

The new admin screen is `/admin/community-members`, with search and pagination for all original records. Its Contacts & SMS link opens the `Community members` audience. These frontend changes remain local until the website is deployed. Importing records does not send SMS or create website login accounts.

## Import handling

`node scripts/prepare-community-import.mjs <path-to-csv>` prepares a validated SQL import and aggregate report under ignored `output/community-members/`. The script does not connect to the live database. Original contact details and generated SQL containing personal data must stay outside Git and public build assets.

Source records are keyed by the file's SHA-256 fingerprint and CSV record number. Reimporting the same file does not create duplicate source records. Different files are retained as separate source batches. A database trigger links each record to the SMS list by normalized phone number, preserving existing contact names, emails, phone formatting and SMS exclusions; missing names or emails may be filled from the import. The original CSV fields are preserved in `source_record`.

`npm run test:community` verifies quoted CSV handling, original-data retention, SQL escaping, duplicate imports, SMS exclusions and admin-only access in an in-memory PostgreSQL engine. The private import was also reconciled against 123 source records and 105 contacts in memory before being run live.

The browser audit `scripts/audit-community-members.js` uses synthetic records and verifies member search, all three pages of a 123-record dataset, mobile layout, and the SMS audience link. No customer messages are sent by these checks.
