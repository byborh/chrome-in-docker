export async function handleCookies(page) {
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, a, div[role="button"]')];
    const kw = ['accepter','autoriser','cookies','ok','accept all','agree','allow'];
    btns.forEach(b => {
      if (kw.some(k=>b.innerText.toLowerCase().includes(k))) b.click();
    });
  });
}

