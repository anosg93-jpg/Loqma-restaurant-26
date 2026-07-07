const CACHE_NAME = 'loqma-cache-v3';

// التثبيت الفوري وتخطي الانتظار
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// تفعيل السيرفس وركر ومسح الكاش القديم فوراً
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

// استراتيجية (Network-First) جلب التعديلات الجديدة أولاً من السيرفر لضمان ظهور تحديث الاندكس
self.addEventListener('fetch', (event) => {
    // تفعيل الاستراتيجية للملفات النصية وصفحة الاندكس لتحديثها فورا
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // باقي الملفات (الصور والتنسيقات)
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((response) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            })
        );
    }
});
