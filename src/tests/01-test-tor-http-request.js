/*
🧪 Test 1 : Requête HTTP simple via TOR sans navigateur
-------------------------------------------------------
Ce script envoie une requête GET vers Leboncoin.fr en utilisant TOR via `got`
et le proxy SOCKS5. Il permet de vérifier si l’IP TOR est bloquée au niveau réseau
(avant même l'utilisation de Puppeteer).

Si ce script fonctionne et retourne du HTML, cela signifie que TOR est accepté
au niveau réseau et que le blocage ne se fait pas ici.
*/

import got from 'got';
import { SocksProxyAgent } from 'socks-proxy-agent';

async function testTorHttpRequest() {
  try {
    const agent = new SocksProxyAgent('socks5h://127.0.0.1:9050');
    const res = await got('https://ipinfo.io/json', { agent: { https: agent } });
    console.log('IP Info from ipinfo:', res.body);

    //const res2 = await got('https://check.torproject.org/', {agent:{https:agent}});
    //console.log('IP Info from torproject:', res2.body);

    const response = await got('https://www.leboncoin.fr/', {
      agent: { http: agent, https: agent },
      timeout: 30000,
    });

    console.log('✅ Tor HTTP Request success, status:', response.statusCode);
    console.log(response.body.slice(0, 500)); // aperçu du contenu HTML
  } catch (err) {
    console.error('❌ Tor HTTP Request failed:', err.message);
  }
}

testTorHttpRequest();

