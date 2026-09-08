# Mobile QA — September 7, 2026

Tested the local Vite site with Chromium at 360, 390, and 430 CSS pixels wide, plus a touch-enabled 390 × 844 mobile browser context. This is browser emulation, not physical-device or Safari certification.

## Layout coverage

Home, About, Events, Savannah event details, Gallery, Contact, Community, Travel, Teams, and Blog: 30 page/width checks. After fixes, none produced page-level horizontal overflow and no JavaScript page errors were recorded. Gallery category buttons intentionally scroll within their own row.

## Fixes

- Removed Contact and narrow Community CTA overflow.
- Made mobile gallery filters a compact horizontal row and improved natural-aspect photo viewing.
- Removed the duplicate gallery close control and enlarged the remaining mobile close target.
- Improved event-hero contrast and title sizing.
- Increased small mobile link targets and form text sizing.
- Locked background scroll while the menu is open; selecting the current route also closes it.
- Kept booking dialogs within the dynamic viewport and scrollable.

## Interaction coverage

Touch menu opening/closing, current-route selection, scroll restoration, far-end gallery category selection, photo viewing/closing, booking dialog opening and input sizing, booking action reachability, and reduced-motion hero fallback. No real registrations, messages, or payments were submitted.

`npm run build` and all four `npm run test:sites` tests pass. Vite still reports the existing large-chunk warning; slow-network performance and real-device keyboard behavior remain unmeasured.

Screenshots are in the ignored `output/playwright/` directory. Reproducible checks: `scripts/audit-mobile.js` and `scripts/audit-mobile-flows.js`, using Playwright CLI `run-code --filename` while the app runs on port 5173.

Changes are local and have not been pushed or deployed.
