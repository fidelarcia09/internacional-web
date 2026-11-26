begin;

-- Permit the new GT- prefix while retaining the existing alphanumeric formats.
alter table public.internacional_settings
  drop constraint if exists internacional_settings_user_id_prefix_check;
alter table public.internacional_settings
  add constraint internacional_settings_user_id_prefix_check
  check (user_id_prefix ~ '^([A-Z0-9]{1,4}|GT-)$');

-- Keep existing invitation codes working after changing the visible user-code prefix.
update public.referrals r
set referral_code = 'GT-' || substr(r.referral_code, 3)
where r.referral_code like 'IW%'
  and exists (
    select 1 from public.profiles p
    where p.user_code = r.referral_code
  );

-- Rename existing user codes without changing their unique suffixes.
update public.profiles
set user_code = 'GT-' || substr(user_code, 3)
where user_code like 'IW%';

-- Use the new prefix for all users created from now on.
update public.internacional_settings
set user_id_prefix = 'GT-'
where id = true;

-- Keep the trigger's fallback aligned with the configured prefix.
create or replace function public.handle_new_internacional_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_prefix text;
  v_code text;
  v_referral_code text;
  v_referrer_id uuid;
begin
  select user_id_prefix into v_prefix
  from public.internacional_settings
  where id = true;

  v_prefix := coalesce(v_prefix, 'GT-');

  loop
    v_code := v_prefix ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10 - length(v_prefix)));
    exit when not exists (
      select 1 from public.profiles where user_code = v_code
    );
  end loop;

  insert into public.profiles (id, username, phone, full_name, user_code)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'username'), ''), 'user_' || substr(new.id::text, 1, 8)),
    nullif(btrim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    v_code
  );

  v_referral_code := upper(btrim(coalesce(new.raw_user_meta_data ->> 'referral_code', '')));
  if v_referral_code <> '' then
    select p.id into v_referrer_id
    from public.profiles p
    where upper(p.user_code) = v_referral_code
      and p.id <> new.id
    limit 1;

    if v_referrer_id is not null then
      insert into public.referrals (referred_user_id, referrer_user_id, referral_code)
      values (new.id, v_referrer_id, v_referral_code)
      on conflict (referred_user_id) do nothing;
    end if;
  end if;

  return new;
end;
$function$;

commit;
