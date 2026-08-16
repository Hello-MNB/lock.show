-- ============================================================
-- 042 — RADAR AUDIENCE SPLIT  ·  artist_private vs rep_summary
-- P0-PRIVACY LANE B2.  DRAFTED, NOT APPLIED.
--
-- ⚠⚠ DO NOT RUN THIS FILE AGAINST THE LIVE DB WITHOUT OWNER SIGN-OFF.
--    PART A (§1–§5) is additive and behavior-preserving and may land alone.
--    PART B (§6, installed as a callable function, NOT executed here) is
--    BREAKING and stays dormant until the owner explicitly calls it.
--
-- ── PRECONDITIONS ───────────────────────────────────────────────────────────
-- APPLY ORDER (mandatory):
--   1. Migrations 001–041 already applied. This file depends on:
--        · 010  public.radar_signal + recompute_radar_for_org() + 4 feed triggers
--        · 027  artist_access.scope[] / expires_at / status lifecycle,
--               can_access_artist(), artist_access_has_scope()
--        · 008/009 current_org_ids(), has_org_role()
--      Migration 041 is owned by a PARALLEL LANE. 042 touches only
--      public.radar_signal + one new table; if 041 also touches radar_signal,
--      resolve by hand before applying either.
--   2. Apply this whole file in ONE transaction (§3 swaps the unique key that
--      §5's ON CONFLICT target depends on — a partial apply leaves
--      recompute_radar_for_org() pointing at a constraint that no longer
--      exists and every RADAR feed trigger will start raising).
--   3. PART B is NOT executed by applying this file. After owner sign-off:
--        select public.apply_radar_audience_split();     -- tighten (BREAKING)
--        select public.revert_radar_audience_split();    -- undo, any time
--
-- WHAT IS ADDITIVE (safe, no information removed from any surface):
--   §1 radar_projection_purpose registry table (ships EMPTY of enabled rows)
--   §2 radar_signal.audience / purpose / projection_id columns + content CHECKs
--   §3 unique key widened (org, artist, rule) → (org, artist, rule, audience)
--      — strictly looser; paired with §5 in the same transaction
--   §4 indexes
--   §5 recompute_radar_for_org() rewritten to stamp audience='artist_private'
--      and use the widened conflict target. Same rows, same RLS, same reads.
--      (Also fixes a LATENT 010 BUG: the R4/R2/R1/R7 inserts could produce two
--      rows with the same conflict key in one statement — "ON CONFLICT DO
--      UPDATE command cannot affect row a second time" — whenever an artist
--      had >1 qualifying claim or >1 open request. DISTINCT ON closes it.)
--
-- WHAT IS BREAKING (fenced in §6, dormant until called):
--   B1. RLS SPLIT. `radar_org` (FOR ALL, organization_id in current_org_ids())
--       is replaced by three narrower policies. A representation org LOSES
--       read access to every artist_private row — including the status='missing'
--       gap signals it can read today via PostgREST.
--   B2. MATERIALIZATION SPLIT. recompute_radar_for_org() stops materializing
--       the private interpretation once per grant-holding org. Private rows are
--       written ONCE, to the artist's OWN org (artists.owner_organization_id).
--       Rep-visible rows become an explicitly generated bounded projection.
--   B3. PROJECTION CONTENT DEFAULTS TO EMPTY. No mandate in this codebase
--       names a RADAR projection today: artist_access.scope is
--       view/upload/edit/share/publish and none of those words authorize a
--       radar interpretation. §1 therefore seeds ONE candidate purpose with
--       enabled=false. Until the owner enables a purpose, the rep_summary
--       audience is legitimately empty. This is the honest default, not a bug.
--
-- WHAT BREAKS ON SCREEN when PART B is called:
--   · /agency/radar (src/features/agency/RadarFeed.jsx) — VERIFIED: this screen
--     does NOT read public.radar_signal. It calls getRadarInputs() (raw claims /
--     draw_signals / availability_requests, gated by can_access_artist()) and
--     re-derives the SAME private interpretation client-side in
--     src/lib/radar.js, including R8 status='missing' and R6 'notAssessable'.
--     SQL alone therefore does NOT close the leak on that screen. The paired
--     client fix ships behind RADAR_AUDIENCE_SPLIT_ENABLED (default OFF).
--   · public.radar_signal has NO client reader anywhere in src/ — grep-verified.
--     Its only consumers today are the 010 feed triggers (writers) and direct
--     PostgREST reads. So B1/B2 remove a DATA-API leak, not a rendered screen.
--   · Counter-intuitive but verified: today radar_signal holds rows ONLY for
--     representation orgs. Every insert in 010 joins artist_access, and 027's
--     request_artist_access() refuses to create a grant for an org that already
--     owns the artist — so the artist's OWN org has never had a single row of
--     its own private interpretation. B2 gives the artist their own rows for
--     the first time (additive for the artist, restrictive for the rep).
--
-- AUTHORITY (binding, quoted from the lane brief):
--   RADAR is artist-private intelligence. Organization membership or an
--   artist_access row NEVER grants automatic access to private RADAR gaps or
--   interpretation. Representation may receive ONLY a purpose-bounded,
--   artist-authorized projection. A mandate scope authorizes only the named
--   projection/action.
--   Owner ruling 9 Aug 2026 (docs/OWNER-PENDING.md R-11, recorded c9710ba):
--   the artist-private view may show everything — percentages, coverage,
--   benchmarks, gaps. The firewall stays absolute on every OTHER entity's
--   surface: bands + binaries + method labels, never private gap/coaching text.
--
-- NOT DONE HERE (named so nobody assumes it):
--   · No column-level RLS on rep_summary rows beyond the §6 update guard.
--   · No change to can_access_artist() — the raw claims/draw read gate that the
--     client-side re-derivation rides on is untouched (that is a separate,
--     larger tightening; narrowing it here would break upload/edit flows).
--   · No back-fill delete of rep-org private rows already materialized. PART B
--     re-derives from scratch (delete-then-insert) on the next feed event; a
--     one-shot sweep is offered as §6.9 and is commented out.
-- ============================================================

-- ============================================================
-- §1 · PURPOSE REGISTRY — what a mandate is allowed to authorize.
--     One row = one named, artist-authorized projection. `enabled=false`
--     means "not authorized yet" and is the shipping default.
-- ============================================================
create table if not exists public.radar_projection_purpose (
  purpose          text primary key,
  label            text not null,
  -- which artist_access.scope value a grant must carry to receive this purpose
  required_scope   text not null check (required_scope in ('view','upload','edit','share','publish')),
  -- the ONLY rule_ids this purpose may ever project. Gap/coaching rules
  -- (R1 stale, R3 unanswered, R4 unpublished, R6 unproven, R7 aging, R8 empty)
  -- are structurally excluded by the §2 content CHECK regardless of this list.
  allowed_rule_ids text[] not null check (allowed_rule_ids <@ array['R2','R5']::text[]),
  enabled          boolean not null default false,
  authorized_note  text,
  created_at       timestamptz not null default now()
);

alter table public.radar_projection_purpose enable row level security;

-- Readable by any authenticated context (it is a policy registry, not data
-- about a person); writable only by the operator path / service role.
drop policy if exists rpp_read on public.radar_projection_purpose;
create policy rpp_read on public.radar_projection_purpose for select using (true);

-- The one candidate purpose, SHIPPED DISABLED. Enabling it is an owner act.
insert into public.radar_projection_purpose (purpose, label, required_scope, allowed_rule_ids, enabled, authorized_note)
values (
  'availability-response',
  'Respond to an incoming availability request on the artist''s behalf',
  'view',
  array['R2']::text[],
  false,
  'DISABLED PENDING OWNER SIGN-OFF. No mandate wording in this codebase names a RADAR projection; artist_access.scope (view/upload/edit/share/publish) does not authorize one. Enable only after the consent copy the artist sees names this projection explicitly.'
)
on conflict (purpose) do nothing;

-- ============================================================
-- §2 · radar_signal — audience / purpose / projection_id
-- ============================================================
alter table public.radar_signal
  add column if not exists audience text not null default 'artist_private';

alter table public.radar_signal drop constraint if exists radar_signal_audience_check;
alter table public.radar_signal add constraint radar_signal_audience_check
  check (audience in ('artist_private','rep_summary'));

alter table public.radar_signal
  add column if not exists purpose text references public.radar_projection_purpose(purpose);

-- The mandate row that authorizes this projection. Revoking / deleting the
-- grant deletes the projected rows with it — a projection cannot outlive the
-- mandate that produced it.
alter table public.radar_signal
  add column if not exists projection_id uuid references public.artist_access(id) on delete cascade;

-- Shape law: a private row carries no purpose and no projection; a rep_summary
-- row MUST name both.
alter table public.radar_signal drop constraint if exists radar_signal_audience_shape_check;
alter table public.radar_signal add constraint radar_signal_audience_shape_check check (
  (audience = 'artist_private' and purpose is null and projection_id is null)
  or
  (audience = 'rep_summary'    and purpose is not null and projection_id is not null)
);

-- CONTENT LAW (the firewall, in the schema rather than in a convention):
-- a rep-visible row may never carry gap or coaching content. status 'missing'
-- and 'notAssessable' ARE the gap; 'request-evidence' / 'refresh-evidence' /
-- 'review' / 'publish' ARE the coaching. Only R2 (a ready, published Passport
-- meeting real inbound demand) and R5 (a producer-confirmed strength) survive.
alter table public.radar_signal drop constraint if exists radar_signal_rep_content_check;
alter table public.radar_signal add constraint radar_signal_rep_content_check check (
  audience = 'artist_private'
  or (
    status      = 'strong'
    and action_type in ('respond','promote')
    and rule_id     in ('R2','R5')
    and method_label is not null      -- method label is mandatory off-artist
  )
);

-- ============================================================
-- §3 · unique key widened.  BEHAVIOR-PRESERVING but PAIRED WITH §5 —
--      the old 3-column key is what 010's ON CONFLICT target names.
-- ============================================================
alter table public.radar_signal
  drop constraint if exists radar_signal_organization_id_artist_id_rule_id_key;
alter table public.radar_signal
  drop constraint if exists radar_signal_org_artist_rule_audience_key;
alter table public.radar_signal
  add constraint radar_signal_org_artist_rule_audience_key
  unique (organization_id, artist_id, rule_id, audience);

-- ============================================================
-- §4 · indexes
-- ============================================================
create index if not exists idx_radar_audience
  on public.radar_signal(audience, artist_id) where dismissed = false;
create index if not exists idx_radar_projection
  on public.radar_signal(projection_id) where audience = 'rep_summary';
create index if not exists idx_radar_artist_private
  on public.radar_signal(artist_id) where audience = 'artist_private' and dismissed = false;

-- ============================================================
-- §5 · recompute_radar_for_org() — SAME BEHAVIOR, audience-stamped.
--      Additive half: every row it writes is explicitly artist_private and the
--      conflict target matches §3. RLS is still the 010 `radar_org` policy at
--      this point, so no org gains or loses a single readable row.
-- ============================================================
create or replace function public.recompute_radar_for_org(p_org uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.radar_signal
   where organization_id = p_org and dismissed = false and audience = 'artist_private';

  -- R4 — evidence ready but Passport not published → publish.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, audience)
  select distinct on (a.id) p_org, a.id, 'R4', 'developing', 'publish', c.claim_type, 'evidence-supported', current_date, 'artist_private'
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.claims c on c.artist_id = a.id and c.verification_status in ('verified','supporting')
  where aa.organization_id = p_org and aa.status = 'active' and coalesce(a.published, false) = false
  order by a.id, c.created_at desc
  on conflict (organization_id, artist_id, rule_id, audience) do update
    set status = excluded.status, action_type = excluded.action_type, evidence_basis = excluded.evidence_basis,
        method_label = excluded.method_label, signal_date = excluded.signal_date, computed_at = now();

  -- R2 — ready Passport ∩ open demand → respond.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id, audience)
  select distinct on (a.id) p_org, a.id, 'R2', 'strong', 'respond', 'demand', 'evidence-supported', current_date, r.id, 'artist_private'
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id and coalesce(a.published, false) = true
  join public.claims c on c.artist_id = a.id and c.visibility = 'passport-ok' and c.verification_status in ('verified','supporting')
  join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
  where aa.organization_id = p_org and aa.status = 'active'
  order by a.id, r.created_date desc
  on conflict (organization_id, artist_id, rule_id, audience) do update
    set status = excluded.status, action_type = excluded.action_type, demand_request_id = excluded.demand_request_id, computed_at = now();

  -- R1 (hero) — stale evidence ∩ matching inbound demand → refresh evidence.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id, audience)
  select distinct on (a.id) p_org, a.id, 'R1', 'developing', 'refresh-evidence', c.claim_type, 'stale', current_date, r.id, 'artist_private'
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.claims c on c.artist_id = a.id and c.method_label <> 'producer-confirmed'
     and c.expires_at is not null and c.expires_at < now()
  join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
  where aa.organization_id = p_org and aa.status = 'active'
  order by a.id, c.expires_at asc
  on conflict (organization_id, artist_id, rule_id, audience) do update
    set status = excluded.status, action_type = excluded.action_type, demand_request_id = excluded.demand_request_id, computed_at = now();

  -- R7 — draw band aging (>90 days) → refresh draw evidence.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, audience)
  select distinct on (a.id) p_org, a.id, 'R7', 'developing', 'refresh-evidence', 'draw-band', 'artist-declared', current_date, 'artist_private'
  from public.artist_access aa
  join public.artists a on a.id = aa.artist_id
  join public.draw_signals d on d.artist_id = a.id and d.computed_at < now() - interval '90 days'
  where aa.organization_id = p_org and aa.status = 'active'
  order by a.id, d.computed_at asc
  on conflict (organization_id, artist_id, rule_id, audience) do update set computed_at = now();
end; $$;

-- ============================================================
-- §6 · ⛔ BREAKING HALF — INSTALLED, NOT EXECUTED. ⛔
--      Nothing below this line changes behavior when the file is applied.
--      Two functions are created; calling apply_radar_audience_split() is the
--      owner-signed act that tightens, revert_radar_audience_split() undoes it.
-- ============================================================

-- 6.1 · Private recompute — one artist, written ONCE, to the artist's own org.
create or replace function public.recompute_radar_private_for_artist(p_artist uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  select owner_organization_id into v_owner from public.artists where id = p_artist;
  if v_owner is null then return; end if;

  delete from public.radar_signal
   where artist_id = p_artist and audience = 'artist_private' and dismissed = false;

  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, audience)
  select distinct on (c.artist_id) v_owner, p_artist, 'R4', 'developing', 'publish', c.claim_type, 'evidence-supported', current_date, 'artist_private'
  from public.claims c join public.artists a on a.id = c.artist_id
  where c.artist_id = p_artist and c.verification_status in ('verified','supporting')
    and coalesce(a.published, false) = false
  order by c.artist_id, c.created_at desc
  on conflict (organization_id, artist_id, rule_id, audience) do update set computed_at = now();

  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id, audience)
  select distinct on (r.artist_id) v_owner, p_artist, 'R2', 'strong', 'respond', 'demand', 'evidence-supported', current_date, r.id, 'artist_private'
  from public.availability_requests r
  join public.artists a on a.id = r.artist_id and coalesce(a.published, false) = true
  join public.claims c on c.artist_id = r.artist_id and c.visibility = 'passport-ok' and c.verification_status in ('verified','supporting')
  where r.artist_id = p_artist and r.status = 'new'
  order by r.artist_id, r.created_date desc
  on conflict (organization_id, artist_id, rule_id, audience) do update set computed_at = now();

  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, demand_request_id, audience)
  select distinct on (c.artist_id) v_owner, p_artist, 'R1', 'developing', 'refresh-evidence', c.claim_type, 'stale', current_date, r.id, 'artist_private'
  from public.claims c
  join public.availability_requests r on r.artist_id = c.artist_id and r.status = 'new'
  where c.artist_id = p_artist and c.method_label <> 'producer-confirmed'
    and c.expires_at is not null and c.expires_at < now()
  order by c.artist_id, c.expires_at asc
  on conflict (organization_id, artist_id, rule_id, audience) do update set computed_at = now();

  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type, evidence_basis, method_label, signal_date, audience)
  select distinct on (d.artist_id) v_owner, p_artist, 'R7', 'developing', 'refresh-evidence', 'draw-band', 'artist-declared', current_date, 'artist_private'
  from public.draw_signals d
  where d.artist_id = p_artist and d.computed_at < now() - interval '90 days'
  order by d.artist_id, d.computed_at asc
  on conflict (organization_id, artist_id, rule_id, audience) do update set computed_at = now();
end; $$;

-- 6.2 · The bounded projection. Generates ONLY what a live, in-scope,
--       non-expired mandate names through an ENABLED purpose. Carries no gap
--       and no coaching content — the §2 CHECK refuses such a row outright.
create or replace function public.generate_radar_rep_projection(p_artist uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- A projection is never sticky: rebuild from the mandate state each time, so
  -- a revoked / expired / narrowed mandate stops projecting immediately.
  delete from public.radar_signal
   where artist_id = p_artist and audience = 'rep_summary';

  -- R2 · "a Passport this org may act on is meeting real inbound demand."
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type,
                                  evidence_basis, method_label, signal_date, demand_request_id,
                                  audience, purpose, projection_id)
  select distinct on (aa.organization_id)
         aa.organization_id, p_artist, 'R2', 'strong', 'respond',
         'demand', 'evidence-supported', current_date, r.id,
         'rep_summary', p.purpose, aa.id
  from public.artist_access aa
  join public.radar_projection_purpose p
       on p.enabled = true and 'R2' = any(p.allowed_rule_ids) and p.required_scope = any(aa.scope)
  join public.artists a on a.id = aa.artist_id and coalesce(a.published, false) = true
  join public.claims c on c.artist_id = a.id and c.visibility = 'passport-ok'
       and c.verification_status in ('verified','supporting')
  join public.availability_requests r on r.artist_id = a.id and r.status = 'new'
  where aa.artist_id = p_artist
    and aa.status = 'active'
    and (aa.expires_at is null or aa.expires_at > now())
  order by aa.organization_id, r.created_date desc
  on conflict (organization_id, artist_id, rule_id, audience) do update
    set demand_request_id = excluded.demand_request_id, purpose = excluded.purpose,
        projection_id = excluded.projection_id, computed_at = now();

  -- R5 · "a producer-confirmed strength exists." A strength, never a gap.
  insert into public.radar_signal(organization_id, artist_id, rule_id, status, action_type,
                                  evidence_basis, method_label, signal_date,
                                  audience, purpose, projection_id)
  select distinct on (aa.organization_id)
         aa.organization_id, p_artist, 'R5', 'strong', 'promote',
         c.claim_type, 'producer-confirmed', current_date,
         'rep_summary', p.purpose, aa.id
  from public.artist_access aa
  join public.radar_projection_purpose p
       on p.enabled = true and 'R5' = any(p.allowed_rule_ids) and p.required_scope = any(aa.scope)
  join public.claims c on c.artist_id = aa.artist_id and c.method_label = 'producer-confirmed'
  where aa.artist_id = p_artist
    and aa.status = 'active'
    and (aa.expires_at is null or aa.expires_at > now())
  order by aa.organization_id, c.created_at desc
  on conflict (organization_id, artist_id, rule_id, audience) do update
    set evidence_basis = excluded.evidence_basis, purpose = excluded.purpose,
        projection_id = excluded.projection_id, computed_at = now();
end; $$;

-- 6.3 · Guard: a rep context may only ever flip `dismissed` on a projected row.
create or replace function public.radar_signal_rep_update_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.audience = 'rep_summary' then
    if new.rule_id is distinct from old.rule_id
       or new.status is distinct from old.status
       or new.action_type is distinct from old.action_type
       or new.evidence_basis is distinct from old.evidence_basis
       or new.method_label is distinct from old.method_label
       or new.audience is distinct from old.audience
       or new.purpose is distinct from old.purpose
       or new.projection_id is distinct from old.projection_id
       or new.artist_id is distinct from old.artist_id
       or new.organization_id is distinct from old.organization_id then
      raise exception 'rep_summary rows are read-only except `dismissed`';
    end if;
  end if;
  return new;
end; $$;

-- 6.4 · THE TIGHTENING. Owner-signed, single call, fully reversible by 6.5.
create or replace function public.apply_radar_audience_split()
returns void language plpgsql security definer set search_path = public as $$
begin
  -- (a) RLS split. `radar_org` FOR ALL is what leaks the private interpretation
  --     to every grant-holding org; it goes away in favor of three policies.
  drop policy if exists radar_org on public.radar_signal;

  -- ARTIST-PRIVATE READ — the artist's own context ONLY. Deliberately keyed on
  -- artists.owner_organization_id (the ownership fact, the same predicate 027's
  -- aa_artist_owner_read uses) and NEVER on artist_access / current_org_ids()
  -- alone: an access grant must not be able to reach this branch at all.
  drop policy if exists radar_artist_private_read on public.radar_signal;
  create policy radar_artist_private_read on public.radar_signal for select
    using (
      audience = 'artist_private'
      and artist_id in (
        select ar.id from public.artists ar
        where ar.owner_organization_id in (select public.current_org_ids())
      )
    );

  -- ARTIST-PRIVATE WRITE — dismissals by the artist's own context.
  drop policy if exists radar_artist_private_write on public.radar_signal;
  create policy radar_artist_private_write on public.radar_signal for update
    using (
      audience = 'artist_private'
      and artist_id in (
        select ar.id from public.artists ar
        where ar.owner_organization_id in (select public.current_org_ids())
      )
    )
    with check (
      audience = 'artist_private'
      and artist_id in (
        select ar.id from public.artists ar
        where ar.owner_organization_id in (select public.current_org_ids())
      )
    );

  -- REP PROJECTION READ — every one of these must hold, per row:
  --   1. the row is a rep_summary projection
  --   2. it names a mandate row (projection_id) that still exists
  --   3. that mandate belongs to THIS org      (wrong-org negative case)
  --   4. that org is one the caller is in      (cross-context negative case)
  --   5. the mandate is status='active'        (revoked negative case)
  --   6. the mandate has not expired           (stale-mandate negative case)
  --   7. the mandate carries the purpose's required scope
  --                                            (missing-scope negative case)
  --   8. the purpose is ENABLED and allows this rule_id
  --                                            (unauthorized-projection case)
  -- artist_access_has_scope() (027) is reused for 5+6+7 rather than re-writing
  -- the scope/expiry predicate a second time; 3 is asserted separately because
  -- that helper is org-set-wide, not per-mandate-row.
  drop policy if exists radar_rep_summary_read on public.radar_signal;
  create policy radar_rep_summary_read on public.radar_signal for select
    using (
      audience = 'rep_summary'
      and organization_id in (select public.current_org_ids())
      and exists (
        select 1
        from public.artist_access aa
        join public.radar_projection_purpose p on p.purpose = radar_signal.purpose
        where aa.id = radar_signal.projection_id
          and aa.artist_id = radar_signal.artist_id
          and aa.organization_id = radar_signal.organization_id
          and aa.status = 'active'
          and (aa.expires_at is null or aa.expires_at > now())
          and p.enabled = true
          and p.required_scope = any(aa.scope)
          and radar_signal.rule_id = any(p.allowed_rule_ids)
          and public.artist_access_has_scope(radar_signal.artist_id, p.required_scope)
      )
    );

  -- REP DISMISS — same predicate, update only, column-guarded by 6.3.
  drop policy if exists radar_rep_summary_dismiss on public.radar_signal;
  create policy radar_rep_summary_dismiss on public.radar_signal for update
    using (
      audience = 'rep_summary'
      and organization_id in (select public.current_org_ids())
      and exists (
        select 1 from public.artist_access aa
        where aa.id = radar_signal.projection_id
          and aa.organization_id = radar_signal.organization_id
          and aa.status = 'active'
          and (aa.expires_at is null or aa.expires_at > now())
      )
    )
    with check (audience = 'rep_summary');

  drop trigger if exists trg_radar_rep_update_guard on public.radar_signal;
  create trigger trg_radar_rep_update_guard before update on public.radar_signal
    for each row execute function public.radar_signal_rep_update_guard();

  -- (b) MATERIALIZATION SPLIT. Same signature, so the four 010 feed triggers
  --     keep working untouched; the body now writes the private rows once (to
  --     the artist's own org) and a bounded projection for grant holders.
  create or replace function public.recompute_radar_for_org(p_org uuid)
  returns void language plpgsql security definer set search_path = public as $body$
  declare v_artist uuid;
  begin
    for v_artist in select id from public.artists where owner_organization_id = p_org loop
      perform public.recompute_radar_private_for_artist(v_artist);
      perform public.generate_radar_rep_projection(v_artist);
    end loop;
    for v_artist in
      select aa.artist_id from public.artist_access aa
      where aa.organization_id = p_org and aa.status = 'active'
        and (aa.expires_at is null or aa.expires_at > now())
    loop
      perform public.recompute_radar_private_for_artist(v_artist);
      perform public.generate_radar_rep_projection(v_artist);
    end loop;
  end; $body$;

  -- (c) The 010 feed trigger only loops over artist_access orgs, which is why
  --     the artist's own org has never received a row. Include the owner.
  create or replace function public.radar_recompute_for_artist()
  returns trigger language plpgsql security definer set search_path = public as $body$
  declare v_artist uuid := coalesce(new.artist_id, old.artist_id);
  begin
    perform public.recompute_radar_private_for_artist(v_artist);
    perform public.generate_radar_rep_projection(v_artist);
    return null;
  end; $body$;
end; $$;

-- 6.5 · THE UNDO. Restores 010's read model exactly (plus §5's audience stamp).
create or replace function public.revert_radar_audience_split()
returns void language plpgsql security definer set search_path = public as $$
begin
  drop trigger if exists trg_radar_rep_update_guard on public.radar_signal;
  drop policy if exists radar_artist_private_read on public.radar_signal;
  drop policy if exists radar_artist_private_write on public.radar_signal;
  drop policy if exists radar_rep_summary_read on public.radar_signal;
  drop policy if exists radar_rep_summary_dismiss on public.radar_signal;

  drop policy if exists radar_org on public.radar_signal;
  create policy radar_org on public.radar_signal for all
    using (organization_id in (select public.current_org_ids()))
    with check (organization_id in (select public.current_org_ids()));

  create or replace function public.radar_recompute_for_artist()
  returns trigger language plpgsql security definer set search_path = public as $body$
  declare v_artist uuid := coalesce(new.artist_id, old.artist_id); v_org uuid;
  begin
    for v_org in select organization_id from public.artist_access where artist_id = v_artist and status = 'active'
    loop
      perform public.recompute_radar_for_org(v_org);
    end loop;
    return null;
  end; $body$;

  -- recompute_radar_for_org() is restored by re-running §5 of this file
  -- (idempotent CREATE OR REPLACE); the down migration does it for you.
  delete from public.radar_signal where audience = 'rep_summary';
end; $$;

-- 6.9 · OPTIONAL one-shot sweep, run AFTER apply_radar_audience_split() if the
--       owner wants the already-materialized rep-org private rows gone
--       immediately rather than on the next feed event. COMMENTED OUT by
--       design — it deletes rows, so it is never something a file apply does.
-- delete from public.radar_signal rs
--  where rs.audience = 'artist_private'
--    and rs.organization_id is distinct from (
--      select ar.owner_organization_id from public.artists ar where ar.id = rs.artist_id
--    );

comment on column public.radar_signal.audience is
  'artist_private = the artist''s own RADAR interpretation (may show everything — owner ruling 9 Aug 2026). rep_summary = a purpose-bounded, mandate-authorized projection: bands + binaries + method labels, never gap or coaching content.';
