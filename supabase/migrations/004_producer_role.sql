-- ============================================================
-- GIGPROOF — migration 004: add 'producer' (מפיק) role.
-- Producer is a self-signup persona (S2) and a claim confirmer (P1).
-- Idempotent.
-- ============================================================
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('artist','agency','booker','operator','producer'));
