// =====================================================
// SERVICE WORKER: guarda la app en el móvil para que
// funcione sin cobertura ni datos.
// =====================================================

// Nombre de la "caja" donde se guardan los archivos.
// Si algún día quieres forzar una actualización, cambia v3 por v4.
const CACHE_NAME = "utm-app-v3";

// Archivos que se guardan la primera vez que abres la app con internet.
// IMPORTANTE: todos deben existir en la carpeta (incluidos los dos iconos).
const ARCHIUS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./proj4.js",
  "./icon-192.png",
  "./icon-512.png"
];

// 1) INSTALACIÓN: guarda todos los archivos de la lista.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIUS))
  );
  self.skipWaiting();
});

// 2) ACTIVACIÓN: borra cajas de versiones antiguas (la v2 de antes).
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(noms =>
      Promise.all(noms.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// 3) CADA PETICIÓN: responde con lo guardado (rápido y sin internet)
//    y, si hay internet, actualiza la copia guardada para la próxima vez.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(guardat => {
      const descarrega = fetch(event.request)
        .then(resposta => {
          if (resposta && resposta.ok) {
            const copia = resposta.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, copia));
          }
          return resposta;
        })
        .catch(() => guardat); // sin internet: usa lo guardado

      return guardat || descarrega;
    })
  );
});
