-- Remove legacy Next Level database objects only.
-- These tables were confirmed empty and had no incoming foreign keys.
-- The helper function existed solely to claim Next Level webhook events.

drop function if exists public.claim_nextlevel_webhook_event(text, uuid);
drop table if exists public.nextlevel_webhook_events;
drop table if exists public.provider_orders;
