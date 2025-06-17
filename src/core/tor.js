import { exec } from 'child_process';

export async function renewTorIdentity() {
  return new Promise((res, rej) => {
    exec('pkill -HUP tor', (e) =>
      e ? rej(e) : setTimeout(() => res(true), 5000)
    );
  });
}

export async function verifyTorConnection(page) {
  await page.goto('https://check.torproject.org', { waitUntil: 'networkidle2', timeout:30000 });
  const ok = await page.evaluate(() => document.body.innerText.includes('Congratulations'));
  if (!ok) throw new Error('Not using Tor');

  await page.goto('https://api.ipify.org?format=json', { waitUntil: 'networkidle2' });
  const ip = await page.evaluate(() => JSON.parse(document.body.innerText).ip);
  console.log(`🌐 IP via Tor: ${ip}`);
}

