// Service worker: permite instalar la app y usarla sin conexión.
const CACHE = "rutina43-20261013-210120";
const LOCALES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(LOCALES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, host = new URL(req.url).hostname;
  if (req.method !== "GET") return;
  const cacheable = host === self.location.hostname || host === "fonts.googleapis.com" || host === "fonts.gstatic.com";
  if (!cacheable) return;
  if (req.mode === "navigate") {
    // la página: primero internet (para recibir actualizaciones); sin conexión, la copia guardada
    e.respondWith(fetch(req)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copia)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === "opaque") { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
    return r;
  })));
});