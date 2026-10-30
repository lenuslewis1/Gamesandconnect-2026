# Prototype Instructions
Keep decorative patterns subtle: forest silhouettes along the bottom of the experiences section and footer, and botanical line patterns on the step cards. Preserve readable copy and existing motion.
Hero motion now follows the live TikTok for Business reference: pin a single viewport, fade copy early, shrink the original image into a centered portrait, reveal six surrounding images, then release the composition. Keep Games & Connect branding and reduced-motion fallback.
Public secondary pages should match the homepage: inset rounded photographic heroes, centered editorial headings, light spacious content, forest/lime actions, and consistent shared navigation/footer. Preserve page content, booking/forms, and homepage scroll choreography.

Brand colors: use the user's September 6, 2026 reference palette: lime #A6F15D, forest #0F3D2E, warm paper #F5F2E9, and neutrals #E6EAE6, #B9C5BC, #606E64, #0B1B14. Keep the page shell light; use forest for dark sections and lime for highlights and primary actions. Keep white for text and borders that need contrast over dark imagery. Color changes preserve existing layout, photography, and scroll interactions. Shared palette overrides live in src/theme.css.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

Primary navigation uses a Media tab containing Blog posts and Gallery. Keep both destinations accessible in desktop and mobile navigation.

Generate event links from the event title only with `eventPath` in `src/legacy/lib/eventLinks.mjs`; do not append database IDs. Resolve names before legacy IDs, redirect numeric and old name-plus-ID links to the current canonical URL, and preserve query strings and hashes. A recurring event with the same name opens its latest edition.

Do not show an Admin link or button in public navigation or the footer. Admin pages remain available through their direct URLs.

The corporate page uses proposal CTAs opening the Games Day Brief modal, based on the supplied corporate brief PDF, rather than an inline form. Keep all four rounds and direct enquiry submission; save the full brief with the corporate enquiry.

Articles are managed at `/admin/articles` and stored in Supabase `blog_posts`. Public blog pages must read published database records, without falling back to static articles that could restore unpublished stories. Keep existing article slugs fixed. The source-file archive can be imported idempotently with `scripts/import-legacy-articles.mjs`; preserve existing database records on slug conflicts.

Trip booking payments let visitors choose any positive amount in pesewas up to the booking total. Do not reintroduce a fixed deposit percentage. Show the chosen payment and remaining balance, and preserve the full booking total in Admin.
