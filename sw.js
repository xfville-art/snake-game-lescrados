/* CarbuFuel — Service Worker
 * Stratégie : Network-first pour les assets statiques,
 *             réseau uniquement pour les API externes.
 */
const CACHE_NAME = 'carbufuel-v4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

/* Domaines API : jamais mis en cache (données temps réel) */
const API_HOSTS = [
  'api.prix-carburants.2aaz.fr',
  'api-adresse.data.gouv.fr',
  'logo.clearbit.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/* ── Install : pré-cache des assets statiques ─────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate : suppression des anciens caches ───────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch : réseau-first avec fallback cache ────────────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* API externes : réseau uniquement, pas de cache */
  if (API_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(
      fetch(event.request).catch(
        () => new Response(JSON.stringify({ error: 'offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  /* Assets statiques : réseau d'abord, mise à jour du cache, fallback cache */
  event.respondWith(
    fetch(event.request)
      .then(response => {
        /* On ne cache que les réponses valides */
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
