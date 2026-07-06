const CACHE_NAME = 'loqma-v1.0.1'; // غير الرقم عند كل تحديث جذري للكود
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// تثبيت التطبيق وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// تحديث الكود القديم وحذف التخزين المؤقت
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
});

// تشغيل التطبيق أوفلاين
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
