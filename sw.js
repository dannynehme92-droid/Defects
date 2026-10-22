const CACHE = 'defect-app-v16';
const OPTIONAL = ['./pdf-lib.min.js'];
const FILES = ['./','./index.html','./manifest.webmanifest','./jszip.min.js','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => c.add(new Request(f, {cache: 'reload'}))).concat(OPTIONAL.map(f => c.add(new Request(f, {cache: 'reload'})).catch(() => {})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Open instantly from the saved copy, and quietly refresh it in the background for next time.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return; // never cache cloud or API requests
  e.respondWith(caches.open(CACHE).then(cache => cache.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => { if (res && res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
