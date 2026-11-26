// Curvas do Pará: página sempre buscada na rede primeiro (atualizações aparecem na hora);
// imagens e arquivos guardados no aparelho para abrir rápido e funcionar sem internet.
const CACHE = 'curvas-v45';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())) });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())) });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (isPage) { // rede primeiro (sem cache do navegador); sem internet, usa a cópia guardada
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone())); return r }).catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit; // imagens têm nome único (mudam de nome quando mudam)
    const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
  }));
});
