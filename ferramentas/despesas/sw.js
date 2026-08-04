// Service worker — casca offline. Os DADOS ficam no IndexedDB (nunca aqui, nunca em rede).
const CACHE = 'samais-despesas-v2';
const ATIVOS = ['./', './index.html', './manifest.webmanifest', './marca-icone.svg', './marca-icone-maskable.svg', './marca-icone-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ATIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first para a casca do app; rede para o resto (ex.: fontes).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && new URL(req.url).origin === location.origin) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
