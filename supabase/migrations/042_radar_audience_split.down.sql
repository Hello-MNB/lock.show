-- ============================================================
-- 042 DOWN — revert the RADAR audience split.
-- DRAFTED, NOT APPLIED. Pairs with 042_radar_audience_split.sql.
--
-- ── PRECONDITIONS ───────────────────────────────────────────────────────────
-- 1. Run in ONE transaction.
-- 2. §1 below DELETES every rep_summary row. That is unavoidable: the 010
--    unique key this file restores is (organization_id, artist_id, rule_id)
--    with no audience column, so a private row and a projected row for the
--    same (org, artist, rule) cannot coexist under it. Nothing else is deleted
--    — artist_private rows survive untouched, minus their audience label.
-- 3. After this file, radar_signal is byte-for-byte the 010 read model:
--    `radar_org` FOR ALL over current_org_ids(). THE ORIGINAL PRIVACY DEFECT
--    IS BACK — every grant-holding org can read every artist_private gap
--    signal again. Reverting is a deliberate act, not a cleanup.
-- 4. Safe to run whether or not apply_radar_audience_split() was ever called.
-- ============================================================

-- §1 · projections go first (see precondition 2)
delete from public.radar_signal where audience = 'rep_summary';

-- §2 · tightened policies + guard trigger
drop trigger if exists trg_radar_rep_update_guard on public.radar_signal;
drop policy  if exists radar_artist_private_read   on public.radar_signal;
drop policy  if exists radar_artist_private_write  on public.radar_signal;
drop policy  if exists radar_rep_summary_read      on public.radar_signal;
drop policy  if exists radar_rep_summary_dismiss   on public.radar_signal;

-- §3 · 010's policy, verbatim
drop policy if exists radar_org on public.radar_signal;
create policy radar_org on public.radar_signal for all
  using (organization_id in (select public.current_org_ids()))
  with check (organization_id in (select public.current_org_ids()));

-- §4 · 010's feed-trigger function, verbatim
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

-- §5 · 010's recompute_radar_for_org(), verbatim (3-column ON CONFLICT target,
--      no audience column). Must be restored BEFORE §7 drops the constraint it
--      would otherwise still be pointing at.
create or replace function public.recompute_radar_for_org(p_org uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.radar_signal where organization_id = p_org and dismissed = false;

  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date)
  select p_org, a.id, 'R4', 'developing', 'publish', c.claim_type, 'evidence-supported', current_date
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.claims c on c.artist_id = a.id and c.verification_status in ('verified','supporting')
  where aa.organization_id = p_org and aa.status = 'active' and coalesce(a.published, false) = false
  on conflict (organization_id, artist_id, rule_id) do update
    set status = excluded.status, action_type = excluded.action_type, evidence_basis = excluded.evidence_basis,
        method_label = excluded.method_label, signal_date = excluded.signal_date, computed_at = now();

  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id)
  select p_org, a.id, 'R2', 'strong', 'respond', 'demand', 'evidence-supported', current_date, r.id
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id and coalesce(a.published, false) = true
  join public.claims c on c.artist_id = a.id and c.visibility = 'passport-ok' and c.verification_status in ('verified','supporting')
  join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
  where aa.organization_id = p_org and aa.status = 'active'
  on conflict (organization_id, artist_id, rule_id) do update
    set status = excluded.status, action_type = excluded.action_type, demand_request_id = excluded.demand_request_id, computed_at = now();

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

  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date)
  select p_org, a.id, 'R7', 'developing', 'refresh-evidence', 'draw-band', 'artist-declared', current_date
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.draw_signals d on d.artist_id = a.id and d.computed_at < now() - interval '90 days'
  where aa.organization_id = p_org and aa.status = 'active'
  on conflict (organization_id, artist_id, rule_id) do update set computed_at = now();
end; $$;

-- §6 · 042-only functions
drop function if exists public.apply_radar_audience_split();
drop function if exists public.revert_radar_audience_split();
drop function if exists public.generate_radar_rep_projection(uuid);
drop function if exists public.recompute_radar_private_for_artist(uuid);
drop function if exists public.radar_signal_rep_update_guard();

-- §7 · constraints, indexes, columns
alter table public.radar_signal drop constraint if exists radar_signal_rep_content_check;
alter table public.radar_signal drop constraint if exists radar_signal_audience_shape_check;
alter table public.radar_signal drop constraint if exists radar_signal_audience_check;

drop index if exists public.idx_radar_audience;
drop index if exists public.idx_radar_projection;
drop index if exists public.idx_radar_artist_private;

alter table public.radar_signal drop constraint if exists radar_signal_org_artist_rule_audience_key;
alter table public.radar_signal
  add constraint radar_signal_organization_id_artist_id_rule_id_key
  unique (organization_id, artist_id, rule_id);

alter table public.radar_signal drop column if exists projection_id;
alter table public.radar_signal drop column if exists purpose;
alter table public.radar_signal drop column if exists audience;

-- §8 · purpose registry
drop policy if exists rpp_read on public.radar_projection_purpose;
drop table if exists public.radar_projection_purpose;
