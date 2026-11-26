import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "server_configuration_error" }, 500);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    const actor = authData?.user;
    if (authError || !actor) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: actorRole, error: actorRoleError } = await admin
      .from("user_roles")
      .select("role_id")
      .eq("user_id", actor.id)
      .eq("role_id", "admin")
      .maybeSingle();
    if (actorRoleError || !actorRole) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const targetId = typeof body?.target_user_id === "string" ? body.target_user_id : "";
    if (!targetId) return json({ error: "target_user_id_required" }, 400);
    if (targetId === actor.id) return json({ error: "cannot_delete_self" }, 400);

    const { data: targetRoles, error: targetRoleError } = await admin
      .from("user_roles")
      .select("role_id")
      .eq("user_id", targetId);
    if (targetRoleError) return json({ error: "could_not_verify_target_roles" }, 500);
    if (targetRoles?.some((r) => r.role_id === "admin")) {
      return json({ error: "cannot_delete_another_admin" }, 403);
    }

    const { data: wallet, error: walletError } = await admin
      .from("usdt_wallets")
      .select("balance")
      .eq("user_id", targetId)
      .maybeSingle();
    if (walletError) return json({ error: "could_not_check_wallet" }, 500);
    if (Number(wallet?.balance || 0) > 0) {
      return json({
        error: "account_has_remaining_balance",
        message: "La cuenta conserva saldo disponible. Primero debe resolverse el saldo para proteger los fondos del usuario.",
      }, 409);
    }

    const blockers = [
      ["usdt_orders", "id", "user_id"],
      ["usdt_transactions", "id", "user_id"],
      ["usdt_deposits", "id", "user_id"],
      ["rechargegames_orders", "id", "user_id"],
      ["referral_rewards", "id", "referrer_user_id"],
      ["referral_rewards", "id", "referred_user_id"],
    ] as const;

    const blockedBy: string[] = [];
    for (const [table, column, ownerColumn] of blockers) {
      const { count, error } = await admin
        .from(table)
        .select(column, { count: "exact", head: true })
        .eq(ownerColumn, targetId);
      if (error) return json({ error: "could_not_check_account_history", table }, 500);
      if ((count || 0) > 0 && !blockedBy.includes(table)) blockedBy.push(table);
    }

    if (blockedBy.length) {
      return json({
        error: "account_has_financial_history",
        message: "La cuenta conserva movimientos financieros o pedidos. No se puede eliminar sin afectar el historial.",
        blocked_by: blockedBy,
      }, 409);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(targetId);
    if (deleteError) return json({ error: "delete_failed", message: deleteError.message }, 409);

    return json({ success: true, deleted_user_id: targetId });
  } catch (error) {
    console.error("admin-delete-user:", error);
    return json({ error: "internal_error" }, 500);
  }
});
