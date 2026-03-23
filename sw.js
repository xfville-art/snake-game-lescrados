// ── CarbuFuel Service Worker ───────────────────────────────────────────────────
const CACHE_NAME = 'carbufuel-v3';
const SHELL_CACHE = 'carbufuel-shell-v3';

// App shell — fichiers à mettre en cache à l'installation
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap'
];

// ── INSTALL : cache l'app shell ───────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE : supprime les anciens caches ────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== SHELL_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH : stratégie selon la ressource ─────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API carburants → Network first, fallback cache 5min
  if (url.hostname === 'data.economie.gouv.fr') {
    event.respondWith(networkFirst(event.request, CACHE_NAME, 5 * 60));
    return;
  }

  // API adresse (géocodage) → Network only (pas de cache)
  if (url.hostname === 'api-adresse.data.gouv.fr') {
    event.respondWith(fetch(event.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }

  // Google Fonts → Cache first (longue durée)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request, SHELL_CACHE));
    return;
  }

  // App shell → Cache first
  if (url.pathname.match(/\.(html|json|js|css|png|ico|svg)$/)) {
    event.respondWith(cacheFirst(event.request, SHELL_CACHE));
    return;
  }

  // Tout le reste → Network with cache fallback
  event.respondWith(networkFirst(event.request, CACHE_NAME, 60));
});

// ── STRATÉGIES ────────────────────────────────────────────────────────────────

// Cache d'abord, réseau en fallback
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

// Réseau d'abord, cache en fallback (avec TTL en secondes)
async function networkFirst(request, cacheName, ttl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const toCache = response.clone();
      // Ajoute un header timestamp pour le TTL
      const headers = new Headers(toCache.headers);
      headers.append('sw-fetched-at', Date.now().toString());
      const body = await toCache.arrayBuffer();
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

// ── MESSAGE : force update ────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
