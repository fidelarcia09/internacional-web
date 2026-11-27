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
      gap: 12px;
      box-sizing: border-box;
      width: min(560px, calc(100% - 36px));
      min-width: 0;
      min-height: 62px;
      margin: 14px auto 18px;
      padding: 13px 22px;
      border: 1px solid #a87845;
      border-radius: 12px 4px 12px 4px;
      background: linear-gradient(112deg, #241b18 0%, #49301f 48%, #2c211b 100%);
      color: #f8eadb;
      text-align: center;
      font: 800 14px/1.35 Inter, sans-serif;
      letter-spacing: .55px;
      box-shadow: 0 7px 22px #0006, inset 0 1px 0 #ffffff12;
    }
    .gg-maintenance-banner[hidden] {
      display: none !important;
    }
    .gg-maintenance-banner svg {
      display: block;
      flex: 0 0 30px;
      width: 30px;
      height: 30px;
      box-sizing: border-box;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 0 3px #ffffff55);
    }
    .gg-maintenance-banner span {
      display: inline-block;
      max-width: 100%;
      text-wrap: balance;
    }
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
        width: calc(100% - 28px);
        min-height: 58px;
        gap: 10px;
        margin: 12px auto 16px;
        padding: 11px 14px;
        font-size: 13px;
        border-radius: 10px 3px 10px 3px;
      }
      .gg-maintenance-banner svg {
        flex-basis: 26px;
        width: 26px;
        height: 26px;
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
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.4-3.4a6 6 0 0 1-7.9 7.9l-6.2 6.2a2.1 2.1 0 0 1-3-3l6.2-6.2a6 6 0 0 1 7.9-7.9z"/>
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
