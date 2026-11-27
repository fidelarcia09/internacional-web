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
      position: sticky;
      top: var(--gg-maintenance-header-offset, 84px);
      z-index: 8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 13px;
      width: 100vw;
      min-height: 66px;
      margin-left: calc(50% - 50vw);
      padding: 14px clamp(18px, 7vw, 110px);
      border-top: 1px solid #9a704d;
      border-bottom: 1px solid #a87845;
      background: linear-gradient(100deg, #382719, #563b28 52%, #382719);
      color: #f8eadb;
      text-align: center;
      font: 800 14px/1.35 Inter, sans-serif;
      letter-spacing: .45px;
      box-shadow: 0 7px 22px #0005;
    }
    .gg-maintenance-banner svg {
      display: block;
      flex: 0 0 27px;
      width: 27px;
      height: 27px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 0 5px #f8eadb55);
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
    @media (max-width: 620px) {
      .gg-maintenance-banner {
        min-height: 60px;
        gap: 10px;
        padding: 12px 16px;
        font-size: 13px;
      }
      .gg-maintenance-banner svg {
        flex-basis: 24px;
        width: 24px;
        height: 24px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .gg-maintenance-banner, .gg-maintenance-toast { transition: none !important; animation: none !important; }
    }
  `;
  document.head.append(style);

  let banner = null;
  if (isHome) {
    const header = document.querySelector(".topbar");
    const syncHeaderOffset = () => {
      const height = header?.getBoundingClientRect().height || 84;
      document.documentElement.style.setProperty("--gg-maintenance-header-offset", height + "px");
    };
    syncHeaderOffset();
    window.addEventListener("resize", syncHeaderOffset, { passive: true });

    banner = document.createElement("div");
    banner.className = "gg-maintenance-banner";
    banner.hidden = true;
    banner.setAttribute("role", "status");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14.2 5.1a5.6 5.6 0 0 0-6.9 7.1l-4.5 4.5a2.2 2.2 0 0 0 3.1 3.1l4.5-4.5a5.6 5.6 0 0 0 7.1-6.9l-3.2 3.2-3.3-3.3 3.2-3.2Z"/>
        <path d="m5.1 18.9 0 0"/>
      </svg>
      <span>Tienda en Mantenimiento</span>
    `;
    if (header?.parentNode) header.insertAdjacentElement("afterend", banner);
    else document.body.insertBefore(banner, document.body.firstChild);
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
