async (page) => {
  const checks = [];
  const check = (name, pass) => { checks.push({name, pass}); if (!pass) throw new Error(name); };
  await page.goto('http://127.0.0.1:5173/events/40');
  await page.getByRole('button', {name:'Book Now', exact:true}).waitFor();
  await page.getByRole('button', {name:'Book Now', exact:true}).click();
  await page.getByRole('dialog').waitFor();
  check('Book Now opens booking', await page.getByRole('dialog').isVisible());
  await page.getByRole('button', {name:'Continue', exact:true}).click();
  const bookingDetails = await page.getByRole('dialog').innerText();
  check('Continue opens booking details', /name|email/i.test(bookingDetails));
  await page.keyboard.press('Escape');
  await page.getByRole('button', {name:'Book Your Spot', exact:true}).click();
  check('Second booking CTA opens booking', await page.getByRole('dialog').isVisible());
  await page.keyboard.press('Escape');
  await page.goto('http://127.0.0.1:5173/gallery');
  await page.getByRole('tab', {name:'Beach Hangout', exact:true}).click();
  check('Gallery category selects', await page.getByRole('tab', {name:'Beach Hangout', exact:true}).getAttribute('aria-selected') === 'true');
  await page.getByRole('button', {name:/View Photo/}).first().click();
  await page.getByRole('dialog').waitFor();
  check('Gallery lightbox opens', await page.getByRole('dialog').isVisible());
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'hidden'});
  check('Gallery lightbox closes', await page.getByRole('dialog').count() === 0);
  const before = await page.getByRole('button', {name:/View Photo/}).count();
  await page.getByRole('button', {name:/Load more photos/}).click();
  check('Gallery loads more photos', await page.getByRole('button', {name:/View Photo/}).count() > before);
  await page.goto('http://127.0.0.1:5173/about');
  await page.getByRole('link', {name:'Join our Community', exact:true}).click();
  check('About CTA routes to Community', page.url().endsWith('/community'));
  await page.goto('http://127.0.0.1:5173/contact');
  await page.getByRole('button', {name:'Open email draft'}).click();
  check('Empty contact form is blocked', await page.locator('input:invalid').count() > 0);
  await page.getByRole('combobox').click();
  await page.getByRole('option', {name:'Events & Tickets', exact:true}).click();
  check('Contact subject selector works', (await page.getByRole('combobox').innerText()).includes('Events & Tickets'));
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button', {name:'Open menu', exact:true}).click();
  check('Mobile menu opens', await page.getByRole('navigation', {name:'Mobile navigation'}).isVisible());
  await page.getByRole('navigation', {name:'Mobile navigation'}).getByRole('link', {name:'Gallery',exact:true}).click();
  check('Mobile menu navigates and closes', page.url().endsWith('/gallery') && await page.getByRole('navigation', {name:'Mobile navigation'}).count() === 0);
  await page.setViewportSize({width:1280,height:900});
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(800);
  const reveal = async selector => {
    await page.evaluate(selector => {
      const element = document.querySelector(selector);
      window.scrollTo({top: element.getBoundingClientRect().top + window.scrollY - 110, behavior:'instant'});
    }, selector);
    await page.waitForTimeout(1000);
  };
  await reveal('.products');
  for (const name of ['Game Day', 'Travel', 'Community', 'Corporate', 'Adventures']) {
    const tab = page.locator('.product-tabs').getByRole('tab', {name, exact:true});
    await tab.click();
    check('Homepage experience tab: ' + name, await tab.getAttribute('aria-selected') === 'true');
  }
  await reveal('.cases');
  for (const [name, person] of [['Travel','Kinat'], ['Game Day','Combo'], ['Trivia','Jessica T.'], ['Community','Florence']]) {
    await page.locator('.case-tabs').getByRole('tab', {name, exact:true}).click();
    check('Homepage story tab: ' + name, await page.locator('.case-card h3').innerText() === person);
  }
  await reveal('.faq');
  const question = page.getByRole('button', {name:'Can I pay in installments?', exact:false});
  await question.click();
  check('Homepage FAQ opens', await question.getAttribute('aria-expanded') === 'true');
  await question.click();
  check('Homepage FAQ closes', await question.getAttribute('aria-expanded') === 'false');
  check('Savannah booking links to its event', await page.getByRole('link', {name:'Book this experience', exact:true}).getAttribute('href') === '/events/40');
  return {checks, bookingDetails};
}
