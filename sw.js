// PENDURA v2.1.9 — SERVICE WORKER KILL SWITCH
// Desativa o cache PWA para recuperar CSS/JS no mobile.

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
        try { client.navigate(client.url); } catch (e) {}
      }
    } catch (e) {}

    try { await self.registration.unregister(); } catch (e) {}
  })());
});

self.addEventListener('fetch', event => {
  // Sem cache. Deixa o navegador/Vercel entregar tudo direto da rede.
  event.respondWith(fetch(event.request));
});
