# Integrations carried forward

The new frontend connects to the same existing Supabase project, `fxqzihpsasuerpfjzwfr`. No database migration or backend redeployment is required to use the already-hosted integrations. Existing customer data and hosted provider secrets remain in that project.

| Integration | New project location | Verification |
| --- | --- | --- |
| Supabase database, authentication and admin realtime updates | `src/legacy/lib/supabase.ts`, hooks, AuthProvider, admin pages | Auth settings and nine public data endpoints return 200 |
| Event registration, ticket tiers, free and pay-later bookings | `src/legacy/components/events/BookingModal.tsx` | Existing implementation retained, including notification calls |
| DCM mobile-money payment initiation | `supabase/functions/pay` and payment components | Hosted function preflight returns 200 |
| Payment verification and callbacks | `supabase/functions/verify-payment`, `payment-callback` | Both hosted function preflights return 200; callback remains on Supabase |
| Cloudinary uploads | `src/legacy/lib/cloudinary.ts`, `supabase/functions/cloudinary-upload` | Hosted preflight returns 200; existing image URLs preserved |
| Resend confirmation email and Hubtel customer/admin SMS | `supabase/functions/send-confirmation-email` | Hosted preflight returns 200; delivery not exercised |
| Supabase gallery storage, team content and scores | Existing hooks and admin/gallery screens | Public gallery, team and scoreboard queries return 200 |
| WhatsApp/social links and SEO structured data | Existing page content and SEO components | Preserved from migrated source |
| Netlify build, SPA routes and security headers | `netlify.toml` | Adapted to `dist/client`; existing Sites packaging is also retained |

## Configuration

Frontend configuration remains in the ignored root `.env.local`: only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required. Configure these public values on the eventual frontend host.

Available old server configuration has been copied to the ignored `supabase/functions/.env.local`. The old file contains payment settings, but its Cloudinary and Resend values are blank, and it has no Hubtel credentials. This does not establish whether hosted secrets exist. Their values should remain server-side; never add a `VITE_` prefix to provider or service-role credentials. Required names are listed in `supabase/functions/.env.example`.

All five backend function source folders, the two original migration files, and local Supabase configuration are now included. Local Auth URLs use ports 5173 and 4173; the reference to a nonexistent seed file was removed. These local config settings do not alter the hosted project's Auth configuration.

The copied migrations are the old checkout's partial history, not a complete database export. Do not use them as a replacement database schema or reset the live database. The installed Supabase connector cannot manage this project, so deployed function versions, hosted secrets, and Auth redirect allowlists could not be inspected or changed.

## Known inherited limitation

The copied confirmation function still uses `onboarding@resend.dev`. That is Resend's testing sender, so general customer email delivery should not be considered ready until a verified sending domain is configured. Historical notes also flagged domain verification as pending; current domain status is unverified. The copied SMS sender defaults to `SmartAscend` unless the hosted `HUBTEL_SENDER_ID` overrides it. No external messages or payments were sent during migration.

## Verification

Run `npm run check:integrations` for read-only service checks. Use `npm run check:integrations -- --retry-failed` to retry only failed requests. The report is saved to `output/integration-status.json` and contains no credential values or customer records. Function preflights confirm reachability/CORS only, not payment completion, successful uploads, or email/SMS delivery.

The new sign-in flow now sends ordinary members to Events and retains the admin route for allowed admins. Signup handles both immediate sessions and email-confirmation responses. Contact remains an explicit email-draft flow because the old contact form had no sending integration.

Before changing the public hostname, verify its Auth redirect allowlist in the existing Supabase project. Actual payment, upload, notification delivery, and authenticated admin writes still need an authorized operational test. This migration does not publish the frontend or alter provider accounts.
