import 'dotenv/config';

import { launch } from './utils/browser.js';
import { networkToggle } from './utils/network.js';
import { humanVisit } from './src/core/human.js';
import { verifyTorConnection } from './core/tor.js';
import { handleCaptchaAndRetry } from './core/captcha.js';
import { extractData } from './core/extract.js';
import paths from './outputPaths.js';
import fs from 'fs';

(async () => {
  const { browser, page } = await launch();
  const data = { title: '', price: '', success: false };

  try {
    await verifyTorConnection(page);

    for (const url of [
      'https://www.wikipedia.org',
      'https://www.reddit.com',
      'https://www.amazon.fr',
      'https://www.youtube.com'
    ]) {
      await humanVisit(page, url);
      if (Math.random() > 0.6) await import('./core/tor.js').then(m => m.renewTorIdentity());
    }

    const targetUrl = 'https://www.leboncoin.fr/ad/collection/2409429206';
    let retries = 3;

    while (retries--) {
      try {
        await humanVisit(page, 'https://www.leboncoin.fr/');
        await networkToggle(page, true);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await networkToggle(page, false);

        if (await import('./core/extract.js').then(m => m.detectCaptcha(page))) {
          page = await handleCaptchaAndRetry(page, browser);
          continue;
        }

        data.title = await extractData(page).title;
        data.price = await extractData(page).price;
        data.success = true;

        fs.writeFileSync(paths.raw, await page.content());
        fs.writeFileSync(paths.html, await page.content());
        break;
      } catch (err) {
        console.error('Erreur detection', err.message);
        if (retries > 0) await import('./core/tor.js').then(m => m.renewTorIdentity());
      }
    }
  } catch (e) {
    console.error('⚠️ Fatal error:', e.message);
  } finally {
    fs.writeFileSync(paths.dataJson, JSON.stringify(data, null, 2));
    await browser.close();
  }
})();

