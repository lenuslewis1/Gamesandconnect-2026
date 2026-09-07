# Games & Connect

React/Vite website with the Games & Connect homepage, public pages, gallery, event booking UI, and existing administration screens.

## Development

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and provide the existing project's public Supabase URL and anonymous key.
3. Run `npm run dev`.

## Build and hosting

- `npm run build` produces `dist/client` and the existing Sites worker package.
- `npm run test:sites` checks static serving and SPA fallbacks.
- Netlify uses the included `netlify.toml`: build command `npm run build`, publish directory `dist/client`.
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on the frontend host. Never expose server credentials through `VITE_` variables.

See `INTEGRATIONS.md` for the retained backend integrations and operational limitations. Publishing this repository does not deploy Supabase functions or run database migrations.

## Navigation checks

With the app running on port 5173, the scripts `scripts/audit-navigation.js` and `scripts/audit-interactions.js` can be passed to Playwright CLI's `run-code --filename` command. They inspect public routes and test non-submitting interactions. They do not complete purchases, registrations, emails, or admin writes.

The community CTA currently requests a WhatsApp invite from the listed contact number. Replace it with the official community invite when available. Contact prepares an email draft; sending is completed in the visitor's email app.
