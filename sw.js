const CACHE_NAME = "internacional-web-home-image-v15";
const IMAGE_PATHS = [
  "fuentes/personaje_gamer_cuadrado.webp",
  "fuentes/roblox_tienda_banner.webp",
  "fuentes/novatopup_tienda_banner.webp",
  "fuentes/novatopup_tienda_banner(1).webp",
  "fuentes/blood_strike.webp",
  "fuentes/free_fire.webp",
  "fuentes/honor_of_kings.webp",
  "fuentes/arena_breakout.webp",
  "fuentes/call_of_duty.webp",
  "fuentes/genshin_impact.webp",
  "fuentes/grok_1795312374293.webp",
  "fuentes/grok_1795312370899.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cada imagen se guarda de forma independiente: un fallo temporal
    // no debe cancelar la instalación ni impedir guardar las demás.
    await Promise.all(IMAGE_PATHS.map(async (path) => {
      const imageUrl = new URL(path, self.registration.scope).href;
      let lastError = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await fetch(imageUrl, { cache: "reload" });
          if (!response.ok) throw new Error("HTTP " + response.status);
          await cache.put(imageUrl, response);
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (lastError) {
        console.warn("No se pudo precargar la imagen; se intentará al solicitarla:", path, lastError);
      }
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


self.addEventListener("push", event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "INTERNACIONAL WEB";
  const options = {
    body: payload.body || "Tienes una actualización sobre tu cuenta.",
    icon: new URL("fuentes/personaje_gamer_cuadrado.webp", self.registration.scope).href,
    data: { url: payload.url || "notificaciones.html" },
    tag: payload.tag || "internacional-web-notification",
    renotify: false,
    timestamp: Date.now()
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || "notificaciones.html",
    self.registration.scope
  ).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of windows) {
      if (client.url.startsWith(self.registration.scope) && "focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(targetUrl);
        return;
      }
    }

    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});
