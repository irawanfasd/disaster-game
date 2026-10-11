/* Service Worker — Disaster Zone v6.0 */
const VERSION = 'dz-v6.0';
const CACHE_STATIC = VERSION + '-static';
const CACHE_DYNAMIC = VERSION + '-dynamic';

const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/animations.css',
  '/app.js',
  '/fx.js',
  '/ui.js',
  '/theme.js',
  '/sprites.js',
  '/data/scenarios.json',
  '/manifest.webmanifest',
  '/fonts/pixel.ttf',
  '/icon-48.png',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-144.png',
  '/icon-192.png',
  '/icon-256.png',
  '/icon-384.png',
  '/icon-512.png',
  '/assets/costumes/std-m.png',
  '/assets/costumes/std-f.png',
  '/assets/costumes/sar-m.png',
  '/assets/costumes/sar-f.png',
  '/assets/costumes/gempa-m.png',
  '/assets/costumes/gempa-f.png',
  '/assets/costumes/adat-m.png',
  '/assets/costumes/adat-f.png'
];

self.addEventListener('install', function(e) {
  console.log('[SW] Install', VERSION);
  e.waitUntil(
    caches.open(CACHE_STATIC).then(function(c) {
      return Promise.allSettled(
        PRECACHE.map(function(url) {
          return c.add(url).catch(function(err) {
            console.warn('[SW] Gagal cache:', url, err.message);
          });
        })
      );
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[SW] Activate', VERSION);
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) {
          return k !== CACHE_STATIC && k !== CACHE_DYNAMIC;
        }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  const url = new URL(e.request.url);

  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/socket.io/')) return;

  const networkFirst = /\.(html|js|css|json|webmanifest)$/.test(url.pathname) || url.pathname === '/';

  if (networkFirst) {
    e.respondWith(
      fetch(e.request).then(function(r) {
        if (r && r.ok) {
          const clone = r.clone();
          caches.open(CACHE_STATIC).then(function(c) { c.put(e.request, clone); });
        }
        return r;
      }).catch(function() {
        return caches.match(e.request).then(function(r) { return r || caches.match('/'); });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(r) {
        if (r) return r;
        return fetch(e.request).then(function(res) {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_DYNAMIC).then(function(c) { c.put(e.request, clone); });
          }
          return res;
        });
      })
    );
  }
});

self.addEventListener('message', function(e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
