const CACHE = 'qr-studio-f47d0d166275';
const ASSETS = ["index.html","assets/index-CLYq4qBj.js","assets/html2canvas-ueFb0F4g.js","assets/index.es-BKu0onKh.js","assets/jspdf.es.min-CL6YWst_.js","assets/purify.es-Bvo9QlJ8.js","assets/index-f6NZzuC1.css","assets/inter-latin-400-normal-C38fXH4l.woff2","assets/inter-latin-400-normal-CyCys3Eg.woff","assets/inter-latin-500-normal-BL9OpVg8.woff","assets/inter-latin-500-normal-Cerq10X2.woff2","assets/inter-latin-600-normal-CiBQ2DWP.woff","assets/inter-latin-600-normal-LgqL8muc.woff2","assets/inter-latin-700-normal-BLAVimhd.woff","assets/inter-latin-700-normal-Yt3aPRUw.woff2","assets/poppins-latin-400-normal-BOb3E3N0.woff","assets/poppins-latin-400-normal-cpxAROuN.woff2","assets/poppins-latin-500-normal-C8OXljZJ.woff2","assets/poppins-latin-500-normal-DGXqpDMm.woff","assets/poppins-latin-600-normal-BJdTmd5m.woff","assets/poppins-latin-600-normal-zEkxB9Mr.woff2","assets/poppins-latin-700-normal-BVuQR_eA.woff","assets/poppins-latin-700-normal-Qrb0O0WB.woff2"];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS.map(file => new URL(file, self.registration.scope).href)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(hit =>
      hit ||
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          event.request.mode === 'navigate'
            ? caches.match(new URL('index.html', self.registration.scope).href)
            : Response.error()
        )
    )
  );
});