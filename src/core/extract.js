export async function detectCaptcha(page) {
  return page.evaluate(() => {
    return !!document.querySelector('form[action*="datadome"], iframe[src*="datadome"]')
      || document.body.innerText.toLowerCase().includes('captcha')
      || document.body.innerText.includes('blocked');
  });
}

export async function extractData(page) {
  return page.evaluate(() => {
    const t = document.querySelector('[data-qa-id="adview_title"] h1')?.innerText.trim() || '';
    const p = document.querySelector('[data-qa-id="adview_price"] p')?.innerText.trim() || '';
    return { title: t, price: p };
  });
}

