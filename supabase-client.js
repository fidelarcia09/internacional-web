import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SUPABASE_URL = "https://fyyebxjysrhcxgmgperf.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mD_KmxXF8wtT-7w08ECpUQ_xzhxsy3P";
export const SITE_URL = "https://fidelarcia09.github.io/internacional-web/";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});


// Si la cuenta tiene un factor TOTP verificado, no permitir que una sesión AAL1
// permanezca en páginas privadas: debe completar primero el segundo paso.
const currentPage = window.location.pathname.split("/").pop() || "";
const mfaExemptPages = new Set(["login.html", "verificar-2fa.html", "registro.html"]);
if (!mfaExemptPages.has(currentPage)) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (!session || !["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) return;
    window.setTimeout(async () => {
      const { data: current } = await supabase.auth.getSession();
      if (!current?.session) return;
      const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!error && assurance?.nextLevel === "aal2" && assurance?.currentLevel !== "aal2") {
        const basePath = new URL(SITE_URL).pathname;
        const currentPath = window.location.pathname.startsWith(basePath)
          ? window.location.pathname.slice(basePath.length)
          : "index.html";
        const returnTo = currentPath + window.location.search + window.location.hash;
        if (returnTo && returnTo !== "verificar-2fa.html") {
          sessionStorage.setItem("mfa_return_to", returnTo);
        }
        window.location.replace(SITE_URL + "verificar-2fa.html");
      }
    }, 0);
  });
}
