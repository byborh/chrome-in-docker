const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const cookies = [
  {
    name: 'AMCV_B5751C805BA3539E0A495EAF%40AdobeOrg',
    value: 'MCMID|56204923349583790070210261807602860031',
    domain: '.leboncoin.fr',
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'None',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000
  },
  {
    name: 'nlid',
    value: 'a9ba2a7b-2682-4cd8-83c0-1b67881fefe1|7ae360',
    domain: '.leboncoin.fr',
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'None',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000
  },
  {
    name: 'datadome',
    value: 'KGKScLfj6izcGCw5rRPDpr5gkDEPkg2d9GskdiPqknhNYysE9r73T6kNZFztsmW2TnFON~KTUwfNuPCA0VUhsgU9_j1bycXHcdIqN2XKgYHVEa0kKjT4~JKYV3x~jBr4',
    domain: '.leboncoin.fr',
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'None',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000
  }
];

(async () => {
  let browser, page;
  const data = { title: '', price: '' };
  const htmlOutputPath = path.join(__dirname, 'index.html');

  try {
    const userDataDir = path.join(__dirname, 'chrome-profile');
    console.log('🔧 Lancement du navigateur...');

    browser = await puppeteer.launch({
      headless: 'new',
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
      defaultViewport: null
    });

    page = await browser.newPage();
    console.log('🌐 Nouvelle page ouverte');

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    );
    console.log('🧠 User-Agent défini');

    await page.setCookie(...cookies);
    console.log('🍪 Cookies injectés');

    const url = 'https://www.leboncoin.fr/ad/collection/2409429206'; // 
    console.log(`🚀 Navigation vers ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log('⏳ Attente des sélecteurs principaux...');
    await page.waitForSelector('[data-qa-id="adview_title"] h1', { timeout: 30000 });
    await page.waitForSelector('[data-qa-id="adview_price"] p', { timeout: 30000 });
    console.log('✅ Éléments détectés');

    // 1) Récupération classique avec page.content()
    const html = await page.content();
    fs.writeFileSync(htmlOutputPath, html);
    console.log(`💾 HTML complet sauvegardé dans ${htmlOutputPath}`);

    if (fs.existsSync(htmlOutputPath)) {
      console.log('✅ Fichier HTML présent');
    } else {
      console.error('❌ Fichier HTML non trouvé après tentative d’écriture');
    }

    // 2) Récupération via document.querySelector() dans le contexte du navigateur
    console.log('🔍 Récupération via querySelector dans la page...');
    const rawData = await page.evaluate(() => {
      const title = document.querySelector('[data-qa-id="adview_title"] h1')?.innerText || '';
      const price = document.querySelector('[data-qa-id="adview_price"] p')?.innerText || '';
      const rawHtml = document.documentElement.outerHTML;
      return { title, price, rawHtml };
    });

    data.title = rawData.title;
    data.price = rawData.price;

    console.log('✅ Données via JS natif :', data);

    // Sauvegarde du HTML natif récupéré via outerHTML aussi (en backup)
    fs.writeFileSync(path.join(__dirname, 'page_raw.html'), rawData.rawHtml);
    console.log('💾 HTML récupéré via outerHTML sauvegardé dans page_raw.html');

    await new Promise(r => setTimeout(r, 5000));
    console.log('⏹️ Fin du script');

  } catch (error) {
    console.error('❌ Erreur globale :', error);
  } finally {
    if (page && !page.isClosed()) {
      await page.close();
      console.log('🧹 Page fermée');
    }
    if (browser) {
      await browser.close();
      console.log('🧹 Navigateur fermé');
    }
  }
})();
