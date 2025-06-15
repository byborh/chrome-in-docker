const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// 🍪 Cookies LBC
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

// 🔍 Détection captcha
async function detectCaptcha(page) {
  return await page.evaluate(() => {
    return !!document.querySelector('form[action*="datadome"]') ||
           document.title.toLowerCase().includes('datadome') ||
           document.body.innerText.toLowerCase().includes('captcha');
  });
}

// 🐢 Ralentissement / rétablissement réseau
async function toggleNetworkSlow(page, slow) {
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  if (slow) {
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 5000, // 5 sec de latence
      downloadThroughput: 50 * 1024,
      uploadThroughput: 50 * 1024,
    });
  } else {
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 20,
      downloadThroughput: 1024 * 1024,
      uploadThroughput: 1024 * 1024,
    });
  }
}

(async () => {
  let browser, page;
  const data = { title: '', price: '', success: false };

  const outputDir = __dirname;
  const paths = {
    html: path.join(outputDir, 'index.html'),
    raw: path.join(outputDir, 'page_raw.html'),
    captcha: path.join(outputDir, 'captcha_page.html'),
    error: path.join(outputDir, 'error_page.html'),
    log: path.join(outputDir, 'error.log'),
    dataJson: path.join(outputDir, 'data.json'),
  };

  try {
    const userDataDir = path.join(__dirname, '..', 'chrome-profile');
    console.log('🧠 Lancement navigateur furtif...');

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
        '--start-maximized'
      ],
      ignoreDefaultArgs: ['--enable-automation'],
      defaultViewport: null
    });

    page = await browser.newPage();

    // 🛠️ Anti-détection Puppeteer
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.navigator.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'fr-FR,fr;q=0.9'
    });

    await page.setCookie(...cookies);
    console.log('🌐 Page prête, cookies injectés');

    const url = 'https://www.leboncoin.fr/ad/collection/2409429206';

    // Étape 1 : page d’accueil
    await page.goto('https://www.leboncoin.fr/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

    // Étape 2 : ralentir le réseau
    console.log('🐢 Ralentissement réseau avant navigation vers la page cible...');
    await toggleNetworkSlow(page, true);

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Réseau normal après navigation
    console.log('✅ Rétablissement réseau après navigation...');
    await toggleNetworkSlow(page, false);
    await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));

    // Simule mouvement souris
    await page.mouse.move(100, 100);
    await page.mouse.move(300, 200);

    const htmlAfterLoad = await page.content();
    fs.writeFileSync(paths.html, htmlAfterLoad);
    console.log('💾 Page chargée sauvegardée dans index.html');

    // Détection captcha
    const hasCaptcha = await detectCaptcha(page);
    if (hasCaptcha) {
      console.warn('🛑 Captcha détecté !');
      fs.writeFileSync(paths.captcha, htmlAfterLoad);
      fs.writeFileSync(paths.dataJson, JSON.stringify(data, null, 2));
      return;
    }

    // Attente sélecteurs
    console.log('🔍 Attente des données...');
    try {
      await page.waitForSelector('[data-qa-id="adview_title"] h1', { timeout: 30000 });
      await page.waitForSelector('[data-qa-id="adview_price"] p', { timeout: 30000 });
    } catch (e) {
      console.warn('⏱️ Timeout des sélecteurs.');
      fs.writeFileSync(paths.error, await page.content());
      fs.writeFileSync(paths.dataJson, JSON.stringify(data, null, 2));
      return;
    }

    // Extraction
    const rawData = await page.evaluate(() => {
      const title = document.querySelector('[data-qa-id="adview_title"] h1')?.innerText || '';
      const price = document.querySelector('[data-qa-id="adview_price"] p')?.innerText || '';
      const rawHtml = document.documentElement.outerHTML;
      return { title, price, rawHtml };
    });

    data.title = rawData.title;
    data.price = rawData.price;
    data.success = true;

    console.log('✅ Données extraites :', data);
    fs.writeFileSync(paths.raw, rawData.rawHtml);
    fs.writeFileSync(paths.dataJson, JSON.stringify(data, null, 2));

    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.error('❌ Erreur générale :', err.message);
    fs.writeFileSync(paths.log, err.stack || err.message);
  } finally {
    if (page && !page.isClosed()) await page.close();
    if (browser) await browser.close();
    console.log('🧹 Nettoyage terminé.');
  }
})();
