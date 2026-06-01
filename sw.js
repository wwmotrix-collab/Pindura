// PENDURA v2.2.0 — SERVICE WORKER KILL SWITCH
// Objetivo: retirar qualquer cache antigo que deixou HTML/CSS/JS quebrado no mobile.

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    } catch (e) {
      console.warn('[SW] falha ao limpar caches:', e);
    }

    try {
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        try {
          client.postMessage({ type: 'PINDURA_CACHE_RESET' });
          client.navigate(client.url.split('#')[0] + '?v=220-cache-reset');
        } catch (e) {}
      }
    } catch (e) {}

    try { await self.registration.unregister(); } catch (e) {}
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request, { cache: 'reload' }));
});
