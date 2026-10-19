const CACHE_NAME = 'mmo-v2.40';
// app.js/styles.css/firebase-config.js no existen en /mmo/ (el index es
// autocontenido) y el manifest de esta app es manifest.webmanifest.
const urlsToCache = [
    './',
    './index.html',
    './manifest.webmanifest',
    'https://unpkg.com/html5-qrcode'
];

// Instalación
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Activación - limpiar caches antiguas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => {
            return Promise.all(
                names.filter(name => name !== CACHE_NAME && (name.startsWith('mmo-v') || name.startsWith('qr-scanner-')))
                    .map(name => caches.delete(name))
            );
        })
    );
});

// Estrategia: Network First (siempre intenta red, si falla usa cache)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clonar y guardar en cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});