import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function launch() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--proxy-server=socks5://127.0.0.1:9050',
      `--user-data-dir=${process.cwd()}/chrome-profile`,
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1200,800',
      '--start-maximized',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await import('../core/stealth.js').then(m => m.applyStealth(page));

  return { browser, page };
}

