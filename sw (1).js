// ── CarbuFuel Service Worker v5 ───────────────────────────────────────────────
const CACHE_VERSION = 'carbufuel-v6';
const SHELL_CACHE   = 'carbufuel-shell-v6';

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;600&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});


self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API carburants : network-first avec cache 5 min
  if (url.hostname === 'data.economie.gouv.fr') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return caches.open(CACHE_VERSION)
            .then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
        })
        .catch(error => {
          console.error('Fetch failed; returning cached data.', error);
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a default error response
              return new Response(JSON.stringify({
                error: 'No network and no cache available',
                details: 'Échec de toutes les sources. Aucune station trouvée dans le rayon spécifié.'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
  }
});


async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, ttl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const body = await response.clone().arrayBuffer();
      const headers = new Headers(response.headers);
      headers.set('sw-fetched-at', Date.now().toString());
      cache.put(request, new Response(body, { status: response.status, headers }));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      const fetchedAt = parseInt(cached.headers.get('sw-fetched-at') || '0');
      if (Date.now() - fetchedAt < ttl * 1000) return cached;
    }
    return new Response(JSON.stringify({ results: [], error: 'offline' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
