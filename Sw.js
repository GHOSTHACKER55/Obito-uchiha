self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open('obito-game').then(cache=>{
      return cache.addAll([
        './',
        'index.html'
      ]);
    })
  );
});
