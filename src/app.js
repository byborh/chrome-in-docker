const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  let browser, page;
  const data = {
    title: '',
    price: '',
  };

  try {
    const userDataDir = path.join(__dirname, 'chrome-profile');

    browser = await puppeteer.launch({
      headless: false, // Pour voir ce qui se passe
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--user-data-dir=${userDataDir}`,
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1200,800',
        '--start-maximized',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    page = await browser.newPage();

    // Anti-détection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      Object.defineProperty(navigator, 'chrome', { get: () => ({ runtime: {} }) });
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    );

    await page.goto('https://www.leboncoin.fr/ad/collection/2409429206', {
      waitUntil: 'networkidle2', // plus sûr que domcontentloaded
      timeout: 60000,
    });

    try {
      await page.click('#didomi-notice-agree-button', { timeout: 3000 });
    } catch {
      console.log('Pas de cookie à accepter');
    }

    // 👁️ Attente volontaire
    await new Promise(r => setTimeout(r, 3000));

    // 📸 Screenshot pour debug
    await page.screenshot({ path: 'debug_capture.png' });

    // 🧾 Dump HTML dans un fichier pour inspection manuelle
    const html = await page.content();
    fs.writeFileSync('debug_page.html', html);
    console.log('💾 HTML sauvegardé');

    // ✅ Essayons de récupérer les infos avec vérification d'existence
    const titleElement = await page.$('[data-qa-id="adview_title"] h1');
    const priceElement = await page.$('[data-qa-id="adview_price"] p');

    if (!titleElement || !priceElement) {
      console.error('❌ Les sélecteurs ne sont pas présents sur la page.');
    } else {
      data.title = await page.evaluate(el => el.textContent.trim(), titleElement);
      data.price = await page.evaluate(el => el.textContent.trim(), priceElement);

      console.log('✅ Données récupérées :', data);
    }

    // Pause pour voir
    await new Promise(r => setTimeout(r, 60000));

  } catch (error) {
    console.error('❌ Erreur globale :', error);
  } finally {
    if (page && !page.isClosed()) await page.close();
    if (browser) await browser.close();
  }
})();
