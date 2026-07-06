const CACHE_NAME = 'loqma-app-v2'; // قمنا بتغيير الإصدار لضمان التحديث

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // هذه الاستراتيجية تجلب التحديثات أولاً من الشبكة لضمان ظهور أي تعديل جديد
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
