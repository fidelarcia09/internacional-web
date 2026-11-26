import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const GAMES = new Set([
  "free-fire", "mobile-legends", "pubg-mobile", "roblox",
  "genshin-impact", "honor-of-kings", "arena-breakout",
  "blood-strike", "call-of-duty-mobile",
]);

function retailPriceUSDT(cost: number): number {
  return Math.ceil((cost * 1.10 * 100) - 1e-8) / 100;
}

async function resellerProgress(userId: string) {
  const roleUrl = new URL("/rest/v1/user_roles", SB);
  roleUrl.searchParams.set("select", "assigned_at,manual_reseller_level");
  roleUrl.searchParams.set("user_id", "eq." + userId);
  roleUrl.searchParams.set("role_id", "eq.revendedor");
  roleUrl.searchParams.set("order", "assigned_at.desc");
  roleUrl.searchParams.set("limit", "1");
  const roleResponse = await fetch(roleUrl, {
    headers: { apikey: SERVICE, Authorization: "Bearer " + SERVICE, Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!roleResponse.ok) throw new Error("RESELLER_ROLE_LOOKUP_FAILED");
  const roles = await roleResponse.json();
  if (!Array.isArray(roles) || !roles[0]?.assigned_at) {
    return { isReseller: false, completedTopups: 0, level: 0, discountPercent: 0, nextLevelAt: 0 };
  }
  const assignedAt = String(roles[0].assigned_at);
  const countUrl = new URL("/rest/v1/usdt_orders", SB);
  countUrl.searchParams.set("select", "id");
  countUrl.searchParams.set("user_id", "eq." + userId);
  countUrl.searchParams.set("status", "eq.completed");
  countUrl.searchParams.set("created_at", "gte." + assignedAt);
  const countResponse = await fetch(countUrl, {
    method: "HEAD",
    headers: {
      apikey: SERVICE, Authorization: "Bearer " + SERVICE,
      Accept: "application/json", Prefer: "count=exact", Range: "0-0",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!countResponse.ok) throw new Error("RESELLER_ORDER_COUNT_FAILED");
  const range = countResponse.headers.get("content-range") || "";
  const total = Number(range.split("/")[1]);
  const completedTopups = Number.isFinite(total) ? total : 0;
  const levels = [
    { level: 1, min: 0, discountPercent: 1 },
    { level: 2, min: 25, discountPercent: 2 },
    { level: 3, min: 50, discountPercent: 3 },
    { level: 4, min: 90, discountPercent: 5 },
  ];
  const automatic = [...levels].reverse().find((item) => completedTopups >= item.min) ?? levels[0];
  const manualLevel = Number(roles[0].manual_reseller_level);
  const hasManualLevel = Number.isInteger(manualLevel) && manualLevel >= 1 && manualLevel <= 4;
  const current = hasManualLevel ? levels[manualLevel - 1] : automatic;
  const next = levels.find((item) => item.level > current.level);
  return {
    isReseller: true, assignedAt, completedTopups,
    level: current.level, discountPercent: current.discountPercent,
    manualLevel: hasManualLevel ? manualLevel : null,
    isManualLevel: hasManualLevel,
    nextLevelAt: next?.min ?? 90,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") {
    return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: cors });
  }
  const url = new URL(req.url);
  const game = url.searchParams.get("game") ?? "";
  if (!GAMES.has(game)) {
    return Response.json({ ok: false, error: "unsupported_game" }, { status: 400, headers: cors });
  }
  if (!SB || !SERVICE) {
    return Response.json({ ok: false, error: "catalog_server_not_configured" }, { status: 500, headers: cors });
  }
  let reseller = { isReseller: false, completedTopups: 0, level: 0, discountPercent: 0, nextLevelAt: 0 };
  const authorization = req.headers.get("Authorization") ?? "";
  if (authorization.startsWith("Bearer ")) {
    try {
      const userResponse = await fetch(SB + "/auth/v1/user", {
        headers: { apikey: SERVICE, Authorization: authorization },
        signal: AbortSignal.timeout(8000),
      });
      if (userResponse.ok) {
        const user = await userResponse.json();
        if (user?.id) reseller = await resellerProgress(user.id);
      }
    } catch (error) {
      console.error("RESELLER_PROGRESS_LOOKUP_FAILED", error);
      return Response.json({ ok: false, error: "reseller_progress_unavailable" }, { status: 503, headers: cors });
    }
  }
  const query = new URL("/rest/v1/provider_products", SB);
  query.searchParams.set("select", "provider_product_id,game,product_type,name,region,cost,cost_currency,available,requires_player_id,requires_zone_id");
  query.searchParams.set("provider", "eq.rechargegames");
  query.searchParams.set("game", "eq." + game);
  query.searchParams.set("product_type", "eq.TOPUP");
  query.searchParams.set("available", "eq.true");
  query.searchParams.set("order", "region.asc,name.asc");
  try {
    const response = await fetch(query, {
      headers: { apikey: SERVICE, Authorization: "Bearer " + SERVICE, Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      console.error("RECHARGEGAMES_CATALOG_READ_FAILED", response.status);
      return Response.json({ ok: false, error: "catalog_read_failed" }, { status: 502, headers: cors });
    }
    const rows = await response.json();
    const products = Array.isArray(rows) ? rows.map((p: any) => {
      const cost = Number(p.cost);
      const hasValidCost = Number.isFinite(cost) && cost > 0 && p.cost_currency === "USDT";
      return {
        productId: p.provider_product_id,
        game: p.game,
        type: p.product_type,
        name: p.name,
        region: p.region ?? "Global",
        priceUSDT: hasValidCost ? retailPriceUSDT(cost) : null,
        currency: hasValidCost ? "USDT" : null,
        requiresPlayerId: p.requires_player_id === true,
        requiresZoneId: p.requires_zone_id === true,
        // RechargeGames Order API does not expose a player-validation route in the supplied integration guide.
        supportsPlayerValidation: false,
      };
    }) : [];
    return Response.json({
      ok: true, provider: "rechargegames", game, count: products.length,
      pricing: { marginPercent: 10, currency: "USDT", rounding: "up_to_0.01" },
      products, reseller,
    }, {
      headers: { ...cors, "Cache-Control": authorization ? "private, no-store" : "public, max-age=60, s-maxage=300" },
    });
  } catch (error) {
    console.error("RECHARGEGAMES_CATALOG_UNAVAILABLE", error);
    return Response.json({ ok: false, error: "catalog_unavailable" }, { status: 502, headers: cors });
  }
});