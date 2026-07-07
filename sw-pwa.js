const CACHE_NAME = 'loqma-clean-v5';
const ASSETS = [
  'index.html',
  'manifest.json',
  'images/logoloqma.jpg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// استراتيجية جلب ذكية ومستقرة تمنع الـ Loop نهائياً
self.addEventListener('fetch', (event) => {
    // عدم تفعيل الكاش على روابط الـ Google Sheets الخارجية لضمان جلب الأسعار الحية دائماً
    if (event.request.url.includes('docs.google.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // تحديث الخلفية بهدوء وبدون عمل Loop في الصفحة للعميل
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
                    }
                }).catch(() => {/* صامت */});
                
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
