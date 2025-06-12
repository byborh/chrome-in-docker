(async () => {
    const { launch } = require("puppeteer");
    
    let browser
    try {
        const userDataDir = path.join(__dirname, 'chrome-profile')

        browser = await launch({
            headless: false,
            executablePath: '/usr/bin/google-chrome',
            args: [
                '--proxy-server=IP:PORT',
                '--no-sandbox',
                `--user-data-dir=${userDataDir}`,
                '--disable-blink-features=AutomationControlled'

                // Emmario dit : load un fichier de config hors du container et le copier coller dans le container
            ],
            ignoreDefaultArgs: ['--enable-automation'],
        })
        const page = await browser.newPage()

        // masquer que c'est puppeteer
        await page.eveluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false
            })
        })

        // ouvrir la page
        await page.goto('https://www.leboncoin.fr/ad/collection/2409429206', {
            waitUntil: 'networkidle0',
            timeout: 30000
        })

        await page.waitForTimeout(5000)
        
        // console.log("https://www.leboncoin.fr/")
    } catch (error) {
        console.log(error)
    } finally {
        // await browser.close()
    }
})()    