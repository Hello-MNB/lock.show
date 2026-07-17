-- ============================================================
-- Undo for 037_analytics_is_demo.sql. Drops the is_demo flag and its
-- partial index. Safe: additive column removal, no data beyond the flag.
-- ============================================================
drop index if exists public.idx_ae_real_name_time;
alter table public.analytics_event
  drop column if exists is_demo;
