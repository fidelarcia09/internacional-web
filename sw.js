const CACHE_NAME = "internacional-web-home-image-v2";
const IMAGE_PATHS = [
  "fuentes/personaje_gamer_cuadrado.webp",
  "fuentes/novatopup_tienda_banner.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(IMAGE_PATHS.map(async (path) => {
      const imageUrl = new URL(path, self.registration.scope).href;
      const response = await fetch(imageUrl, { cache: "reload" });
      if (!response.ok) throw new Error("No se pudo guardar la imagen: " + path);
      await cache.put(imageUrl, response);
    }));
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
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const imageUrl = IMAGE_PATHS
    .map((path) => new URL(path, self.registration.scope))
    .find((url) => url.href === requestUrl.href);
  if (!imageUrl) return;

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
