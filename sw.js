// FarmaQuiz Service Worker v1.0
const CACHE = 'farmaquiz-v1';
const ASSETS = [
  '/farmaquiz/',
  '/farmaquiz/index.html',
  '/farmaquiz/manifest.json',
  '/farmaquiz/icons/icon-192.png',
  '/farmaquiz/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;700;800;900&display=swap'
];

// Instalar y cachear assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS.map(url => new Request(url, {mode:'no-cors'}))).catch(()=>{});
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches antiguas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache first, network fallback
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/farmaquiz/'));
    })
  );
});
