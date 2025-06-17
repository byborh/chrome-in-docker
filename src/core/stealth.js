export async function applyStealth(page) {
  const UAs = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)… Chrome/109.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)…',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0)…'
  ];
  const ua = UAs[Math.floor(Math.random() * UAs.length)];
  await page.setUserAgent(ua);

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://www.google.com/',
    'DNT': '1',
    'Connection': 'keep-alive'
  });

  await page.setViewport({
    width: [1366,1440,1536,1600,1920][Math.floor(Math.random()*5)],
    height: [768,900,960,1024,1080][Math.floor(Math.random()*5)],
    deviceScaleFactor:1, hasTouch:false, isLandscape: Math.random()>0.8
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR','fr','en-US','en'] });
    Object.defineProperty(screen, 'width', { get: () => window.innerWidth });
    Object.defineProperty(screen, 'height', { get: () => window.innerHeight });
  });
}

