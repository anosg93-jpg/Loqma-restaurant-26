const CACHE_NAME = 'loqma-cache-v2029';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// خطوة التثبيت - الكاش الأولي للملفات الثابتة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// خطوة التنشيط وتنظيف الكاشات القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('حذف ملفات الكاش القديمة لمطعم لقمه');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية جلب البيانات (الإنترنت أولاً مع حفظ الكاش ليعمل أوفلاين)
self.addEventListener('fetch', (event) => {
  // استثناء روابط جوجل شيت والواتساب تماماً من الكاش عشان التحديث اللحظي وسير العمل
  if (event.request.url.includes('docs.google.com') || event.request.url.includes('wa.me')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
