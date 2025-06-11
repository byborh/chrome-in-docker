import { launch } from "puppeteer"

const browser = await launch({
    headless: false,
    executablePath: '/usr/bin/leboncoin',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
})

const page = browser.newPage()

await page.goto('https://www.leboncoin.fr/')

console.log("https://www.leboncoin.fr/")