-- ============================================================
-- GIGPROOF — migration 037: is_demo flag on analytics_event (§14.3.2).
--
-- OWNER-APPLIED. Like every migration in this repo it is authored diff-first
-- and applied by the owner (supabase db push) — never auto-run by an agent.
-- Structural migrations are gated on Supabase Pro (owner ruling C-2), so this
-- file is READY but is applied by the owner when Pro is enabled.
--
-- WHY: Gate = "1 booking manager reacts to a real Passport AND one pays."
-- That number must count REAL demand only. Live-DEMO events never persist
-- (analytics.js persist() returns early when DEMO), so the leak is not the demo
-- persona — it is SEED accounts: real auth.users rows (@gigproof.test) and the
-- operator's own actions, which fire genuine, persisted events during QA. With
-- no marker the operator read-model cannot tell a seed reaction from a real
-- buyer's. is_demo makes that distinction explicit and filterable.
--
-- FIREWALL: additive + inert. Adds one boolean; changes no existing read path.
-- The column defaults false (real) so nothing is silently reclassified; the
-- backfill only marks the CLEARLY-synthetic set below. No score, no PII.
--
-- READ-MODEL CONTRACT (follow-up, server): every Gate/demand metric that reads
-- analytics_event — monthlySpendEstimateUsd() and the reaction/pay counters in
-- server/index.js — MUST add `.eq('is_demo', false)` before it is trusted as a
-- Gate number. Adding this column alone changes NO behaviour; the filter is the
-- behaviour, shipped with the server change, not here.
--
-- Idempotent. Undo: 037_analytics_is_demo.down.sql
-- ============================================================

-- ── column ────────────────────────────────────────────────────────────────
-- default false = "real": new events are real unless the writer proves demo.
alter table public.analytics_event
  add column if not exists is_demo boolean not null default false;

-- ── backfill (conservative — only the demonstrably-synthetic set) ──────────
-- 1) events by a seed account (@gigproof.test). These are real auth.users rows
--    used for QA; their persisted events are not real demand.
update public.analytics_event ae
   set is_demo = true
  from auth.users u
 where ae.actor_user_id = u.id
   and u.email ilike '%@gigproof.test'
   and ae.is_demo = false;

-- 2) events whose actor is the internal operator role. Operator actions are
--    LOCK-internal, never a buyer/artist signal.
update public.analytics_event
   set is_demo = true
 where actor_role = 'operator'
   and is_demo = false;

-- NOTE: actor-less public events (e.g. anonymous passport_view) are left
-- is_demo = false on purpose — a real anonymous view IS real demand context.
-- The write path (analytics.js / server) will set is_demo per-event going
-- forward; this backfill only cleans history.

-- ── index for the operator Gate read path (filter is_demo = false) ────────
create index if not exists idx_ae_real_name_time
  on public.analytics_event(event_name, created_at desc)
  where is_demo = false;
