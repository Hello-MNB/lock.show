-- ============================================================
-- MIGRATION 043 — ARTIST_ACCESS: ACT SCOPE COLUMNS + BOUNDED VOCABULARIES
--
-- STATUS: DRAFTED — NOT APPLIED to any live environment.
--
-- One part of the former single migration 043, split on independent QA's
-- recommendation after four consecutive review rounds. Every defect those rounds
-- found was a COUPLING defect between objects that shared one file — guard vs fill
-- trigger, key replacement vs ON CONFLICT, re-invite vs liveness. A single file
-- offered no seam at which one of those pairs could be reviewed or reverted alone.
--
-- Purely additive: new nullable columns, their CHECK constraints and one index.
-- Changes no policy, no function and no existing behaviour. Trivially revertible.
--
-- ATOMICITY: no explicit begin/commit. psql --single-transaction wraps the file and
-- the Supabase SQL editor runs a submitted script as one implicit transaction; an
-- explicit COMMIT would end the applier's transaction early.
-- ============================================================

-- ACT SCOPE. NULL = a legacy grant, which covers every Act of the artist — that is
-- what those rows have always meant and this migration must not silently narrow
-- them. New grants are expected to name an Act; PART B is what makes NULL stop
-- being sufficient for publish.
alter table public.artist_access
  add column if not exists act_id uuid references public.act(id) on delete cascade;

-- ACTION LADDER (Product 30.10 §7A). Distinct verbs with distinct authority:
-- REQUEST/PREPARE/PROPOSE do not bind the artist; CHANGE edits drafts; PUBLISH
-- needs Act ownership or this explicit grant; NEGOTIATE/SIGN are separate again.
alter table public.artist_access
  add column if not exists actions text[] not null default '{}';

-- AUDIENCE + PURPOSE bound WHO a published version may be shown to and WHY.
alter table public.artist_access
  add column if not exists audience text[] not null default '{}';
alter table public.artist_access
  add column if not exists purpose text;

-- TIME. expires_at already exists (027:99); a grant also needs a START, or a
-- future-dated mandate is live the moment it is written.
alter table public.artist_access
  add column if not exists valid_from timestamptz not null default now();

-- VERSION BINDING. 'named' pins the grant to ONE immutable PassportVersion;
-- 'latest_published' follows the Act's current published version.
alter table public.artist_access
  add column if not exists version_binding text;
alter table public.artist_access
  add column if not exists passport_version_id uuid references public.passport_versions(id) on delete set null;

-- REVOCATION + ATTRIBUTION. `status` already carries 'revoked'; these record WHO
-- and WHEN, so expiry/revocation can recalculate visibility and pending work
-- without destroying history.
alter table public.artist_access
  add column if not exists granted_by uuid references public.person(id) on delete set null;
alter table public.artist_access
  add column if not exists revoked_at timestamptz;
alter table public.artist_access
  add column if not exists revoked_by uuid references public.person(id) on delete set null;

-- Bounded vocabularies. Written as NOT VALID would skip existing rows; every new
-- column defaults to a value that already satisfies its check, so a plain
-- constraint is safe and is actually enforced from now on.
alter table public.artist_access drop constraint if exists artist_access_actions_check;
alter table public.artist_access add constraint artist_access_actions_check
  check (actions <@ array['request','prepare','propose','change','publish','negotiate','sign']::text[]);

-- AUDIENCE VOCABULARY. These are the SAME values passport_versions.audience
-- accepts (041:287). They diverged in the first draft — the grant spoke
-- buyer/named_recipient/link while the thing it authorizes speaks
-- booker/producer/programmer/brand — so PART B fed one vocabulary into the other
-- and EVERY real audience was denied, while a publication with NO audience was
-- allowed through a coalesce default. The bound was exactly inverted. A grant must
-- speak the language of the object it authorizes.
alter table public.artist_access drop constraint if exists artist_access_audience_check;
alter table public.artist_access add constraint artist_access_audience_check
  check (audience <@ array['booker','producer','private','programmer','brand','rep']::text[]);

alter table public.artist_access drop constraint if exists artist_access_purpose_check;
alter table public.artist_access add constraint artist_access_purpose_check
  check (purpose is null or purpose in ('booking','availability','review','introduction','renewal'));

alter table public.artist_access drop constraint if exists artist_access_version_binding_check;
alter table public.artist_access add constraint artist_access_version_binding_check
  check (version_binding is null or version_binding in ('named','latest_published'));

-- A 'named' binding without a version is not a binding.
alter table public.artist_access drop constraint if exists artist_access_named_version_check;
alter table public.artist_access add constraint artist_access_named_version_check
  check (version_binding is distinct from 'named' or passport_version_id is not null);

-- A revoked grant must say WHEN. Enforced by a BEFORE trigger that fills the
-- timestamp, not by a bare constraint.
--
-- Why the trigger and not just the check: executing this migration proved a bare
-- constraint breaks every EXISTING writer that revokes by setting status alone —
-- two shipped test fixtures and any app path doing `update artist_access set
-- status='revoked'` would start failing the moment 043 was applied. That is a
-- runtime outage introduced by a migration that calls itself additive. The trigger
-- makes the invariant true for every writer, old and new, without asking any of
-- them to change; the constraint below then simply cannot be violated.

create index if not exists idx_artist_access_act
  on public.artist_access (act_id) where act_id is not null;

-- PURPOSE ON THE PUBLICATION. The grant can bound a purpose, but passport_versions
-- had no purpose column, so PART B could only ever pass NULL — which made a grant
-- carrying a purpose UNPUBLISHABLE rather than bounded. Additive and nullable:
-- existing rows and writers are unaffected, and the bound becomes satisfiable.
alter table public.passport_versions
  add column if not exists purpose text;

alter table public.passport_versions drop constraint if exists passport_versions_purpose_check;
alter table public.passport_versions add constraint passport_versions_purpose_check
  check (purpose is null or purpose in ('booking','availability','review','introduction','renewal'));
