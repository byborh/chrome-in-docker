/*
🧪 Test 3 : Puppeteer avec plugin Stealth via TOR
--------------------------------------------------
Ce script lance Puppeteer avec le plugin "puppeteer-extra-plugin-stealth"
et utilise le proxy TOR pour simuler une navigation "humaine".

Ce test est le plus avancé et tente de contourner les détections classiques.
Si le blocage est toujours présent ici, cela signifie que Leboncoin a une
détection très agressive (empreinte avancée, fingerprinting, etc.).
*/

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function testStealthWithTor() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--proxy-server=socks5://127.0.0.1:9050', '--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    console.log('🧭 Navigation en cours...');
    await page.goto('https://www.leboncoin.fr/', { waitUntil: 'networkidle2' });
    console.log('✅ Navigation terminée. Lecture du contenu...');

    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.toLowerCase().includes('bloqué') || bodyText.toLowerCase().includes('captcha')) {
      console.warn('🛑 Bloqué par un système de détection.');
    } else {
      console.log('✅ Pas de blocage détecté.');
      console.log(bodyText.slice(0, 500));
    }
  } catch (e) {
    console.error('❌ Erreur lors de la navigation :', e.message);
  } finally {
    await browser.close();
  }
}

testStealthWithTor();

