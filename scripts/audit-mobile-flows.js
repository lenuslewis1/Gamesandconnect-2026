async (desktopPage) => {
  const context = await desktopPage.context().browser().newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2});
  const page = await context.newPage();
  const checks = [];
  const check = (name, pass) => { checks.push({name,pass}); if(!pass) throw new Error(name); };
  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(1500);
    await page.getByRole('button',{name:'Open menu'}).tap();
    check('Touch menu opens and background locks', await page.evaluate(()=>document.body.style.overflow==='hidden'));
    await page.screenshot({path:'output/playwright/mobile-menu.png'});
    await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Home',exact:true}).tap();
    check('Selecting current page closes menu', await page.getByRole('navigation',{name:'Mobile navigation'}).count()===0);
    check('Background scrolling restored', await page.evaluate(()=>document.body.style.overflow!=='hidden'));
    await page.evaluate(()=>window.scrollTo({top:500,behavior:'instant'}));
    await page.waitForTimeout(800);
    await page.screenshot({path:'output/playwright/mobile-hero-scroll.png'});
    await page.goto('http://127.0.0.1:5173/gallery');
    await page.getByRole('tab',{name:'Team Yellow',exact:true}).tap();
    check('Last gallery category is reachable', await page.getByRole('tab',{name:'Team Yellow',exact:true}).getAttribute('aria-selected')==='true');
    await page.getByRole('tab',{name:'Beach Hangout',exact:true}).tap();
    await page.getByRole('button',{name:/View Photo/}).first().tap();
    await page.getByRole('dialog').waitFor();
    await page.waitForTimeout(500);
    await page.screenshot({path:'output/playwright/mobile-photo-viewer.png'});
    check('Only one photo close button', await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).count()===1);
    await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).tap();
    await page.getByRole('dialog').waitFor({state:'hidden'});
    check('Photo closes by touch', true);
    await page.goto('http://127.0.0.1:5173/events/40');
    await page.getByRole('button',{name:'Book Now',exact:true}).tap();
    await page.getByRole('button',{name:'Continue',exact:true}).tap();
    await page.waitForTimeout(500);
    await page.screenshot({path:'output/playwright/mobile-booking.png'});
    const dialog = await page.getByRole('dialog').boundingBox();
    check('Booking dialog fits phone', dialog.x>=0 && dialog.y>=0 && dialog.x+dialog.width<=390 && dialog.y+dialog.height<=844);
    check('Booking inputs avoid iOS small-text zoom', await page.getByRole('dialog').locator('input').evaluateAll(inputs=>inputs.every(input=>parseFloat(getComputedStyle(input).fontSize)>=16)));
    await page.getByRole('button',{name:'Continue to Payment',exact:true}).scrollIntoViewIfNeeded();
    check('Booking action reachable by scrolling', await page.getByRole('button',{name:'Continue to Payment',exact:true}).isVisible());
    await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).tap();
    await page.getByRole('dialog').waitFor({state:'hidden'});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(1000);
    check('Reduced motion has no pinned hero spacer', await page.locator('.pin-spacer').count()===0);
    return checks;
  } finally { await context.close(); }
}
