async (page) => {
  const queue = ['/'];
  const seen = new Set();
  const results = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  while (queue.length && seen.size < 80) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    await page.goto('http://127.0.0.1:5173' + path);
    await page.waitForTimeout(800);
    const data = await page.evaluate(() => ({
      title: document.title,
      text: document.body.innerText.slice(0, 350),
      links: [...document.querySelectorAll('a')].map(a => ({text: a.textContent.trim() || a.getAttribute('aria-label'), href: a.getAttribute('href')})),
      buttons: [...document.querySelectorAll('button')].map(b => ({text: b.textContent.trim() || b.getAttribute('aria-label'), disabled: b.disabled})),
    }));
    results.push({path, ...data});
    for (const {href} of data.links) {
      if (href?.startsWith('/') && !href.startsWith('//') && !href.startsWith('/admin') && !seen.has(href)) queue.push(href);
    }
  }
  return {results: results.map(({path, title, text, links, buttons}) => ({path, title, text, buttons, links: links.filter(l => /^\/(events|teams)\//.test(l.href) || !l.href || l.href === '#' || /your-community/.test(l.href))})), errors};
}
