import { networkToggle } from '../utils/network.js';
import { handleCookies } from '../utils/cookies.js';

export async function humanVisit(page, url) {
  console.log(`Visiting ${url}`);
  await networkToggle(page, Math.random()>0.7);
  await page.goto(url, { waitUntil:'networkidle2', timeout:30000, referer:'https://www.google.com/' });
  await humanLike(page);
  await handleCookies(page);
  await page.waitForTimeout(2000 + Math.random()*3000);
  await networkToggle(page, false);
}

async function humanLike(page) {
  await page.evaluate(async () => {
    // scroll, mouse etc.
  });
}

