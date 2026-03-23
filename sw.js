// ── CarbuFuel Service Worker ───────────────────────────────────────────────────
const CACHE_NAME = 'carbufuel-v4';
const SHELL_CACHE = 'carbufuel-shell-v4';

// FIX: polices corrigées (Barlow, pas Bebas/DM/JetBrains)
// FIX: sw.js lui-même ajouté dans le shell
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
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
        keys.filter(k => k !== CACHE_NAME && k !== SHELL_CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.hostname === 'data.economie.gouv.fr') {
    event.respondWith(networkFirst(event.request, CACHE_NAME, 5 * 60));
    return;
  }

  if (url.hostname === 'api-adresse.data.gouv.fr') {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response('{"features":[]}', { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request, SHELL_CACHE));
    return;
  }

  if (url.pathname.match(/\.(html|json|js|css|png|ico|svg|webp)$/)) {
    event.respondWith(cacheFirst(event.request, SHELL_CACHE));
    return;
  }

  event.respondWith(networkFirst(event.request, CACHE_NAME, 60));
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
