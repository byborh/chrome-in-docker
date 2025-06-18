/*
 * 🔍 Ce script lance Puppeteer avec le plugin Stealth, sans passer par Tor.
 * 🎯 Objectif : tester si leboncoin.fr est accessible sans détection, sans proxy, sans Tor.
 * ➕ Bonus : tente d'interagir un minimum pour simuler un comportement humain.
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const run = async () => {
  console.log('🧭 Navigation en cours sans Tor...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://www.leboncoin.fr', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    const content = await page.content();

    if (content.includes('cloudfront') || content.includes('captcha')) {
      console.log('🛑 Bloqué : Cloudfront ou CAPTCHA détecté.');
    } else {
      console.log('✅ Navigation réussie sans Tor. Contenu :');
      console.log(content.substring(0, 300));
    }
  } catch (err) {
    console.error('❌ Erreur lors de la navigation :', err.message);
  } finally {
    await browser.close();
    console.log('✔️ Test terminé sans Tor.');
  }
};

run();

