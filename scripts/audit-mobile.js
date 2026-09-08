async (page) => {
  const results = [];
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({width, height:844});
    for (const path of ['/', '/about', '/events', '/events/40', '/gallery', '/contact', '/community', '/travel', '/teams', '/blog']) {
      await page.goto('http://127.0.0.1:5173' + path);
      await page.waitForTimeout(700);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        offenders: [...document.querySelectorAll('main *')].filter(el => {
          const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
          return r.width && (r.right > innerWidth + 2 || r.left < -2) && s.position !== 'absolute' && s.visibility !== 'hidden';
        }).slice(0, 8).map(el => ({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,50)})),
      }));
      results.push({width,path,...metrics});
      if(width===390) await page.screenshot({path:'output/playwright/mobile-' + (path.replaceAll('/','-') || 'home') + '.png'});
    }
  }
  return {results,errors};
}
