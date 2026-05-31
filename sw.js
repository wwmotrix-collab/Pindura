// PENDURA v2.1.7 — SERVICE WORKER
// Corrige cache antigo que mantinha JS velho do calendário no mobile.
const CACHE = 'pindura-v2.1.7-calendar-fix';
const ASSETS = [
  '/', '/index.html',
  '/css/main.css',
  '/js/config.js', '/js/supabase.js', '/js/app.js', '/js/pwa.js',
  '/js/modules/fx.js', '/js/modules/confidence.js',
  '/js/modules/calendar.js', '/js/modules/profile.js',
  '/js/services/whatsapp.js',
  '/manifest.json', '/icons/logo-pindura.png', '/icons/logo-pindura-horizontal.png', '/icons/logo-pindura-vertical.png', '/icons/splash-pindura.png', '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function shouldBypass(request) {
  const url = new URL(request.url);
  return url.hostname.includes('supabase.co') ||
    url.hostname.includes('wa.me') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('jsdelivr.net');
}

function isCodeOrPage(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css');
}

self.addEventListener('fetch', e => {
  if (shouldBypass(e.request)) return;

  if (isCodeOrPage(e.request)) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy)).catch(() => null);
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, copy)).catch(() => null);
      return resp;
    }))
  );
});
