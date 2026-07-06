const CACHE_NAME = 'loqma-cache-v1.0.1'; // تغيير رقم الإصدار هنا عند رفع كود جديد يجبر أجهزة الزبائن على التحديث الفوري
const ASSETS = [
  'index.html',
  'manifest.json',
  'images/logoloqma.jpg'
];

// تثبيت الـ Service Worker وحفظ الملفات الأساسية
self.addEventListener('install', (e) => {
  self.skipWaiting(); // تفعيل التحديث فوراً دون انتظار إغلاق المتصفح
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// تدمير وحذف الكاش القديم نهائياً بمجرد رفع نسخة جديدة
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // فرض السيطرة الفورية على كل التابات المفتوحة وتحديثها
  );
});

// استراتيجية جلب البيانات: الفحص من الشبكة أولاً مع إضافة بارامتر زمني لمنع التخزين المؤقت
self.addEventListener('fetch', (e) => {
  // عدم تخزين بيانات شيتات جوجل أو أي طلبات خارجية ديناميكية لضمان حيويتها
  if (e.request.url.includes('google.com') || e.request.url.includes('nocache')) {
    return e.respondWith(fetch(e.request));
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // تحديث الكاش بالنسخة الجديدة المستلمة من السيرفر بشكل ديناميكي
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(e.request)) // في حال انقطاع الشبكة يتم جلب البيانات من الكاش المحفوظ بأمان لضمان سرعة التطبيق
  );
});
