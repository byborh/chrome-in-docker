import { renewTorIdentity } from './tor.js';
import { applyStealth } from './stealth.js';

export async function handleCaptchaAndRetry(oldPage, browser) {
  await renewTorIdentity();
  await oldPage.close();
  const page = await browser.newPage();
  await applyStealth(page);
  await page.waitForTimeout(10000 + Math.random()*15000);
  return page;
}

