# Games & Connect page migration

The existing homepage is retained in `src/App.jsx`. All old routes are registered in `src/legacy/App.tsx`; legacy components, content, assets, hooks, and admin screens are retained under `src/legacy`.

The common navigation and footer live in `src/SiteChrome.jsx`. New page styling is in `src/site.css`; scoped homepage styling is in `src/home.css`. `src/styles.css` preserves the original homepage stylesheet for reference. The shared page hero is `src/legacy/components/layout/PageHeader.tsx`.

## Coverage

- Home, About, Events and event details, Game Day, Contact, Travel, Community, Gallery, Trivia, Teams and all four team details, and sign-in.
- Team Building, Games Day Accra, Corporate Events, Outdoor Adventures, and What Is Games & Connect.
- Blog index and all three original articles.
- Admin login/signup routing, dashboard, teams, registrations, payments, users, events, gallery, team gallery, and Game Day management.
- Original not-found route. All original URL patterns are preserved.

## Runtime

Use `npm run dev` for development, `npm run build` for a production build, and `npm run preview` for the built site. Existing Sites worker and packaging scripts are retained. `npm run test:sites` verifies static files and route fallback.

The local `.env.local` retains only the existing public Supabase URL and anonymous client key. These must also be configured in a deployment environment. No server credentials are included. Database, payment functions, storage, and authorization rules are unchanged. Public event data is verified live; account creation, payment transactions, and authenticated admin mutations were not executed.

Contact now opens an email draft addressed to gamesandconnectgh@gmail.com instead of falsely reporting a sent message. The About contact action leads to this form. Homepage experience links lead to the migrated routes.

## Verification

Production build and all four Sites worker tests pass. Browser checks covered public routes, event details and booking-dialog entry, all four team pages, three blog articles, authentication pages, and 404 handling. All nine protected admin routes redirect signed-out visitors to login. Public page layouts and mobile menu were checked at 390px, with the contact email overflow corrected.

The site is implemented locally; it has not been published. Some source photography remains hosted on Cloudinary, as on the old website.
