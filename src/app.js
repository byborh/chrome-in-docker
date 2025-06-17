import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import fs from 'fs';
import torRequest from 'tor-request';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

puppeteer.use(StealthPlugin());


// Création de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Configuration Tor
torRequest.setTorAddress('localhost', 9050);
const MY_NORMAL_IP = process.env.MY_IP || '';

// 🔍 Détection captcha améliorée
async function detectCaptcha(page) {
  return await page.evaluate(() => {
    const hasDatadome = !!document.querySelector('form[action*="datadome"], iframe[src*="datadome"]');
    const hasCaptchaText = document.body.innerText.toLowerCase().includes('captcha') || 
                          document.title.toLowerCase().includes('captcha');
    const isBlocked = document.body.innerText.includes('blocked') || 
                     document.body.innerText.includes('denied');
    return hasDatadome || hasCaptchaText || isBlocked;
  });
}

// 🐢 Ralentissement réseau réaliste
async function toggleNetworkSlow(page, slow) {
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: slow ? 3000 + Math.floor(Math.random() * 4000) : 20 + Math.floor(Math.random() * 30),
    downloadThroughput: slow ? (50 + Math.floor(Math.random() * 50)) * 1024 : 1024 * 1024,
    uploadThroughput: slow ? (30 + Math.floor(Math.random() * 40)) * 1024 : 1024 * 1024,
    connectionType: slow ? 'cellular3g' : 'wifi'
  });
}

// 🔄 Rotation d'identité Tor
async function renewTorIdentity() {
  const MAX_ATTEMPTS = 3;
  const DELAY_BETWEEN_ATTEMPTS = 3000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`🔄 Tentative ${attempt}/${MAX_ATTEMPTS} de rotation d'identité Tor...`);

      // 1. Envoi du signal SIGHUP
      const { stderr } = await execAsync('pkill -HUP tor || true'); // "|| true" ignore les erreurs si tor n'est pas trouvé

      // 2. Vérification des erreurs
      if (stderr && !stderr.includes("no process found")) {
        throw new Error(`Erreur Tor: ${stderr}`);
      }

      // 3. Attente de stabilisation
      console.log('⏳ Attente de la nouvelle identité...');
      await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000)); // Délai aléatoire

      // 4. Vérification optionnelle (décommente si tu as torify/torsocks)
      // await verifyNewIP(); 

      console.log('✅ Nouvelle identité Tor confirmée');
      return true;

    } catch (error) {
      console.error(`❌ Échec tentative ${attempt}:`, error.message);
      
      if (attempt < MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_ATTEMPTS));
      }
    }
  }
  
  console.error('🚨 Échec critique de rotation Tor après plusieurs tentatives');
  return false;
}

// Exemple de fonction de vérification (optionnelle)
async function verifyNewIP() {
  try {
    const { stdout } = await execAsync('curl --socks5-hostname localhost:9050 ifconfig.me');
    console.log(`📡 Nouvelle IP Tor: ${stdout.trim()}`);
  } catch (e) {
    console.warn('⚠️ Impossible de vérifier l\'IP (curl manquant?)');
  }
}



// Vérification connexion Tor
async function verifyTorConnection(page) {
  try {
    await page.goto('https://check.torproject.org', {waitUntil: 'networkidle2', timeout: 30000});
    const isUsingTor = await page.evaluate(() => document.body.textContent.includes('Congratulations'));
    
    if (!isUsingTor) throw new Error('Not using Tor');
    
    // Vérification IP
    await page.goto('https://api.ipify.org?format=json', {waitUntil: 'networkidle2'});
    const currentIp = await page.evaluate(() => {
      try {
        return JSON.parse(document.body.textContent).ip;
      } catch {
        return 'unknown';
      }
    });

    console.log(`🌐 IP actuelle via Tor: ${currentIp}`);
    
    if (MY_NORMAL_IP && currentIp === MY_NORMAL_IP) {
      throw new Error('Tor ne fonctionne pas - IP normale détectée');
    }

    return true;
  } catch (e) {
    console.error('❌ Échec vérification Tor:', e.message);
    throw e;
  }
}

// 🖱️ Simulation comportement humain
async function humanLikeInteraction(page) {
  // Défilement aléatoire
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100 + Math.floor(Math.random() * 50);
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight || Math.random() > 0.8) {
          clearInterval(timer);
          resolve();
        }
      }, 100 + Math.floor(Math.random() * 200));
    });
  });
  
  // Mouvements souris réalistes
  const viewport = page.viewport();
  for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
    await page.mouse.move(
      Math.floor(Math.random() * viewport.width),
      Math.floor(Math.random() * viewport.height),
      {steps: 10 + Math.floor(Math.random() * 10)}
    );
    await new Promise(resolve => setTimeout(resolve, 100 + Math.floor(Math.random() * 500)));
  }

  // Clics aléatoires
  if (Math.random() > 0.7) {
    await page.mouse.click(
      Math.floor(Math.random() * viewport.width),
      Math.floor(Math.random() * viewport.height),
      {delay: 100 + Math.floor(Math.random() * 200)}
    );
  }
}

// 🏠 Visite humaine d'une URL
async function humanVisit(page, url, maxAttempts = 2) {
  console.log(`🌍 Tentative de visite de ${url}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await toggleNetworkSlow(page, Math.random() > 0.7);
      
      await page.goto(url, {
        waitUntil: 'domcontentloaded', // Plus tolérant que networkidle2
        timeout: 15000, // Réduit le timeout initial
        referer: 'https://www.google.com/'
      }).catch(() => {}); // On ignore les erreurs de timeout

      // Vérification si la page a bien chargé
      const isPageLoaded = await page.evaluate(() => document.readyState === 'complete');
      if (!isPageLoaded && attempt < maxAttempts) {
        console.log(`⚠️ Chargement partiel, nouvelle tentative (${attempt}/${maxAttempts})`);
        continue;
      }

      await humanLikeInteraction(page);
      await handleCookies(page);
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.floor(Math.random() * 3000)));
      await toggleNetworkSlow(page, false);
      
      return; // Sortie si tout s'est bien passé
      
    } catch (e) {
      console.log(`⚠️ Erreur lors de la visite (tentative ${attempt}/${maxAttempts}):`, e.message);
      if (attempt === maxAttempts) {
        console.log(`❌ Abandon de la visite de ${url}`);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // Attente avant réessai
    }
  }
}

//   Gestion des bannières cookies
async function handleCookies(page) {
  try {
    const found = await Promise.race([
      page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const keywords = ['accepter', 'autoriser', 'cookies', 'ok', 'accept all', 'continuer', 'agree'];
        for (const btn of buttons) {
          const text = (btn.innerText || btn.textContent || '').toLowerCase();
          if (keywords.some(k => text.includes(k)) && btn.offsetParent !== null) {
            btn.click();
            return true;
          }
        }
        return false;
      }),
      new Promise(resolve => setTimeout(() => resolve(false), 3000)) // Timeout après 3s
    ]);

    if (found) {
      console.log('🍪 Bouton cookies accepté');
      await new Promise(resolve => setTimeout(resolve, 500 + Math.floor(Math.random() * 1000)));
    }
  } catch (e) {
    console.log('⚠️ Erreur gestion cookies (non critique):', e.message);
  }
}

// 🛡️ Configuration anti-détection
async function applyStealth(page) {
  // User-Agent aléatoire
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0'
  ];
  
  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(randomUA);
  
  // Headers supplémentaires
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Referer': 'https://www.google.com/',
    'DNT': '1',
    'Connection': 'keep-alive'
  });

  // Viewport aléatoire
  const widths = [1366, 1440, 1536, 1600, 1920];
  const heights = [768, 900, 960, 1024, 1080];
  await page.setViewport({
    width: widths[Math.floor(Math.random() * widths.length)],
    height: heights[Math.floor(Math.random() * heights.length)],
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: Math.random() > 0.8
  });

  // Scripts d'évasion
  await page.evaluateOnNewDocument(() => {
    // Masquer WebDriver
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // Modifier les plugins
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    // Modifier les langues
    Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr', 'en-US', 'en'] });
    // Modifier la résolution d'écran
    Object.defineProperty(screen, 'width', { get: () => window.innerWidth });
    Object.defineProperty(screen, 'height', { get: () => window.innerHeight });
  });
}

// 🚨 Gestion des CAPTCHA
async function handleCaptcha(page) {
  console.log('🔄 Tentative de contournement du CAPTCHA...');
  
  try {
    // 1. Changement d'identité Tor (avec timeout)
    await Promise.race([
      renewTorIdentity(),
      new Promise(resolve => setTimeout(resolve, 10000)) // Timeout après 10s
    ]);

    // 2. Fermeture et réouverture du navigateur
    try {
      await page.close();
    } catch (e) {
      console.log('⚠️ Erreur lors de la fermeture de la page:', e.message);
    }
    
    const newPage = await browser.newPage();
    await applyStealth(newPage);

    // 3. Attente avec timeout
    await new Promise(resolve => setTimeout(resolve, 5000 + Math.floor(Math.random() * 10000)));

    // 4. Visites de pages intermédiaires (version sécurisée)
    const decoyPages = [
      'https://www.wikipedia.org',
      'https://www.reddit.com',
      'https://www.bbc.com',
      'https://www.amazon.fr',
      'https://www.youtube.com'
    ];
    
    const pagesToVisit = decoyPages
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 2));

    for (const url of pagesToVisit) {
      await humanVisit(newPage, url).catch(() => {});
      // On continue même si une visite échoue
    }

    return newPage;
    
  } catch (e) {
    console.log('⚠️ Erreur critique dans handleCaptcha:', e.message);
    return page; // On retourne la page originale en cas d'échec
  }
}

// ==============================================
// 🚀 EXÉCUTION PRINCIPALE
// ==============================================

(async () => {
  let browser, page;
  const data = { title: '', price: '', success: false };

  // 📂 Configuration des chemins
  const outputDir = path.join(__dirname);
  const paths = {
    html: path.join(outputDir, 'index.html'),
    raw: path.join(outputDir, 'page_raw.html'),
    captcha: path.join(outputDir, 'captcha_page.html'),
    error: path.join(outputDir, 'error_page.html'),
    log: path.join(outputDir, 'error.log'),
    dataJson: path.join(outputDir, 'data.json'),
  };

  try {
    // 🖥️ Lancement du navigateur
    console.log('🚀 Lancement du navigateur avec configuration furtive...');
    
    const userDataDir = path.resolve(__dirname, '..', 'chrome-profile');
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--proxy-server=socks5://127.0.0.1:9050',
        '--user-data-dir=${userDataDir}',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1200,800',
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      ignoreDefaultArgs: ['--enable-automation'],
      defaultViewport: null
    });

    page = await browser.newPage();
    await applyStealth(page);

    // 🔌 Vérification Tor
    await verifyTorConnection(page);

    // 🌍 Visites préparatoires
    const prepUrls = [
      "https://www.wikipedia.org",
      "https://www.reddit.com",
      "https://www.amazon.fr",
      "https://www.youtube.com"
    ];

    for (const url of prepUrls) {
      await humanVisit(page, url);
      if (Math.random() > 0.6) await renewTorIdentity();
    }

    // 🎯 Cible principale: Leboncoin
    const targetUrl = 'https://www.leboncoin.fr/ad/collection/2409429206';
    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        console.log(`🔎 Tentative ${4 - retries}/3 pour ${targetUrl}`);
        
        // Visite de la page d'accueil d'abord
        await humanVisit(page, 'https://www.leboncoin.fr/');
        
        // Navigation vers la cible
        await toggleNetworkSlow(page, true);
        await page.goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
          referer: 'https://www.leboncoin.fr/'
        });
        await toggleNetworkSlow(page, false);

        // Vérification CAPTCHA
        if (await detectCaptcha(page)) {
          console.log('🛑 CAPTCHA détecté!');
          fs.writeFileSync(paths.captcha, await page.content());
          page = await handleCaptcha(page);
          retries--;
          continue;
        }

        // Interaction humaine
        await humanLikeInteraction(page);

        // Extraction des données
        const rawData = await page.evaluate(() => {
          const title = document.querySelector('[data-qa-id="adview_title"] h1')?.innerText?.trim() || '';
          const price = document.querySelector('[data-qa-id="adview_price"] p')?.innerText?.trim() || '';
          const rawHtml = document.documentElement.outerHTML;
          return { title, price, rawHtml };
        });

        if (!rawData.title || !rawData.price) {
          throw new Error('Données non trouvées');
        }

        data.title = rawData.title;
        data.price = rawData.price;
        data.success = true;
        success = true;

        console.log('✅ Données extraites avec succès:', data);
        fs.writeFileSync(paths.raw, rawData.rawHtml);
        fs.writeFileSync(paths.html, await page.content());

      } catch (err) {
        console.error(`❌ Erreur (${retries} tentatives restantes):, err.message`);
        fs.writeFileSync(paths.error, await page?.content() || err.stack);
        
        if (retries > 1) {
          await renewTorIdentity();
          await new Promise(resolve => setTimeout(resolve, 5000 + Math.floor(Math.random() * 10000)));
	}
        retries--;
      }
    }

    if (!success) {
      console.log('💥 Échec après 3 tentatives');
      data.error = 'Échec après plusieurs tentatives';
    }

    fs.writeFileSync(paths.dataJson, JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('💣 ERREUR CRITIQUE:', err);
    fs.writeFileSync(paths.log, err.stack || err.message);
    fs.writeFileSync(paths.dataJson, JSON.stringify({
      success: false,
      error: err.message
    }, null, 2));
  } finally {
    // 🧹 Nettoyage
    if (page && !page.isClosed()) await page.close();
    if (browser) await browser.close();
    console.log('🔚 Navigateur fermé');
  }
})();
