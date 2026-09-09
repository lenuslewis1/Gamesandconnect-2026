import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4173 } });
const origin = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch(process.platform === 'win32' ? { channel: 'chrome' } : {});
try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.route(/googletagmanager\.com|google-analytics\.com/, route => route.abort());
    const page = await context.newPage();
    await mkdir('output/seo', { recursive: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/about');
    await page.waitForFunction(() => document.querySelector('link[rel="canonical"]')?.href.endsWith('/about'));
    await page.locator('.gc-logo').first().click();
    await page.waitForFunction(() => document.querySelector('link[rel="canonical"]')?.href === 'https://gamesandconnect.com/');
    assert.equal(await page.locator('head meta[name="description"]').count(), 1);
    assert.equal(await page.locator('head meta[property="og:title"]').count(), 1);
    const media = page.getByRole('button', { name: 'Media', exact: true });
    await media.focus();
    await page.keyboard.press('Enter');
    assert.equal(await media.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await media.getAttribute('aria-expanded'), 'false');
    await media.click();
    await page.locator('#media-navigation').getByRole('link', { name: 'Blog posts' }).click();
    await page.waitForURL('**/blog');
    await page.waitForFunction(() => document.querySelector('.gc-media-toggle')?.dataset.active === 'true');
    assert.equal(await page.locator('main a[href="/blog/how-to-meet-people-in-accra"]').count(), 1);
    await page.screenshot({ path: 'output/seo/media-blog-desktop.png' });
    await page.locator('.gc-logo').first().click();
    await page.waitForURL(origin + '/');
    await page.locator('.faq button').nth(1).click();
    assert.equal(await page.locator('.faq button').nth(1).getAttribute('aria-expanded'), 'true');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await mkdir('output/seo', { recursive: true });
    await page.screenshot({ path: 'output/seo/home-mobile.png' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await page.getByRole('button', { name: 'Open menu' }).click();
    const mobileMedia = page.locator('#mobile-navigation').getByRole('region', { name: 'Media' });
    assert.equal(await mobileMedia.getByRole('link').count(), 2);
    await page.screenshot({ path: 'output/seo/media-mobile-menu.png' });
    await mobileMedia.getByRole('link', { name: 'Gallery', exact: true }).click();
    await page.waitForURL('**/gallery');
    await page.locator('#mobile-navigation').waitFor({ state: 'detached' });
    for (const slug of ['how-to-meet-people-in-accra', 'first-game-day-accra-guide', 'corporate-team-building-accra-planning-checklist', 'what-to-pack-group-trip-ghana']) {
        await page.goto(origin + '/blog/' + slug, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(slug => document.querySelector('link[rel="canonical"]')?.href.endsWith('/blog/' + slug), slug);
        assert.ok((await page.locator('article.prose').innerText()).split(/\s+/).length > 300);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    }
    await page.screenshot({ path: 'output/seo/article-mobile.png' });
    await page.goto(origin + '/auth');
    await page.waitForFunction(() => document.querySelector('meta[name="robots"]')?.content.includes('noindex'));
    await page.goto(origin + '/missing-seo-check');
    await page.waitForFunction(() => document.title.startsWith('Page not found'));
    assert.ok((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
    await page.goto(origin + '/about?utm_source=test');
    await page.waitForFunction(() => document.querySelector('link[rel="canonical"]')?.href === 'https://gamesandconnect.com/about');
    assert.ok(!(await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJS.newPage();
    await staticPage.goto(origin + '/team-building/');
    assert.ok((await staticPage.locator('main').innerText()).length > 500);
    assert.equal(await staticPage.locator('head meta[property="og:title"]').count(), 1);
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('Browser SEO checks passed: route transitions, unique metadata, FAQ interaction, mobile overflow, noindex, query canonical, and content without JavaScript.');
} finally {
    await browser.close();
    await new Promise(resolve => server.httpServer.close(resolve));
}

