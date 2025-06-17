export async function networkToggle(page, slow) {
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: slow ?
      3000 + Math.random() * 4000 :
      20 + Math.random() * 30,
    downloadThroughput: (slow ? 50 + Math.random() * 50 : 1024) * 1024,
    uploadThroughput: (slow ? 30 + Math.random() * 40 : 1024) * 1024,
    connectionType: slow ? 'cellular3g' : 'wifi'
  });
}

