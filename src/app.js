(async () => {
    const { launch } = require("puppeteer");
    
    let browser
    try {
        browser = await launch({
            headless: false,
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox']
        })
        const page = browser.newPage()
    
    await page.goto('https://www.leboncoin.fr/')
    
    console.log("https://www.leboncoin.fr/")
    } catch (error) {
        console.log(error)
    }
})()