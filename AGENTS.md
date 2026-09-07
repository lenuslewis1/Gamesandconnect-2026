# Prototype Instructions
Keep decorative patterns subtle: forest silhouettes along the bottom of the experiences section and footer, and botanical line patterns on the step cards. Preserve readable copy and existing motion.
Hero motion now follows the live TikTok for Business reference: pin a single viewport, fade copy early, shrink the original image into a centered portrait, reveal six surrounding images, then release the composition. Keep Games & Connect branding and reduced-motion fallback.
Public secondary pages should match the homepage: inset rounded photographic heroes, centered editorial headings, light spacious content, forest/lime actions, and consistent shared navigation/footer. Preserve page content, booking/forms, and homepage scroll choreography.

Brand colors: use the user's September 6, 2026 reference palette: lime #A6F15D, forest #0F3D2E, white #FFFFFF, and neutrals #F6F7F6, #E6EAE6, #B9C5BC, #606E64, #0B1B14. Keep the page shell light; use forest for dark sections and lime for highlights and primary actions. Color changes preserve existing layout, photography, and scroll interactions. Shared palette overrides live in src/theme.css.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
