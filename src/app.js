const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        const userDataDir = path.join(__dirname, 'chrome-profile');

        browser = await puppeteer.launch({
            headless: false,
            executablePath: '/usr/bin/google-chrome',
            args: [
                // '--proxy-server=IP:PORT',
                '--no-sandbox',
                `--user-data-dir=${userDataDir}`,
                '--disable-blink-features=AutomationControlled'
            ],
            ignoreDefaultArgs: ['--enable-automation'],
        });
        const page = await browser.newPage();

        // masquer que c'est puppeteer
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false
            });
        });

        // masquer les autres propriétés détectables
        await page.evaluateOnNewDocument(() => {
            // userAgent doit être réaliste
            Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr'] });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3], // Simule des plugins
            });
            Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
            Object.defineProperty(navigator, 'chrome', {
                get: () => ({ runtime: {} }),
            });
        });


        // ouvrir la page
        await page.goto('https://www.leboncoin.fr/ad/collection/2409429206', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');


        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.log(error);
    } finally {
        // await browser.close();
    }
})();