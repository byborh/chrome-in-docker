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
                '--proxy-server=IP:PORT',
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

        // ouvrir la page
        await page.goto('https://www.leboncoin.fr/ad/collection/2409429206', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.log(error);
    } finally {
        // await browser.close();
    }
})();