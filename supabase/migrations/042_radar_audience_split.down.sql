-- ============================================================
-- 042 DOWN — revert the RADAR audience split.
-- DRAFTED, NOT APPLIED. Pairs with 042_radar_audience_split.sql.
--
-- ── PRECONDITIONS ───────────────────────────────────────────────────────────
-- 1. This file now RUNS itself in one transaction — the BEGIN/COMMIT is part of
--    the file (see TRANSACTIONALITY below). Do not add another.
-- 2. §1 below DELETES every rep_summary row. That is unavoidable: the 010
--    unique key this file restores is (organization_id, artist_id, rule_id)
--    with no audience column, so a private row and a projected row for the
--    same (org, artist, rule) cannot coexist under it. Nothing else is deleted
--    — artist_private rows survive untouched, minus their audience label.
-- 3. After this file, radar_signal is byte-for-byte the 010 read model:
--    `radar_org` FOR ALL over current_org_ids(). THE ORIGINAL PRIVACY DEFECT
--    IS BACK — every grant-holding org can read every artist_private gap
--    signal again. Reverting is a deliberate act, not a cleanup.
-- 4. Safe to run whether or not apply_radar_audience_split() was ever called,
--    AND whether or not 042 forward was ever applied at all (§0 checks).
--
-- ── TRANSACTIONALITY (F6) ───────────────────────────────────────────────────
-- ONE explicit BEGIN/COMMIT around everything. This is not decoration:
-- §5 restores 010's recompute_radar_for_org(), whose ON CONFLICT target names
-- the THREE-column unique key, and §7 is what swaps the four-column key back to
-- the three-column one. If the file died between §5 and §7 the database would
-- be left with a live function whose conflict target does not exist, and every
-- one of the four 010 feed triggers (claims / passport_versions / draw_signals
-- / availability_requests) would start raising on ordinary writes — RADAR would
-- take the whole app down with it. Wrapped, that window cannot be observed:
-- either the revert completes or nothing moved. Postgres runs DDL
-- transactionally, so the guarantee is real, not aspirational.
--
-- ── IDEMPOTENCE (F6) ────────────────────────────────────────────────────────
-- §0 is a precondition guard: no radar_signal table, or no `audience` column,
-- means 042 was never applied and the whole body is skipped with a NOTICE
-- instead of failing on the first missing object. Inside, every DROP carries
-- IF EXISTS, every CREATE POLICY is preceded by its DROP, the ADD CONSTRAINT
-- sits in a duplicate_object handler, and the DELETE and the column drops are
-- naturally re-runnable. Running this file twice leaves the same schema as
-- running it once.
-- ============================================================

begin;

do $$
begin

-- §0 · precondition guard — was 042 ever applied here?
if to_regclass('public.radar_signal') is null then
  raise notice '042 down: public.radar_signal does not exist — nothing to revert.';
  return;
end if;
if not exists (
  select 1 from information_schema.columns
   where table_schema = 'public' and table_name = 'radar_signal' and column_name = 'audience'
) then
  raise notice '042 down: radar_signal.audience absent — 042 was never applied. Nothing to revert.';
  return;
end if;

-- §1 · projections go first (see precondition 2)
delete from public.radar_signal where audience = 'rep_summary';

-- §2 · tightened policies + guard trigger
drop trigger if exists trg_radar_rep_update_guard on public.radar_signal;
drop policy  if exists radar_artist_private_read   on public.radar_signal;
drop policy  if exists radar_artist_private_write  on public.radar_signal;
drop policy  if exists radar_rep_summary_read      on public.radar_signal;
drop policy  if exists radar_rep_summary_dismiss   on public.radar_signal;

-- §3 · 010's policy, verbatim (010_radar.sql:27-30)
drop policy if exists radar_org on public.radar_signal;
create policy radar_org on public.radar_signal for all
  using (organization_id in (select public.current_org_ids()))
  with check (organization_id in (select public.current_org_ids()));

end $$;

-- §4 · 010's feed-trigger function, verbatim (010_radar.sql:86-96).
--      Outside the DO block: PL/pgSQL cannot nest a function body that carries
--      its own $$ delimiters inside another $$ body without re-quoting, and
--      re-quoting is exactly how a "verbatim" restore stops being verbatim.
--      CREATE OR REPLACE is idempotent and harmless if §0 skipped the body.
create or replace function public.radar_recompute_for_artist()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_artist uuid := coalesce(new.artist_id, old.artist_id); v_org uuid;
begin
  for v_org in select organization_id from public.artist_access where artist_id = v_artist and status = 'active'
  loop
    perform public.recompute_radar_for_org(v_org);
  end loop;
  return null;
end; $$;

-- §5 · 010's recompute_radar_for_org(), verbatim (010_radar.sql:37-85):
--      3-column ON CONFLICT target, no audience column. Restored BEFORE §7
--      swaps the unique key back, and in the SAME transaction as §7 — see
--      TRANSACTIONALITY above for why the ordering alone is not enough.
create or replace function public.recompute_radar_for_org(p_org uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.radar_signal where organization_id = p_org and dismissed = false;

  -- R4 — evidence ready but Passport not published → publish.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date)
  select p_org, a.id, 'R4', 'developing', 'publish', c.claim_type, 'evidence-supported', current_date
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.claims c on c.artist_id = a.id and c.verification_status in ('verified','supporting')
  where aa.organization_id = p_org and aa.status = 'active' and coalesce(a.published, false) = false
  on conflict (organization_id, artist_id, rule_id) do update
    set status = excluded.status, action_type = excluded.action_type, evidence_basis = excluded.evidence_basis,
        method_label = excluded.method_label, signal_date = excluded.signal_date, computed_at = now();

  -- R2 — ready Passport (published + passport-ok verified/supporting) ∩ open demand → respond.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id)
  select p_org, a.id, 'R2', 'strong', 'respond', 'demand', 'evidence-supported', current_date, r.id
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id and coalesce(a.published, false) = true
  join public.claims c on c.artist_id = a.id and c.visibility = 'passport-ok' and c.verification_status in ('verified','supporting')
  join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
  where aa.organization_id = p_org and aa.status = 'active'
  on conflict (organization_id, artist_id, rule_id) do update
    set status = excluded.status, action_type = excluded.action_type, demand_request_id = excluded.demand_request_id, computed_at = now();

  -- R1 (hero) — stale evidence ∩ matching inbound demand → refresh evidence.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id)
  select p_org, a.id, 'R1', 'developing', 'refresh-evidence', c.claim_type, 'stale', current_date, r.id
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.claims c on c.artist_id = a.id and c.method_label <> 'producer-confirmed'
     and c.expires_at is not null and c.expires_at < now()
  join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
  where aa.organization_id = p_org and aa.status = 'active'
  on conflict (organization_id, artist_id, rule_id) do update
    set status = excluded.status, action_type = excluded.action_type, demand_request_id = excluded.demand_request_id, computed_at = now();

  -- R7 — draw band aging (>90 days) → refresh draw evidence.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date)
  select p_org, a.id, 'R7', 'developing', 'refresh-evidence', 'draw-band', 'artist-declared', current_date
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.draw_signals d on d.artist_id = a.id and d.computed_at < now() - interval '90 days'
  where aa.organization_id = p_org and aa.status = 'active'
  on conflict (organization_id, artist_id, rule_id) do update set computed_at = now();
end; $$;

do $$
begin

-- Re-check §0 for the second DO block: if 042 was never applied, §4/§5 were
-- harmless no-op replacements and there is nothing below to undo.
if to_regclass('public.radar_signal') is null
   or not exists (
     select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'radar_signal' and column_name = 'audience'
   ) then
  return;
end if;

-- §6 · 042-only functions
drop function if exists public.apply_radar_audience_split();
drop function if exists public.revert_radar_audience_split();
drop function if exists public.generate_radar_rep_projection(uuid);
drop function if exists public.recompute_radar_private_for_artist(uuid);
drop function if exists public.radar_signal_rep_update_guard();

-- §7 · constraints, indexes, columns
alter table public.radar_signal drop constraint if exists radar_signal_rep_content_check;
-- APPSEC F2 · the demand-pointer law goes with the audience model it belongs to.
-- It must be dropped BEFORE the audience column (§7 below), because the CHECK
-- names that column and Postgres refuses to drop a column a constraint depends
-- on unless the constraint goes first.
alter table public.radar_signal drop constraint if exists radar_signal_rep_demand_check;
alter table public.radar_signal drop constraint if exists radar_signal_audience_shape_check;
alter table public.radar_signal drop constraint if exists radar_signal_audience_check;

drop index if exists public.idx_radar_audience;
drop index if exists public.idx_radar_projection;
drop index if exists public.idx_radar_artist_private;

alter table public.radar_signal drop constraint if exists radar_signal_org_artist_rule_audience_key;

-- The 010 key is restored under the name Postgres gave the inline
-- `unique (organization_id, artist_id, rule_id)` in 010_radar.sql:23, so the
-- catalog after this file is name-for-name identical to the catalog before 042.
-- Guarded: a second run finds it already there and moves on. §1 guarantees the
-- data can satisfy it — only artist_private rows remain, and their audience is
-- constant, so 4-column uniqueness implies 3-column uniqueness.
begin
  alter table public.radar_signal
    add constraint radar_signal_organization_id_artist_id_rule_id_key
    unique (organization_id, artist_id, rule_id);
exception when duplicate_object or duplicate_table then null;
end;

alter table public.radar_signal drop column if exists projection_id;
alter table public.radar_signal drop column if exists purpose;
alter table public.radar_signal drop column if exists audience;

-- §8 · purpose registry. The table drop takes rpp_read with it — dropping the
-- policy separately would raise if the table were already gone, which is the
-- exact half-reverted case this file must survive. §7 dropped the FK-bearing
-- column above, so no CASCADE is needed or wanted.
drop table if exists public.radar_projection_purpose;

end $$;

-- ============================================================
-- §9 · ⚠ EXECUTE PRIVILEGES — RESTORE THE PRE-042 STATE, WHICH IS WIDER.
-- ============================================================
-- READ THIS BEFORE RUNNING THE FILE.
--   042 forward REVOKES EXECUTE on recompute_radar_for_org() and
--   radar_recompute_for_artist() from public, anon, authenticated and
--   service_role. Before 042, those functions carried Supabase's default
--   privileges, i.e. EXECUTE to PUBLIC **and** to all three PostgREST roles —
--   verified by executing 001..041 on a scratch PostgreSQL and reading
--   pg_proc.proacl:
--       =X/postgres,postgres=X/postgres,anon=X/postgres,
--       authenticated=X/postgres,service_role=X/postgres
--   CREATE OR REPLACE does NOT reset an ACL, so §4/§5 above leave the 042
--   revokes in place and the database would end up NARROWER than it was — a
--   half-revert wearing the costume of a full one. A down migration whose end
--   state is "pre-migration, except for the parts I liked" cannot be reasoned
--   about, and the next person to diff the schema finds a discrepancy with no
--   record of who caused it.
--
--   So this file restores them, ON PURPOSE, and says so at the top of its
--   voice: REVERTING 042 RE-OPENS THE RPC SURFACE 042 CLOSED. That is the same
--   deal precondition 3 already states about the RLS split — reverting is a
--   deliberate act, not a cleanup. If you want the split gone but the
--   privileges kept, do not run this file: call
--   revert_radar_audience_split() instead, which undoes only the RLS
--   tightening and leaves both the columns and the revokes alone.
--
-- Outside the DO blocks: GRANT is not conditional and would raise on a function
-- that does not exist, so it is guarded by its own to_regprocedure() check.
do $$
begin
  if to_regprocedure('public.recompute_radar_for_org(uuid)') is not null then
    execute 'grant execute on function public.recompute_radar_for_org(uuid) to public, anon, authenticated, service_role';
  end if;
  if to_regprocedure('public.radar_recompute_for_artist()') is not null then
    execute 'grant execute on function public.radar_recompute_for_artist() to public, anon, authenticated, service_role';
  end if;
end $$;

commit;
