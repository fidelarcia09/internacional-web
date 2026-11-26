-- Security hardening for Internacional Web public tables.
-- Keep RLS policies as the row-level authorization layer and remove excess SQL grants.

-- Internal RechargeGames order and webhook ledgers are accessed only by trusted backend code.
revoke all privileges on table public.rechargegames_orders from anon, authenticated;
revoke all privileges on table public.rechargegames_webhook_events from anon, authenticated;

-- Anonymous visitors may read published reviews, but must never write or mutate them.
revoke insert, update, delete, truncate, references, trigger
  on table public.site_reviews from anon;

-- Notification preferences are private to signed-in users; anonymous table grants are unnecessary.
revoke all privileges on table public.user_notification_preferences from anon;

-- Profile identity and referral codes must not be client-editable. Keep only ordinary profile fields editable.
revoke insert, delete, update on table public.profiles from authenticated;
grant update (username, phone, full_name, avatar_url, updated_at)
  on table public.profiles to authenticated;

-- No policies are added to provider_products, rechargegames_orders,
-- rechargegames_webhook_events or reseller_player_profiles:
-- RLS enabled + no policies is intentional backend-only access (default deny).
