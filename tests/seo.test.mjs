import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dist = new URL('../dist/client/', import.meta.url);
const read = name => readFile(new URL(name, dist), 'utf8');
const sitemap = await read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);

test('every sitemap URL has unique metadata and crawlable content without JavaScript', async () => {
    assert.ok(urls.length >= 27);
    assert.equal(new Set(urls).size, urls.length);
    const titles = new Set();
    for (const url of urls) {
        const pathname = new URL(url).pathname;
        assert.ok(!/^\/(admin|auth)/.test(pathname));
        const html = await read(pathname.slice(1) + (pathname === '/' ? '' : '/') + 'index.html');
        const head = html.split('</head>')[0];
        assert.equal((head.match(/<title\b/g) || []).length, 1, pathname);
        assert.equal((head.match(/name="description"/g) || []).length, 1, pathname);
        assert.equal((head.match(/rel="canonical"/g) || []).length, 1, pathname);
        assert.ok(head.includes(`href="${url}"`), pathname);
        for (const property of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:image:alt']) {
            assert.equal((head.match(new RegExp(`property="${property}"`, 'g')) || []).length, 1, `${pathname} ${property}`);
        }
        assert.ok(head.includes('name="twitter:card"'), pathname);
        assert.ok(!head.includes('noindex'), pathname);
        assert.ok(html.includes('<h1'), pathname);
        assert.ok(html.includes('<main'), pathname);
        const title = head.match(/<title[^>]*>(.*?)<\/title>/s)[1];
        assert.ok(!titles.has(title), `${pathname}: duplicate title`);
        titles.add(title);
        for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) {
            const schema = JSON.parse(match[1]);
            assert.equal(schema['@context'], 'https://schema.org');
            assert.ok(schema['@type']);
        }
    }
});

test('home answers match its FAQ schema and shared image is 1200 by 630', async () => {
    const html = await read('index.html');
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
    const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
    assert.ok(faq.mainEntity.length >= 4);
    for (const question of faq.mainEntity) {
        assert.ok(html.includes(question.name));
        assert.ok(html.includes(question.acceptedAnswer.text));
    }
    assert.ok(html.includes('https://gamesandconnect.com/og-image.png'));
    const png = await readFile(new URL('og-image.png', dist));
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
});

test('fallback and crawler policy protect account pages', async () => {
    const fallback = await read('app.html');
    assert.ok(fallback.includes('noindex, follow'));
    assert.ok(!fallback.includes('rel="canonical"'));
    const robots = await read('robots.txt');
    assert.equal((robots.match(/User-agent:/g) || []).length, 1);
    assert.ok(robots.includes('Disallow: /admin'));
    assert.ok(robots.includes('Disallow: /auth'));
});
