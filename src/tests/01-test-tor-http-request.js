import got from 'got';
import { SocksProxyAgent } from 'socks-proxy-agent';
import net from 'net';

const TOR_CONTROL_PORT = 9051;
const SOCKS_PORT = 9052;
const MAX_ATTEMPTS = 10;
const TOR_PASSWORD = ''; // pas de password si CookieAuthentication

async function sendTorNewnym() {
  return new Promise((resolve) => {
    const socket = net.connect(TOR_CONTROL_PORT, '127.0.0.1', () => {
      socket.write('AUTHENTICATE ""\r\n');
    });

    socket.on('data', (data) => {
      if (data.toString().startsWith('250')) {
        socket.write('SIGNAL NEWNYM\r\n');
      } else if (data.toString().includes('250 OK')) {
        socket.end();
        resolve();
      }
    });
  });
}

async function tryOnce(i) {
  console.log(`🔁 Tentative ${i + 1} : changement d'IP Tor...`);
  await sendTorNewnym();
  await new Promise((r) => setTimeout(r, 5000)); // attendre stabilisation

  const agent = new SocksProxyAgent(`socks5h://127.0.0.1:${SOCKS_PORT}`);
  try {
    const ipinfo = await got('https://ipinfo.io/json', { agent: { https: agent } });
    const info = JSON.parse(ipinfo.body);
    console.log(`🌍 Nouvelle IP : ${info.ip} (${info.country})`);

    if (!['FR', 'BE'].includes(info.country)) {
      console.warn('❌ IP non FR/BE, on saute');
      return false;
    }

    const res = await got('https://www.leboncoin.fr/', {
      agent: { https: agent },
      timeout: 15000,
    });

    console.log('✅ Leboncoin réponse OK:', res.statusCode);
    return true;
  } catch (e) {
    console.error('❌ Erreur:', e.message);
    return false;
  }
}

(async () => {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const ok = await tryOnce(i);
    if (ok) break;
  }
})();

