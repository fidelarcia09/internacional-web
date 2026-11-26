-- Gamers Gold TopUp: funciones protegidas del panel administrativo.
insert into public.app_roles (id, name, description)
values ('admin', 'Administrador', 'Acceso completo al panel administrativo de Gamers Gold TopUp.')
on conflict (id) do update set name=excluded.name, description=excluded.description;

CREATE OR REPLACE FUNCTION public.admin_panel_data(p_section text DEFAULT 'overview'::text, p_search text DEFAULT NULL::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'auth'
AS $function$
declare
  v_result jsonb;
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role_id = 'admin'
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if p_section = 'overview' or p_section = 'stats' then
    select jsonb_build_object(
      'users_total', (select count(*) from auth.users),
      'wallets_total', coalesce((select sum(balance) from public.usdt_wallets), 0),
      'sales_total', coalesce((select sum(amount_usdt) from public.usdt_orders where status = 'completed'), 0),
      'sales_count', (select count(*) from public.usdt_orders where status = 'completed'),
      'orders_pending', (select count(*) from public.usdt_orders where status = 'pending'),
      'deposits_pending', (select count(*) from public.usdt_deposits where status = 'pending'),
      'deposits_total', coalesce((select sum(amount_usdt) from public.usdt_deposits where status = 'confirmed'), 0),
      'recent_transactions', coalesce((
        select jsonb_agg(x) from (
          select jsonb_build_object(
            'id', t.id, 'code', t.transaction_code, 'kind', t.kind,
            'amount', t.amount_usdt, 'balance_after', t.balance_after,
            'description', t.description, 'created_at', t.created_at,
            'email', u.email, 'username', p.username
          ) as x
          from public.usdt_transactions t
          join auth.users u on u.id = t.user_id
          left join public.profiles p on p.id = t.user_id
          order by t.created_at desc limit 8
        ) q
      ), '[]'::jsonb)
    ) into v_result;
    return v_result;
  elsif p_section = 'users' then
    select jsonb_build_object(
      'total', (select count(*) from auth.users u left join public.profiles p on p.id=u.id
        where v_search is null or u.email ilike '%'||v_search||'%' or p.username ilike '%'||v_search||'%' or p.full_name ilike '%'||v_search||'%' or p.user_code ilike '%'||v_search||'%'),
      'items', coalesce((
        select jsonb_agg(x) from (
          select jsonb_build_object(
            'id', u.id, 'email', u.email, 'created_at', u.created_at,
            'username', p.username, 'full_name', p.full_name, 'phone', p.phone,
            'user_code', p.user_code, 'avatar_url', p.avatar_url,
            'balance', coalesce(w.balance, 0),
            'roles', coalesce((select jsonb_agg(ar.id order by ar.id) from public.user_roles ur join public.app_roles ar on ar.id=ur.role_id where ur.user_id=u.id), '[]'::jsonb),
            'orders_count', (select count(*) from public.usdt_orders o where o.user_id=u.id),
            'spent_total', coalesce((select sum(o.amount_usdt) from public.usdt_orders o where o.user_id=u.id and o.status='completed'),0)
          ) as x
          from auth.users u
          left join public.profiles p on p.id=u.id
          left join public.usdt_wallets w on w.user_id=u.id
          where v_search is null or u.email ilike '%'||v_search||'%' or p.username ilike '%'||v_search||'%' or p.full_name ilike '%'||v_search||'%' or p.user_code ilike '%'||v_search||'%'
          order by u.created_at desc
          limit v_limit offset v_offset
        ) q
      ), '[]'::jsonb)
    ) into v_result;
    return v_result;
  elsif p_section = 'orders' then
    select jsonb_build_object(
      'total', (select count(*) from public.usdt_orders o join auth.users u on u.id=o.user_id left join public.profiles p on p.id=o.user_id
        where v_search is null or u.email ilike '%'||v_search||'%' or o.order_code ilike '%'||v_search||'%' or o.game ilike '%'||v_search||'%'),
      'items', coalesce((
        select jsonb_agg(x) from (
          select jsonb_build_object(
            'id', o.id, 'code', o.order_code, 'email', u.email, 'username', p.username,
            'amount', o.amount_usdt, 'description', o.description, 'game', o.game,
            'player_id', o.player_id, 'status', o.status, 'created_at', o.created_at,
            'completed_at', o.completed_at, 'provider_status', r.status
          ) as x
          from public.usdt_orders o
          join auth.users u on u.id=o.user_id
          left join public.profiles p on p.id=o.user_id
          left join public.rechargegames_orders r on r.usdt_order_id=o.id
          where v_search is null or u.email ilike '%'||v_search||'%' or o.order_code ilike '%'||v_search||'%' or o.game ilike '%'||v_search||'%'
          order by o.created_at desc limit v_limit offset v_offset
        ) q
      ), '[]'::jsonb)
    ) into v_result;
    return v_result;
  elsif p_section = 'recharges' then
    select jsonb_build_object(
      'total', (select count(*) from public.rechargegames_orders r left join auth.users u on u.id=r.user_id
        where v_search is null or u.email ilike '%'||v_search||'%' or r.buyer_ref ilike '%'||v_search||'%' or r.product_name ilike '%'||v_search||'%' or r.game ilike '%'||v_search||'%'),
      'items', coalesce((
        select jsonb_agg(x) from (
          select jsonb_build_object(
            'id', r.id, 'buyer_ref', r.buyer_ref, 'email', u.email,
            'product_name', r.product_name, 'game', r.game, 'product_type', r.product_type,
            'region', r.region, 'player_id', r.player_id, 'server_id', r.server_id,
            'quantity', r.quantity, 'price_usdt', r.price_usdt, 'status', r.status,
            'test', r.test, 'created_at', r.created_at, 'delivered_at', r.delivered_at,
            'failure_reason', r.failure_reason
          ) as x
          from public.rechargegames_orders r
          left join auth.users u on u.id=r.user_id
          where v_search is null or u.email ilike '%'||v_search||'%' or r.buyer_ref ilike '%'||v_search||'%' or r.product_name ilike '%'||v_search||'%' or r.game ilike '%'||v_search||'%'
          order by r.created_at desc limit v_limit offset v_offset
        ) q
      ), '[]'::jsonb)
    ) into v_result;
    return v_result;
  elsif p_section = 'deposits' then
    select jsonb_build_object(
      'total', (select count(*) from public.usdt_deposits d join auth.users u on u.id=d.user_id
        where v_search is null or u.email ilike '%'||v_search||'%' or d.deposit_code ilike '%'||v_search||'%'),
      'items', coalesce((
        select jsonb_agg(x) from (
          select jsonb_build_object(
            'id', d.id, 'code', d.deposit_code, 'email', u.email,
            'amount', d.amount_usdt, 'method', d.payment_method,
            'reference', d.payment_reference, 'status', d.status,
            'created_at', d.created_at, 'resolved_at', d.resolved_at
          ) as x
          from public.usdt_deposits d
          join auth.users u on u.id=d.user_id
          where v_search is null or u.email ilike '%'||v_search||'%' or d.deposit_code ilike '%'||v_search||'%'
          order by d.created_at desc limit v_limit offset v_offset
        ) q
      ), '[]'::jsonb)
    ) into v_result;
    return v_result;
  elsif p_section = 'transactions' then
    select jsonb_build_object(
      'total', (select count(*) from public.usdt_transactions t join auth.users u on u.id=t.user_id
        where v_search is null or u.email ilike '%'||v_search||'%' or t.transaction_code ilike '%'||v_search||'%'),
      'items', coalesce((
        select jsonb_agg(x) from (
          select jsonb_build_object(
            'id', t.id, 'code', t.transaction_code, 'email', u.email,
            'kind', t.kind, 'amount', t.amount_usdt,
            'balance_before', t.balance_before, 'balance_after', t.balance_after,
            'description', t.description, 'created_at', t.created_at
          ) as x
          from public.usdt_transactions t
          join auth.users u on u.id=t.user_id
          where v_search is null or u.email ilike '%'||v_search||'%' or t.transaction_code ilike '%'||v_search||'%'
          order by t.created_at desc limit v_limit offset v_offset
        ) q
      ), '[]'::jsonb)
    ) into v_result;
    return v_result;
  else
    raise exception 'Sección administrativa no válida' using errcode = '22023';
  end if;
end;
$function$


CREATE OR REPLACE FUNCTION public.admin_adjust_wallet(p_user_id uuid, p_delta numeric, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'auth'
AS $function$
declare
  v_before numeric;
  v_after numeric;
  v_reason text := btrim(coalesce(p_reason, ''));
  v_code text;
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role_id = 'admin'
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_user_id is null then
    raise exception 'No se puede ajustar esta cuenta desde esta acción' using errcode = '22023';
  end if;
  if p_delta is null or p_delta = 0 or abs(p_delta) > 1000000 or p_delta <> round(p_delta, 2) then
    raise exception 'Importe no válido (máximo dos decimales)' using errcode = '22023';
  end if;
  if length(v_reason) < 5 or length(v_reason) > 140 then
    raise exception 'Escribe un motivo de entre 5 y 140 caracteres' using errcode = '22023';
  end if;

  select balance into v_before
  from public.usdt_wallets
  where user_id = p_user_id
  for update;
  if not found then
    raise exception 'El usuario no tiene billetera registrada' using errcode = 'P0002';
  end if;
  v_after := v_before + p_delta;
  if v_after < 0 then
    raise exception 'El saldo no puede quedar por debajo de cero' using errcode = '22023';
  end if;

  update public.usdt_wallets
  set balance = v_after, updated_at = now()
  where user_id = p_user_id;

  v_code := 'ADM-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.usdt_transactions (
    transaction_code, user_id, kind, amount_usdt,
    balance_before, balance_after, description
  ) values (
    v_code, p_user_id, 'adjustment', abs(p_delta),
    v_before, v_after,
    left('Ajuste administrativo (' || auth.uid()::text || '): ' || v_reason, 200)
  );

  return jsonb_build_object(
    'success', true, 'transaction_code', v_code,
    'balance_before', v_before, 'balance_after', v_after
  );
end;
$function$


CREATE OR REPLACE FUNCTION public.admin_resolve_deposit(p_deposit_id uuid, p_approved boolean)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_deposit public.usdt_deposits%rowtype;
  v_before numeric(20,8);
  v_after numeric(20,8);
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role_id = 'admin'
  ) then
    raise exception 'not_allowed' using errcode='42501';
  end if;

  select * into v_deposit
  from public.usdt_deposits
  where id = p_deposit_id
  for update;

  if not found then
    raise exception 'deposit_not_found' using errcode='P0002';
  end if;

  if v_deposit.status <> 'pending' then
    return v_deposit.status;
  end if;

  if p_approved then
    select balance into v_before
    from public.usdt_wallets
    where user_id = v_deposit.user_id
    for update;
    if not found then raise exception 'wallet_not_found' using errcode='P0002'; end if;

    update public.usdt_wallets
    set balance = balance + v_deposit.amount_usdt, updated_at = now()
    where user_id = v_deposit.user_id
    returning balance into v_after;

    insert into public.usdt_transactions(
      transaction_code, user_id, deposit_id, kind, amount_usdt,
      balance_before, balance_after, description
    ) values (
      private.generate_record_code('transaction'), v_deposit.user_id,
      v_deposit.id, 'deposit', v_deposit.amount_usdt,
      v_before, v_after, 'Depósito confirmado: ' || v_deposit.deposit_code
    );

    update public.usdt_deposits
    set status = 'confirmed', resolved_at = now()
    where id = v_deposit.id;
    return 'confirmed';
  else
    update public.usdt_deposits
    set status = 'rejected', resolved_at = now()
    where id = v_deposit.id;
    return 'rejected';
  end if;
end;
$function$


revoke all on function public.admin_panel_data(text,text,integer,integer) from public, anon;
revoke all on function public.admin_adjust_wallet(uuid,numeric,text) from public, anon;
revoke all on function public.admin_resolve_deposit(uuid,boolean) from public, anon;
grant execute on function public.admin_panel_data(text,text,integer,integer) to authenticated;
grant execute on function public.admin_adjust_wallet(uuid,numeric,text) to authenticated;
grant execute on function public.admin_resolve_deposit(uuid,boolean) to authenticated;
