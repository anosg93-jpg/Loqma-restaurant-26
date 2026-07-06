const CACHE_NAME = 'loqma-cache-v2026';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json'
];

// خطوة التثبيت للملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // تفعيل فوري للإصدار الجديد
  );
});

// خطوة تنظيف الكاش القديم وتحديث البيانات فوراً للعميل
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('إزالة الكاش القديم لـ مطعم لقمه');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية النتوورك أولاً ثم الكاش لتحديث لحظي لأسعار منيو جوجل شيت
self.addEventListener('fetch', (event) => {
  // عدم عمل كاش لطلبات جوجل شيتس أو الواتساب حتى لا تتوقف المبيعات أو تتأخر الأسعار
  if (event.request.url.includes('docs.google.com') || event.request.url.includes('wa.me')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // إذا نجح الاتصال، نحدث الكاش بالنسخة الجديدة
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // إذا كان العميل أوفلاين، نسحب فوراً من الكاش ليعمل التطبيق بدون إنترنت
        return caches.match(event.request);
      })
  );
});
