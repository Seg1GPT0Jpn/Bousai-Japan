// オフラインでも使えるようにするための Service Worker。
// 気象庁・地図・P2P地震情報など他のサイトへの通信は保存しない（いつも最新を取りにいく）。
// 文字（フォント）は、表示に使った分だけ自動で保存される。アプリのファイルは先に保存し、ネットにつながるときは新しい版を取りにいく（つながらなければ保存した版）。
// 都道府県の避難場所データは、利用者が「保存する」を押したときだけ別のキャッシュ（bousai-shelters-v1）に入る。
const CACHE = 'bousai-v9';
const FILES = ['./', 'index.html', 'css/fonts.css', 'css/app.css', 'fonts/biz-udpgothic/hES36X5pHAIBjmS84VL0Bue83nBkUWsdImkzMGXUb1G8eoOcUtmCbUaX.119.woff2', 'js/store.js', 'js/i18n.js', 'js/i18n-dict.js', 'js/icons.js', 'js/content.js', 'js/shelters.js', 'js/family.js', 'js/map.js', 'js/live.js', 'js/app.js', 'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
  'vendor/qrcode.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'data/shelters/index.json'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => c.add(new Request(f, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => /^bousai-v\d+$/.test(k) && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const isPrefData = /\/data\/(shelters|hinanjo)\/\d{2}\.json$/.test(url.pathname);
  e.respondWith((async () => {
    try {
      const res = await fetch(e.request);
      if (res.ok && !isPrefData) (await caches.open(CACHE)).put(e.request, res.clone());
      return res;
    } catch (err) {
      return (await caches.match(e.request, { ignoreSearch: true })) || (isPrefData ? Response.error() : (await caches.match('index.html')) || Response.error());
    }
  })());
});
