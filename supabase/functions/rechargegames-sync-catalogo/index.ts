import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RECHARGE_KEY = Deno.env.get("RECHARGEGAMES_API_KEY") ?? "";
const PROVIDER = "rechargegames";
const API = "https://api.rechargegame.games";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const GAME_ALIASES: Record<string, string> = {
  "free fire": "free-fire", "free_fire": "free-fire",
  "mobile legends": "mobile-legends", "mobile_legends": "mobile-legends",
  "pubg mobile": "pubg-mobile", "pubg_mobile": "pubg-mobile",
  "genshin impact": "genshin-impact", "genshin_impact": "genshin-impact",
  "honor of kings": "honor-of-kings", "honor_of_kings": "honor-of-kings",
  "arena breakout": "arena-breakout", "arena_breakout": "arena-breakout",
  "blood strike": "blood-strike", "blood_strike": "blood-strike",
  "call of duty mobile": "call-of-duty-mobile", "call_of_duty_mobile": "call-of-duty-mobile",
  "roblox": "roblox",
};

function normalizeGame(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim().toLowerCase();
  return GAME_ALIASES[raw] ?? raw.replace(/_/g, "-").replace(/\s+/g, "-");
}

function asNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// verify_jwt=true validates the token signature before this handler runs.
// We then authorize only JWTs whose verified payload declares role=service_role.
function hasServiceRoleClaim(req: Request): boolean {
  const authorization = req.headers.get("Authorization") ?? "";
  const match = authorization.match(/^Bearer\s+([A-Za-z0-9._-]+)$/);
  if (!match) return false;
  const parts = match[1].split(".");
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    return payload?.role === "service_role";
  } catch {
    return false;
  }
}

type ProductRow = Record<string, unknown>;

// RechargeGames documented shape:
// categories[].slug/kind -> groups[].slug (region) -> products[].
function flattenCatalog(payload: unknown): ProductRow[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  if (!Array.isArray(root.categories)) return [];

  const rows: ProductRow[] = [];
  const seen = new Set<string>();

  for (const categoryValue of root.categories) {
    if (!categoryValue || typeof categoryValue !== "object") continue;
    const category = categoryValue as Record<string, unknown>;
    const game = normalizeGame(category.slug);
    const kind = String(category.kind ?? "topup").toLowerCase();
    if (!game || !Array.isArray(category.groups)) continue;

    for (const groupValue of category.groups) {
      if (!groupValue || typeof groupValue !== "object") continue;
      const group = groupValue as Record<string, unknown>;
      const region = typeof group.slug === "string" && group.slug.trim() ? group.slug.trim() : null;
      if (!Array.isArray(group.products)) continue;

      for (const productValue of group.products) {
        if (!productValue || typeof productValue !== "object") continue;
        const product = productValue as Record<string, unknown>;
        const productKey = typeof product.product_key === "string" ? product.product_key.trim() : "";
        const name = typeof product.name === "string" ? product.name.trim() : "";
        if (!productKey || !name || seen.has(productKey)) continue;
        seen.add(productKey);
        rows.push({
          ...product,
          __game: game,
          __kind: kind,
          __region: region,
          __raw_context: { category: { slug: category.slug, kind: category.kind }, group: { slug: group.slug } },
        });
      }
    }
  }
  return rows;
}

function toDatabaseRow(p: ProductRow, syncedAt: string) {
  const delivery = String(p.delivery ?? "").toLowerCase();
  const kind = String(p.__kind ?? "topup").toLowerCase();
  const productType = kind.includes("gift") ? "GIFTCARD" : "TOPUP";
  const price = asNumber(p.price);
  const outOfStock = p.out_of_stock === true || p.outOfStock === true;
  const explicitlyUnavailable = p.available === false || p.active === false || p.enabled === false;
  const regionValue = p.__region ?? p.region ?? p.region_name ?? p.server_region ?? null;
  const region = typeof regionValue === "string" && regionValue.trim() ? regionValue.trim() : null;
  const requiresPlayerId = delivery === "player_id" || p.requires_player_id === true || p.requiresPlayerId === true;
  const requiresZoneId = (productType === "TOPUP" && game === "mobile-legends") ||
    p.requires_zone_id === true || p.requiresZoneId === true ||
    p.requires_server_id === true || p.requiresServerId === true ||
    p.server_id_required === true || p.serverIdRequired === true;

  return {
    provider: PROVIDER,
    provider_product_id: String(p.product_key),
    game: String(p.__game),
    product_type: productType,
    name: String(p.name),
    region,
    cost: price,
    cost_currency: price === null ? null : "USDT",
    list_price: null,
    discount_percent: null,
    face_value: p.face_value ?? p.amount ?? null,
    available: !outOfStock && !explicitlyUnavailable,
    requires_player_id: requiresPlayerId,
    requires_zone_id: requiresZoneId,
    supports_player_validation: p.supports_player_validation === true || p.supportsPlayerValidation === true,
    raw_payload: { product: p, catalog_context: p.__raw_context ?? null },
    synced_at: syncedAt,
    updated_at: syncedAt,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: cors });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !RECHARGE_KEY) {
    return Response.json({ ok: false, error: "server_secrets_missing" }, { status: 500, headers: cors });
  }

  if (!hasServiceRoleClaim(req)) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403, headers: cors });
  }

  try {
    const commonHeaders = {
      "X-API-Key": RECHARGE_KEY,
      Accept: "application/json",
      "User-Agent": "GamersGoldTopUp/1.0",
    };

    const ping = await fetch(API + "/v1/ping", {
      headers: commonHeaders,
      signal: AbortSignal.timeout(15000),
    });
    if (!ping.ok) {
      return Response.json({ ok: false, error: "rechargegames_auth_failed", provider_status: ping.status }, { status: 502, headers: cors });
    }

    const response = await fetch(API + "/v1/products?all=true", {
      headers: commonHeaders,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      return Response.json({ ok: false, error: "rechargegames_catalog_failed", provider_status: response.status }, { status: 502, headers: cors });
    }

    const payload = await response.json();
    const products = flattenCatalog(payload);
    if (products.length === 0) {
      return Response.json({ ok: false, error: "catalog_shape_unrecognized_no_changes_made" }, { status: 422, headers: cors });
    }

    const syncedAt = new Date().toISOString();
    const rows = products.map((p) => toDatabaseRow(p, syncedAt));
    const invalid = rows.filter((r) => !r.provider_product_id || !r.game || !r.name);
    if (invalid.length) {
      return Response.json({ ok: false, error: "catalog_contains_invalid_products_no_changes_made" }, { status: 422, headers: cors });
    }

    let upserted = 0;
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const url = new URL("/rest/v1/provider_products", SUPABASE_URL);
      url.searchParams.set("on_conflict", "provider,provider_product_id");
      const write = await fetch(url, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: "Bearer " + SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(batch),
        signal: AbortSignal.timeout(20000),
      });
      if (!write.ok) {
        const detail = (await write.text()).slice(0, 500);
        return Response.json({ ok: false, error: "database_upsert_failed", saved_before_error: upserted, detail }, { status: 502, headers: cors });
      }
      upserted += batch.length;
    }

    return Response.json({
      ok: true,
      provider: PROVIDER,
      fetched: products.length,
      upserted,
      synced_at: syncedAt,
      note: "Catalog sync only. No orders were created and provider balance was not used.",
    }, { headers: { ...cors, "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("RECHARGEGAMES_CATALOG_SYNC_FAILED", error);
    return Response.json({ ok: false, error: "catalog_sync_unavailable" }, { status: 502, headers: cors });
  }
});