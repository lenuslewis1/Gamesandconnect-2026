# Public form capture

Verified locally and against the connected Games Supabase project on 2026-10-17.

| Public submission | Storage | Admin location |
| --- | --- | --- |
| Contact message | `contact_messages` | `/admin/contact-messages`, with read/unread status and pagination |
| Corporate service enquiry | `corporate_enquiries` | `/admin/corporate-enquiries` |
| Paid event details, including abandoned payment | `registrations`, pending until payment confirmation | `/admin/registrations`, Ticket Sales |
| Free event booking and historical event form records | `event_registrations` | `/admin/registrations`, Event form records |
| Account signup | `auth.users`, with an internal profile trigger | `/admin/users` |

Existing team records remain under `/admin/teams` and payments under `/admin/payments`. The current public team pages contain links rather than a team signup form. The unused `components/home/Newsletter.tsx` component is not mounted on any route, so there is no active newsletter form to submit. External WhatsApp links, telephone calls, and emails composed outside the site do not submit a site form.

Contact success appears only after the database accepts the message. Errors preserve the entered text and allow retry. Paid-event details are stored before moving to mobile-money payment, and failed payment retries reuse that registration. Event form records may duplicate paid bookings; the Admin section explicitly identifies these as form records rather than additional sales.

## Verification

- A synthetic contact message was submitted through the browser and found in the live database. The synthetic row was then removed by its exact ID, email, and message.
- A simulated contact failure retained entered fields, followed by a successful retry.
- SQL checks using the authenticated role and approved administrator claims could read the message and update `is_read`. An ordinary authenticated visitor could not read it.
- A corporate enquiry inserted as `anon` was visible with administrator claims inside a rolled-back transaction.
- A synthetic auth user created a profile with role `user` inside a rolled-back transaction. Existing missing profiles were backfilled without changing existing roles.
- A restrictive profile policy rejected a synthetic user's attempt to change their own role to `admin`; the profile stayed `user` and the test transaction was rolled back.
- Mocked browser checks verified Admin inbox rendering, read status, record counts, free-event records, pending paid-booking capture, and two payment failures reusing one registration. These checks did not charge money, send SMS, or sign in to a live administrator account.
- The production build passed with 46 prerendered public pages.

## Existing database access concerns

The project advisor reported pre-existing exposed `admin_user_emails` view, executable definer functions, and other project configuration warnings. Separate inspection also found broad public policies on `registrations` and `event_registrations`. The existing payment clients depend on reading/updating these records, so restricting those tables requires a separate payment API change rather than merely hiding Admin links. These findings predate this task; the new contact inbox restricts access to the existing approved administrators, and signup profile writes are internal with browser role assignment blocked.

Relevant Supabase guidance: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [exposed auth-user view remediation](https://supabase.com/docs/guides/database/database-linter?lint=0002_auth_users_exposed).

The database migrations are applied. Frontend changes still need publishing before the public site uses the new capture paths.
