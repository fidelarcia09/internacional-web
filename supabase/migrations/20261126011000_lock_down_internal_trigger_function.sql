-- Trigger-only implementation must not be directly callable by API roles.
revoke all privileges on function private.notify_usdt_deposit_notification() from public, anon, authenticated;
