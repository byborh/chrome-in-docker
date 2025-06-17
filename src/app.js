import { launchBrowser } from './core/browser.js';
import { renewTorIdentity, verifyTorConnection } from './core/tor.js';
import { handleCaptcha } from './features/captcha.js';
import { humanVisit } from './features/humanVisit.js';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  const { browser, page } = await launchBrowser();

  try {
    await verifyTorConnection(page);
    await humanVisit(page, 'https://example.com');
  } catch (e) {
    console.error('Erreur principale:', e);
    await handleCaptcha(browser, page);
  } finally {
    await browser.close();
  }
})();