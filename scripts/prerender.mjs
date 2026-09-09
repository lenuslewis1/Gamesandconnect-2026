import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist/client');
const shell = await readFile(path.join(dist, 'index.html'), 'utf8');
const routes = ['/', '/about', '/events', '/game-day', '/contact', '/travel', '/community', '/gallery', '/teams', '/teams/red', '/teams/green', '/teams/blue', '/teams/yellow', '/trivia', '/team-building', '/games-day-accra', '/corporate-events', '/outdoor-adventures', '/about/what-is-games-and-connect', '/blog'];
for (const file of ['blogData.ts', 'communityArticles.ts', 'planningArticles.ts']) {
    const source = await readFile(path.join(root, 'src/legacy/data', file), 'utf8');
    for (const match of source.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) routes.push(`/blog/${match[1]}`);
}
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(dist, '.' + pathname);
    if (!file.startsWith(dist + path.sep) && file !== dist) { response.writeHead(403).end(); return; }
    try {
        if (!(await stat(file)).isFile()) throw new Error('route');
        response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
        response.end(await readFile(file));
    } catch {
        if (path.extname(pathname)) { response.writeHead(404).end(); return; }
        response.setHeader('Content-Type', 'text/html');
        response.end(shell);
    }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const pages = new Map();
try {
    browser = await chromium.launch(process.platform === 'win32' ? { channel: 'chrome' } : {});
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    // Analytics must not count build visits. Only public, anonymous pages are captured.
    await context.route(/googletagmanager\.com|google-analytics\.com/, route => route.abort());
    const page = await context.newPage();
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.setContent(`<html><body style="margin:0;background:#0F3D2E;color:white;font-family:Arial,sans-serif"><div style="width:1200px;height:630px;display:flex;overflow:hidden"><div style="width:610px;box-sizing:border-box;padding:58px 48px;position:relative"><p style="font-size:24px;font-weight:bold;margin:0 0 60px;color:#A6F15D">GAMES &amp; CONNECT</p><h1 style="font-size:82px;line-height:1.02;letter-spacing:-4px;margin:0 0 30px">Play. Travel.<br>Connect.</h1><p style="font-size:25px;line-height:1.4;max-width:480px">Game days, group trips and<br>real connection in Ghana.</p><p style="color:#A6F15D;font-size:20px;margin-top:44px">gamesandconnect.com</p></div><img src="${origin}/assets/games-connect/play-accra.png" style="width:590px;height:630px;object-fit:cover" /></div></body></html>`);
    await page.locator('img').evaluate(image => image.decode());
    await page.screenshot({ path: path.join(dist, 'og-image.png') });
    await page.setViewportSize({ width: 1440, height: 1000 });
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    for (let index = 0; index < routes.length; index++) {
        const route = routes[index];
        if (pages.has(route)) continue;
        failures.length = 0;
        await page.goto(`http://127.0.0.1:${server.address().port}${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(expected => document.querySelector('link[rel="canonical"]')?.href === `https://gamesandconnect.com${expected}` && document.querySelector('main'), route);
        // Allow public data requests to settle without depending on analytics or image downloads.
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        if (failures.length) throw new Error(`${route}: ${failures.join('; ')}`);
        if (route === '/events') {
            const eventRoutes = await page.locator('main a[href^="/events/"]').evaluateAll(links => links.map(link => new URL(link.href).pathname));
            for (const eventRoute of new Set(eventRoutes)) if (!routes.includes(eventRoute)) routes.push(eventRoute);
        }
        const html = await page.evaluate(() => {
            const doc = document.documentElement.cloneNode(true);
            // Reveal animations should never hide the non-JavaScript version of the content.
            doc.querySelectorAll('#root [style]').forEach(element => {
                for (const key of ['opacity', 'visibility', 'transform', 'clip-path']) element.style.removeProperty(key);
            });
            return '<!doctype html>\n' + doc.outerHTML;
        });
        pages.set(route, html);
        console.log(`Prerendered ${route}`);
    }
    for (const [route, html] of pages) {
        const folder = path.join(dist, route.slice(1));
        await mkdir(folder, { recursive: true });
        await writeFile(path.join(folder, 'index.html'), html);
    }
    // SPA fallback stays generic; unknown URLs must never inherit homepage metadata/content.
    const fallback = shell.replace('</head>', '<meta name="robots" content="noindex, follow" data-rh="true" /></head>');
    await writeFile(path.join(dist, 'app.html'), fallback);
    await writeFile(path.join(dist, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...pages.keys()].map(route => `  <url><loc>https://gamesandconnect.com${route}</loc></url>`).join('\n') + '\n</urlset>\n');
    console.log(`SEO build complete: ${pages.size} public pages and sitemap.`);
} finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
}
