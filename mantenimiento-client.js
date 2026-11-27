export function initStoreMaintenance(supabase) {
  if (window.__GG_STORE_MAINTENANCE_INITIALIZED__) return;
  window.__GG_STORE_MAINTENANCE_INITIALIZED__ = true;

  const state = { enabled: false, loaded: false, updatedAt: 0 };
  const pathname = window.location.pathname;
  const basename = pathname.replace(/\/+$/, "").split("/").pop() || "";
  const isHome = pathname.endsWith("/") || basename.toLowerCase() === "index.html";

  const style = document.createElement("style");
  style.id = "gg-store-maintenance-styles";
  style.textContent = `
    .gg-maintenance-banner {
      position: relative;
      z-index: 10001;
      width: 100%;
      padding: 10px 14px;
      border-bottom: 1px solid #a87845;
      background: linear-gradient(100deg, #382719, #563b28 52%, #382719);
      color: #f8eadb;
      text-align: center;
      font: 800 12px/1.45 Inter, sans-serif;
      letter-spacing: .25px;
      box-shadow: 0 4px 18px #0003;
    }
    .gg-maintenance-banner span { display: inline-block; max-width: 100%; }
    .gg-maintenance-blocked {
      opacity: .48 !important;
      filter: saturate(.35) !important;
      cursor: not-allowed !important;
      box-shadow: none !important;
      outline-color: #9a704d !important;
    }
    .gg-maintenance-toast {
      position: fixed;
      z-index: 100000;
      top: 14px;
      left: 50%;
      width: min(440px, calc(100% - 28px));
      transform: translateX(-50%);
      padding: 13px 16px;
      border: 1px solid #a87845;
      border-radius: 13px;
      background: #382719;
      color: #f8eadb;
      box-shadow: 0 12px 35px #0008;
      font: 700 12px/1.5 Inter, sans-serif;
      text-align: center;
    }
    @media (prefers-reduced-motion: reduce) {
      .gg-maintenance-banner, .gg-maintenance-toast { transition: none !important; animation: none !important; }
    }
  `;
  document.head.append(style);

  let banner = null;
  if (isHome) {
    banner = document.createElement("div");
    banner.className = "gg-maintenance-banner";
    banner.hidden = true;
    banner.setAttribute("role", "status");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = "<span>Tienda en Mantenimiento</span>";
    document.body.insertBefore(banner, document.body.firstChild);
  }

  let toastTimer = null;
  function showBlockedMessage() {
    const message = state.enabled
      ? "Tienda en mantenimiento: las compras y nuevas recargas están temporalmente deshabilitadas."
      : "No podemos comprobar el estado de la tienda. Por seguridad, esta operación está temporalmente bloqueada.";
    let toast = document.querySelector(".gg-maintenance-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "gg-maintenance-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast?.remove(), 4200);
  }

  function isDepositVerification(button) {
    return (button.id === "payButton" || button.id === "pay-button") &&
      button.dataset.maintenancePending === "true";
  }

  function isPurchaseControl(button) {
    if (button.id === "payButton" || button.id === "pay-button") return true;
    if (button.id === "buy-button" || button.hasAttribute("data-maintenance-purchase")) return true;
    const label = (button.innerText || button.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("es");
    return /^(comprar oferta|comprar|comprar ahora|comprar usdt|recargar|recargar ahora|pagar|pagar ahora|finalizar compra)$/.test(label);
  }

  function refreshControls() {
    const blocked = !state.loaded || state.enabled;
    document.querySelectorAll("button").forEach(button => {
      if (!isPurchaseControl(button)) return;
      const shouldBlock = blocked && !isDepositVerification(button);
      button.classList.toggle("gg-maintenance-blocked", shouldBlock);
      if (shouldBlock) {
        button.setAttribute("aria-disabled", "true");
        button.dataset.ggMaintenanceBlocked = "true";
      } else {
        button.removeAttribute("aria-disabled");
        delete button.dataset.ggMaintenanceBlocked;
      }
    });

    if (banner) banner.hidden = !(state.loaded && state.enabled);
    window.GG_STORE_MAINTENANCE_ACTIVE = state.enabled;
    window.GG_STORE_MAINTENANCE_READY = state.loaded;
    window.dispatchEvent(new CustomEvent("gg:store-maintenance-change", {
      detail: { enabled: state.enabled, ready: state.loaded }
    }));
  }

  document.addEventListener("click", event => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (!button || !isPurchaseControl(button)) return;
    if (isDepositVerification(button)) return;
    if (!state.loaded || state.enabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showBlockedMessage();
    }
  }, true);

  function applyState(row) {
    if (!row || typeof row.enabled !== "boolean") return;
    const updatedAt = row.updated_at ? Date.parse(row.updated_at) || 0 : Date.now();
    if (state.loaded && updatedAt && updatedAt < state.updatedAt) return;
    state.enabled = row.enabled;
    state.loaded = true;
    state.updatedAt = updatedAt;
    refreshControls();
  }

  const channel = supabase
    .channel("gg-store-maintenance-global")
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "store_maintenance"
    }, payload => applyState(payload.new))
    .subscribe();

  supabase
    .from("store_maintenance")
    .select("enabled,updated_at")
    .eq("id", true)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error || !data) {
        console.warn("No se pudo comprobar el estado de mantenimiento:", error);
        return;
      }
      applyState(data);
    })
    .catch(error => console.warn("No se pudo cargar el estado de mantenimiento:", error));

  window.addEventListener("beforeunload", () => {
    supabase.removeChannel(channel);
  }, { once: true });
}
