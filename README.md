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

## Search and sharing

`npm run build` now prerenders the public pages and blog articles, then writes a sitemap from the actual rendered routes. Public event detail links found on the events listing are included. Each page ships readable HTML, canonical URLs, Open Graph and Twitter cards before JavaScript runs. The 1200 × 630 sharing image is generated at `/og-image.png` in the brand palette using existing photography.

The build uses installed Google Chrome on Windows. On Linux/macOS, run `npx playwright install chromium` once before building (Netlify does this automatically). Linux hosts without browser system libraries also need `npx playwright install-deps chromium`. Browser download access is required on the build host.

Run `npm run test:seo` and `npm run test:sites` after building. Run `node scripts/verify-seo-browser.mjs` for browser checks. Page content continues to refresh from the existing backend after JavaScript mounts; rebuild after publishing events or editing articles so crawler HTML and the sitemap stay current. Only anonymous public content is captured; no admin credentials are used. If public event data is unavailable at build time, dynamic event URLs cannot be discovered and will not be in that build's sitemap.

Netlify serves prerendered files first and uses `/app.html` for dynamic paths. The existing Sites worker is preserved; its fallback still uses the homepage index for paths without a generated file. Canonicals use the existing production domain, `https://gamesandconnect.com`.

After deployment, submit `/sitemap.xml` through Google Search Console and Bing Webmaster Tools, inspect representative URLs, and refresh cached previews in the Facebook Sharing Debugger and LinkedIn Post Inspector. These account-level actions are not performed by the build. Unknown routes are marked noindex in the app; the SPA host still returns HTTP 200 for fallback paths, so full HTTP 404 handling remains a hosting improvement.

AEO follows the same content and crawlability foundation as SEO: concise visible answers, FAQ markup matching the homepage answers, organization identity, article metadata, and internal links. No ranking or AI citation is guaranteed. References: https://developers.google.com/search/docs/appearance/ai-features and https://ogp.me/.
