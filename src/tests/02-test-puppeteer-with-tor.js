/*
🧪 Test 2 : Navigation Puppeteer simple via TOR (sans Stealth)
---------------------------------------------------------------
Ce script lance un navigateur Puppeteer standard (headless) en utilisant le proxy
SOCKS5 de TOR. Il essaie de charger Leboncoin.fr et lire son contenu.

Ce test permet de savoir si Leboncoin détecte Puppeteer sans camouflage.
Si le site bloque ici, c’est probablement à cause de l’empreinte du navigateur.
*/

import puppeteer from 'puppeteer';

async function testPuppeteerWithTor() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--proxy-server=socks5://127.0.0.1:9050', '--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://www.leboncoin.fr/', { waitUntil: 'networkidle2' });
    console.log('✅ Puppeteer navigation success');
    const content = await page.content();
    console.log(content.slice(0, 500));
  } catch (e) {
    console.error('❌ Puppeteer navigation failed:', e.message);
  } finally {
    await browser.close();
  }
}

testPuppeteerWithTor();

