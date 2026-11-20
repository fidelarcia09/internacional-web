const CACHE_NAME = "internacional-web-home-image-v1";
const IMAGE_PATH = "fuentes/personaje_gamer_cuadrado.webp";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const imageUrl = new URL(IMAGE_PATH, self.registration.scope).href;
    const response = await fetch(imageUrl, { cache: "reload" });
    if (!response.ok) throw new Error("No se pudo guardar la imagen principal");
    await cache.put(imageUrl, response);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("internacional-web-home-image-") && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  const imageUrl = new URL(IMAGE_PATH, self.registration.scope);
  if (event.request.method !== "GET" || requestUrl.href !== imageUrl.href) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(imageUrl.href);
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(imageUrl.href, response.clone());
      return response;
    } catch (error) {
      return new Response("", { status: 503, statusText: "Imagen no disponible sin conexión" });
    }
  })());
});
