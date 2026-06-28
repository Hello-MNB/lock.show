-- ============================================================
-- 010 — RADAR materialization + feeding link  (BUILD-SPEC-ORG-RADAR §20, Step 3)
-- radar_signal is the MATERIALIZED store; recompute_radar_for_org() runs the
-- deterministic rules and the triggers re-feed it on the §20.3 events
-- (passport_versions / claims / draw_signals / availability_requests).
-- FIREWALL: a signal carries a bounded status + evidence basis + method-label +
-- date + ONE action — NEVER a score / percentile / rank / prediction.
-- ============================================================
create table if not exists public.radar_signal (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  rule_id text not null check (rule_id in ('R1','R2','R3','R4','R5','R6','R7','R8')),
  status text not null default 'developing' check (status in ('strong','developing','missing','notAssessable')),
  action_type text not null check (action_type in ('refresh-evidence','request-evidence','respond','publish','promote','review')),
  evidence_basis text,                 -- short ref (claim_type / 'draw-band' / 'demand'), NOT a number
  method_label text,
  signal_date date,
  demand_request_id uuid references public.availability_requests(id) on delete set null,
  dismissed boolean not null default false,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, artist_id, rule_id)
);

alter table public.radar_signal enable row level security;
drop policy if exists radar_org on public.radar_signal;
create policy radar_org on public.radar_signal for all
  using (organization_id in (select public.current_org_ids()))
  with check (organization_id in (select public.current_org_ids()));

create index if not exists idx_radar_org on public.radar_signal(organization_id) where dismissed = false;

-- Deterministic materialization for one org's roster (R1/R2/R4/R7 in SQL; the
-- client JS engine in src/lib/radar.js is the canonical rule set and adds R3/R5/R6/R8).
-- Re-derives auto signals each call (delete-then-insert), preserving dismissals.
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

-- Feeding triggers (§20.3): recompute the affected org(s) on the relevant events.
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

drop trigger if exists trg_radar_claims on public.claims;
create trigger trg_radar_claims after insert or update or delete on public.claims
  for each row execute function public.radar_recompute_for_artist();
drop trigger if exists trg_radar_passport on public.passport_versions;
create trigger trg_radar_passport after insert or update on public.passport_versions
  for each row execute function public.radar_recompute_for_artist();
drop trigger if exists trg_radar_draw on public.draw_signals;
create trigger trg_radar_draw after insert or update or delete on public.draw_signals
  for each row execute function public.radar_recompute_for_artist();
drop trigger if exists trg_radar_demand on public.availability_requests;
create trigger trg_radar_demand after insert or update on public.availability_requests
  for each row execute function public.radar_recompute_for_artist();
