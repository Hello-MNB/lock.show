-- 033 — Waitlist outreach roles (rel-2026.07.13, S9 outreach pages)
--
-- ADDITIVE ONLY: widens the waitlist_signup.role CHECK so the two new outreach
-- landing pages can record their audiences (owner order 12 Jul night: outreach
-- to artists, artist managers, and production offices — every registration
-- recorded toward the real launch).
--   /managers   → role 'artist_manager'
--   /production → role 'production'
-- Existing values stay valid (superset check). No data rewrites, no RLS change,
-- reversible via the down file. Safe without backups.

alter table public.waitlist_signup drop constraint if exists waitlist_signup_role_check;
alter table public.waitlist_signup add constraint waitlist_signup_role_check
  check (role is null or role in ('artist','booking_manager','artist_manager','production','producer','other'));
