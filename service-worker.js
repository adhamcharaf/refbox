/* ============================================
   REFBOX - Service Worker
   Support offline et mise en cache
   ============================================ */

const CACHE_VERSION = 'refbox-v1.0.0';
const CACHE_NAME = `refbox-cache-${CACHE_VERSION}`;

// Fichiers à mettre en cache immédiatement lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/propose-ref.html',
  '/propose-son.html'
];

/* ============================================
   INSTALLATION
   ============================================ */

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation en cours...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation terminée');
        // Forcer l'activation immédiate
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Erreur lors de l\'installation:', error);
      })
  );
});

/* ============================================
   ACTIVATION
   ============================================ */

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation en cours...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Supprimer les anciens caches
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Suppression du cache obsolète:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation terminée');
        // Prendre le contrôle de tous les clients immédiatement
        return self.clients.claim();
      })
  );
});

/* ============================================
   STRATÉGIES DE CACHE
   ============================================ */

// Network First pour refs.json (toujours à jour)
async function networkFirst(request) {
  try {
    // Essayer d'obtenir la ressource du réseau
    const networkResponse = await fetch(request);

    // Si succès, mettre en cache et retourner
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    // Si échec, essayer le cache
    return await caches.match(request);
  } catch (error) {
    // En cas d'erreur réseau, utiliser le cache
    console.log('[Service Worker] Network First - Utilisation du cache pour:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si pas de cache, retourner une réponse d'erreur
    return new Response(
      JSON.stringify({ error: 'Offline', refs: [] }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First pour assets statiques
async function cacheFirst(request) {
  // Essayer d'abord le cache
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[Service Worker] Cache First - Cache hit pour:', request.url);
    return cachedResponse;
  }

  // Si pas en cache, essayer le réseau
  try {
    const networkResponse = await fetch(request);

    // Mettre en cache si succès
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache First - Erreur:', error);

    // Retourner une page offline de secours
    return new Response(
      '<h1>Offline</h1><p>Impossible de charger cette ressource sans connexion.</p>',
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Network Only pour Formspree et fichiers audio
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[Service Worker] Network Only - Erreur:', error);
    return new Response(
      JSON.stringify({ error: 'Impossible de soumettre sans connexion' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/* ============================================
   INTERCEPTION DES REQUÊTES
   ============================================ */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer les requêtes vers Formspree (toujours réseau)
  if (url.hostname === 'formspree.io') {
    event.respondWith(networkOnly(request));
    return;
  }

  // Network First pour refs.json
  if (url.pathname.includes('refs.json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Network Only pour les fichiers audio (sounds/)
  if (url.pathname.includes('/sounds/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response('Audio non disponible offline', { status: 503 });
      })
    );
    return;
  }

  // Cache First pour tout le reste (HTML, CSS, JS, images)
  event.respondWith(cacheFirst(request));
});

/* ============================================
   MESSAGES DU CLIENT
   ============================================ */

self.addEventListener('message', (event) => {
  // Permettre au client de forcer le rafraîchissement du cache
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Vider le cache à la demande
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

/* ============================================
   GESTION DES ERREURS
   ============================================ */

self.addEventListener('error', (event) => {
  console.error('[Service Worker] Erreur:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Promise rejetée:', event.reason);
});

console.log('[Service Worker] Chargé - Version:', CACHE_VERSION);
