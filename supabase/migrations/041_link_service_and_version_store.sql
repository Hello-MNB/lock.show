-- ============================================================
-- LOCK — migration 041: LINK SERVICE + PASSPORT VERSION STORE
-- (P0-PRIVACY lane B1. AUTHORED, NOT APPLIED — the owner applies.
--  The build agent never touches the live DB: §16.A.6.a rollout rules.)
--
-- Closes DATA-LAYER-GAP-MAP A7 (version store) + A8 (share link / rule 3:
-- "one link = one recipient view = one version") in ONE file, because this
-- lane owns 041 only (042 is a parallel lane; the gap map's 041/042/043
-- split is collapsed here — see NUMBERING below).
--
-- THE DEFECT THIS EXISTS TO CLOSE
--   `pv_public_read` (001_initial_schema.sql:209-210) says
--       for select using (public.artist_is_published(artist_id))
--   so ANY anonymous reader may SELECT *every row* of
--   public.passport_versions for any published artist — including every
--   superseded historical snapshot, forever, with no link, no recipient,
--   no expiry and no revocation. `public.share_link` (024:18-34) already
--   exists to bind a recipient to ONE version and has ZERO readers and ZERO
--   writers in the entire codebase (verified by grep across src/ + server/).
--
-- ============================================================
-- ██ PRECONDITIONS — READ BEFORE APPLYING ███████████████████████████████████
-- ============================================================
--
-- WHAT MUST BE TRUE BEFORE APPLY (PART A)
--   P1. Migrations 001, 008, 017, 020, 024, 025, 027 are applied on the target
--       DB. This file references, and does not create:
--         public.passport_versions          (001:124 · act_id 020:93 · org 008:119)
--         public.share_link                 (024:18)
--         public.act, public.artists
--         public.can_access_artist(uuid)    (027:166 — current definition)
--         public.is_operator()              (003:20)
--         public.set_act_from_artist_id()   (020 — already on share_link, 024:39)
--       If any is absent, PART A fails at the first ALTER/CREATE that names it.
--   P2. Extension pgcrypto is available (Supabase pre-installs it; PART A
--       re-asserts `create extension if not exists pgcrypto` anyway). Needed
--       for digest() in the resolver's constant-shape hash comparison and for
--       gen_random_uuid() on the new table.
--   P3. NOTHING in the deployed app writes public.share_link today (grep: zero
--       readers, zero writers). So every column added here starts empty and no
--       running code can violate the new CHECKs. If that stops being true
--       between authoring and apply, re-verify before running.
--   P4. The server flag SHARE_LINK_SERVICE_ENABLED is OFF (unset / not '1').
--       PART A is inert while it is off: the new RPCs exist but nobody calls
--       them. Turning the flag on BEFORE PART A is applied yields 500s from
--       the resolver route (missing function) — flag ON is step 3, not step 1.
--
-- ORDER OF APPLY — THREE STEPS, DELIBERATELY SEPARATE
--   Step 1  PART A (this file, everything above the PART B fence).
--           ADDITIVE ONLY. No policy is dropped. No column is dropped. No type
--           is changed. Anonymous read surface is UNCHANGED after step 1.
--   Step 2  Deploy the app/server with SHARE_LINK_SERVICE_ENABLED=1 and mint
--           real links for any recipient who must keep access. Verify each
--           minted token resolves. THIS IS THE MIGRATION-FROM-OPEN-ACCESS
--           WINDOW: after step 3 an un-minted recipient has no path in.
--   Step 3  PART B (the fenced block at the bottom of this file, copied out and
--           run separately). THIS IS THE BREAKING ONE.
--
-- WHAT BREAKS IF APPLIED OUT OF ORDER
--   · PART B before PART A → the new policy references share_link.token_hash /
--     .revoked_at / passport_versions.state, none of which exist yet: the
--     CREATE POLICY fails and `pv_public_read` is ALREADY DROPPED by the
--     preceding statement in the same block. Result: anonymous SELECT on
--     passport_versions is fully closed with no replacement. Run PART B as one
--     transaction (BEGIN/COMMIT is included in the fenced block) so a failure
--     rolls the drop back.
--   · PART B before any link is minted (step 2 skipped) → every existing
--     recipient who was reading a Passport by artist id keeps working (the
--     public /passport/:id route reads LIVE artists/claims/profile_items rows,
--     NOT passport_versions — see IMPACT below), but nothing can read a
--     historical snapshot anonymously. That is the intent; it is only a problem
--     if some out-of-repo consumer depends on the open snapshot read.
--   · PART A twice → harmless. Every statement is `if not exists` / `or replace`
--     / drop-and-recreate. The backfills are idempotent (they only touch rows
--     where the new column is still NULL).
--
-- ██ THE ONE BREAKING ELEMENT — SAY IT PLAINLY ██
--   PART B replaces the policy `pv_public_read` on public.passport_versions.
--   Before: anon may read EVERY snapshot row of any published artist.
--   After:  anon may read EXACTLY the one row bound by a live (not expired,
--           not revoked, not replaced) share link, and the owner/org keeps
--           the full governed history via a separate policy.
--   Nothing else in this file removes or narrows any access.
--
--   IMPACT OF PART B ON SHIPPED CODE (verified by grep, 041 authoring):
--     · src/App.jsx:155 `/passport/:id` → src/lib/db.js:513 getPublicPassport()
--       reads artists + profile_items + claims LIVE. It does NOT read
--       passport_versions. UNAFFECTED.
--     · server/index.js:433 GET /api/passport/:artistId reads passport_versions
--       with the SERVICE ROLE, which bypasses RLS. UNAFFECTED.
--     · src/lib/db.js:470 recordPassportView() — anon SELECT id FROM
--       passport_versions WHERE artist_id = ... ORDER BY created_at DESC.
--       ⚠ THIS IS THE ONE SHIPPED ANON READER AND IT WILL STOP RETURNING ROWS.
--       Consequence: the passport_view_event row is silently not written for a
--       visit that arrived on the legacy /passport/:id route (the function
--       already swallows errors — "measurement is best-effort"). NO user-facing
--       breakage; MEASUREMENT DEGRADES until view recording moves onto the
--       token route (where resolve_share_link returns the bound version id).
--       This is a known, accepted, reversible consequence — not a surprise.
--
-- ROLLBACK
--   041_link_service_and_version_store.down.sql restores `pv_public_read`
--   verbatim from 001:209-210 first, then removes PART A. Restoring the old
--   policy alone is enough to undo the breaking half.
--
-- NUMBERING / LANE NOTE
--   The gap map plans 041 = version store, 042 = recipient_policy registry,
--   043 = link service. This lane owns 041 ONLY and 042 is held by a parallel
--   lane, so 041 carries the version store AND the link service. The recipient
--   policy REGISTRY TABLE is deliberately NOT created here: the six policy keys
--   are stored as a CHECK-constrained text column (`share_link.audience`,
--   `passport_versions.audience`), so a later migration can add
--   `recipient_policy(id …)` and attach a FK without moving any data.
--   Open canon question (gap map "What I could not determine"): whether the six
--   keys are booker/producer/private/programmer/brand/rep (Screen-Registry:72)
--   or "4 families + modes" (LOCK-Open-Decisions:118). Six is used here; a
--   correction is one CHECK re-add away (same pattern as 034/040).
--
-- FIREWALL
--   Nothing here stores or exposes a score, percentile, rank or prediction.
--   Open counts stay OFF the artist-facing surface: share_link_event is
--   operator-read only, and `share_link_delivery_v` — the sanctioned
--   artist-facing projection — exposes delivery + expiry ONLY (no opened_at,
--   no open_count, no event counts).
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- PART A — ADDITIVE. Safe to apply on its own. Changes no existing policy.
-- ============================================================

-- ──────────────────────────────────────────────────────────────────────────
-- A1 · passport_versions: make a version IDENTIFIABLE, ORDERED and IMMUTABLE
-- ──────────────────────────────────────────────────────────────────────────
-- Today the table is `id · artist_id · snapshot · created_at` (+organization_id
-- 008, +act_id 020): a log, not a version store. No state, no ordering, no
-- supersede pointer. A share link cannot bind "one version" meaningfully while
-- every row is anonymous and interchangeable.

alter table public.passport_versions
  add column if not exists version_no    integer,
  add column if not exists state         text,
  add column if not exists supersedes_id uuid references public.passport_versions(id) on delete set null,
  add column if not exists published_at  timestamptz,
  add column if not exists superseded_at timestamptz,
  add column if not exists created_by    uuid references auth.users(id) on delete set null,
  add column if not exists content_hash  text,
  -- audience: which of the six recipient policies this version was cut for.
  -- NULL = "not policy-scoped" (every row that exists before 041). A later
  -- migration may add recipient_policy(id) and attach a FK to this column.
  add column if not exists audience      text;

comment on column public.passport_versions.version_no is
  'Monotonic per act (per artist for pre-act rows). Filled by trg_pv_defaults; never reused, never rewritten.';
comment on column public.passport_versions.state is
  'draft · preview · review · published · superseded. Exactly one published row per (act_id, audience) — idx_pv_one_published.';
comment on column public.passport_versions.audience is
  'One of the six recipient policies (booker·producer·private·programmer·brand·rep), or NULL for a non-policy-scoped snapshot.';

do $$ begin
  alter table public.passport_versions
    add constraint passport_versions_state_check
    check (state is null or state in ('draft','preview','review','published','superseded'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.passport_versions
    add constraint passport_versions_audience_check
    check (audience is null or audience in ('booker','producer','private','programmer','brand','rep'));
exception when duplicate_object then null; end $$;

-- Backfill. Every existing row was written by publishPassport() at publish time
-- (src/lib/db.js:572-586), so the newest row per act IS the published one and
-- every older row IS superseded. Deterministic tie-break: created_at, then id.
with ordered as (
  select id,
         coalesce(act_id, artist_id) as lineage,
         row_number() over (partition by coalesce(act_id, artist_id)
                            order by created_at asc, id asc) as rn,
         row_number() over (partition by coalesce(act_id, artist_id)
                            order by created_at desc, id desc) as rn_desc
    from public.passport_versions
)
update public.passport_versions pv
   set version_no    = coalesce(pv.version_no, o.rn),
       state         = coalesce(pv.state, case when o.rn_desc = 1 then 'published' else 'superseded' end),
       published_at  = coalesce(pv.published_at, pv.created_at),
       superseded_at = case
                         when pv.superseded_at is not null then pv.superseded_at
                         when o.rn_desc = 1 then null
                         else pv.created_at
                       end
  from ordered o
 where o.id = pv.id
   and (pv.version_no is null or pv.state is null or pv.published_at is null);

-- Ordering identity. Partial-unique on the live row: at most ONE published
-- version per (act_id, audience). NULLs are distinct in Postgres, so pre-act
-- rows (act_id null) are not constrained by this index — intended, and it is
-- why act_id NOT NULL is a later cutover, not this migration's job.
create unique index if not exists idx_pv_one_published
  on public.passport_versions (act_id, audience)
  where state = 'published';

create unique index if not exists idx_pv_act_version_no
  on public.passport_versions (act_id, version_no);

create index if not exists idx_pv_state on public.passport_versions (state);

-- version_no / state are NOT declared NOT NULL here on purpose. The live writer
-- (src/lib/db.js:579) inserts {artist_id, snapshot} and nothing else; NOT NULL
-- without a filler would break publishing on the next deploy. trg_pv_defaults
-- below fills both on INSERT. Promote to NOT NULL in a later migration once the
-- trigger has been live through at least one publish cycle.
create or replace function public.pv_fill_defaults()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_lineage uuid := coalesce(new.act_id, new.artist_id);
begin
  if new.version_no is null then
    select coalesce(max(version_no), 0) + 1 into new.version_no
      from public.passport_versions
     where coalesce(act_id, artist_id) = v_lineage;
  end if;
  if new.state is null then new.state := 'published'; end if;   -- matches today's publish-only writer
  if new.state = 'published' and new.published_at is null then
    new.published_at := coalesce(new.created_at, now());
  end if;
  if new.created_by is null then new.created_by := auth.uid(); end if;
  return new;
end $$;

drop trigger if exists trg_pv_defaults on public.passport_versions;
create trigger trg_pv_defaults before insert on public.passport_versions
  for each row execute function public.pv_fill_defaults();

-- IMMUTABILITY. A share link binds one version; if that version's snapshot can
-- be edited under the recipient, the binding proves nothing. Nothing in the repo
-- UPDATEs this table today (001:122 "Never updated — only new rows added", and
-- there is no UPDATE policy), so this guard forbids only what already never
-- happens — while making it structural instead of conventional.
-- The ONLY permitted transition is published → superseded (plus the pointers
-- that record it). Everything else raises.
create or replace function public.pv_guard_immutable()
returns trigger language plpgsql as $$
begin
  if new.snapshot     is distinct from old.snapshot     then raise exception 'passport_versions.snapshot is immutable (version %)', old.id; end if;
  if new.artist_id    is distinct from old.artist_id    then raise exception 'passport_versions.artist_id is immutable (version %)', old.id; end if;
  if new.act_id       is distinct from old.act_id       then raise exception 'passport_versions.act_id is immutable (version %)', old.id; end if;
  if new.version_no   is distinct from old.version_no   then raise exception 'passport_versions.version_no is immutable (version %)', old.id; end if;
  if new.created_at   is distinct from old.created_at   then raise exception 'passport_versions.created_at is immutable (version %)', old.id; end if;
  if old.state = 'superseded' and new.state <> 'superseded' then
    raise exception 'passport_versions: a superseded version can never be revived (version %)', old.id;
  end if;
  return new;
end $$;

drop trigger if exists trg_pv_immutable on public.passport_versions;
create trigger trg_pv_immutable before update on public.passport_versions
  for each row execute function public.pv_guard_immutable();

-- ──────────────────────────────────────────────────────────────────────────
-- A2 · share_link: the recipient binding — token, audience, purpose, lifecycle
-- ──────────────────────────────────────────────────────────────────────────
-- Existing (024:18-34): id · passport_version_id NOT NULL · artist_id · act_id ·
-- recipient_label · context · tracking_disclosed · expiry · utm_* ·
-- status{active·expired·revoked} · opened_at · open_count · created_at.
-- Missing: a handle anon can present, WHO the link is for, WHY, when authority
-- was withdrawn, and who minted it.

alter table public.share_link
  -- THE HANDLE. Only the sha256 HEX DIGEST of the token is stored — never the
  -- token itself. Same decision, and the same digest shape, as the confirmation
  -- token plan in 036_token_hash.sql.DRAFT: a leaked table/backup must not be a
  -- set of working links.
  --   GENERATION EXPECTATION (server contract, src/lib/shareLink.js):
  --     raw token = base64url(crypto.randomBytes(32))  → 256 bits of entropy,
  --     43 chars, [A-Za-z0-9_-]. Stored value =
  --     encode(digest(raw,'sha256'),'hex') = 64 lowercase hex chars.
  --     The raw token is returned to the minting owner EXACTLY ONCE and is not
  --     recoverable afterwards. Anything shorter than 32 bytes is a defect:
  --     this is a bearer credential to a person's professional evidence.
  add column if not exists token_hash text,

  -- WHICH of the six recipient policies this link opens. One link = one view.
  add column if not exists audience text,

  -- WHY it was sent, in the owner's words. Working-only; never rendered to the
  -- recipient, never used in any derivation.
  add column if not exists purpose text,

  -- Authority withdrawal. status='revoked' is the state; revoked_at is the
  -- receipt. History is never deleted (mirrors the D1 mandate law).
  add column if not exists revoked_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,

  -- Endless expiry is a DELIBERATE ANSWER, not a missing value — the same rule
  -- src/lib/mandateExpiry.js already applies to artist_access.expires_at.
  -- expiry IS NULL  ⇔  expiry_kind='endless'  ⇔  this link never lapses on the
  -- clock (it can still be revoked or replaced). See the CHECK below: the two
  -- columns can never disagree.
  add column if not exists expiry_kind text,

  -- "Replace" never re-points a link: it mints a new row and marks the old one.
  add column if not exists replaced_by uuid references public.share_link(id) on delete set null,

  -- The recipient said "this isn't me". A distinct terminal state, because it
  -- resolves to a different recovery path than expiry or revocation.
  add column if not exists wrong_recipient_at timestamptz;

comment on column public.share_link.token_hash is
  'sha256 hex of the opaque bearer token. The token itself is NEVER stored. 32 random bytes, base64url, returned to the minter once.';
comment on column public.share_link.expiry is
  'NULL means ENDLESS — a deliberate choice, not a missing value. Enforced paired with expiry_kind by share_link_expiry_kind_check.';
comment on column public.share_link.audience is
  'One of the six recipient policies: booker · producer · private · programmer · brand · rep. One link = one audience = one version.';

update public.share_link
   set expiry_kind = case when expiry is null then 'endless' else 'date' end
 where expiry_kind is null;

-- Default 'endless' matches the common case (a link with no end date). NOTE:
-- an INSERT that sets `expiry` but leaves `expiry_kind` to the default is
-- REFUSED by share_link_expiry_kind_check — deliberately fail-closed, so a
-- dated link can never masquerade as endless. Every writer sets both
-- (mint_share_link() and the server mint route already do).
alter table public.share_link alter column expiry_kind set default 'endless';

do $$ begin
  alter table public.share_link
    add constraint share_link_expiry_kind_check
    check (
      expiry_kind is null
      or (expiry_kind = 'endless' and expiry is null)
      or (expiry_kind = 'date'    and expiry is not null)
    );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.share_link
    add constraint share_link_audience_check
    check (audience is null or audience in ('booker','producer','private','programmer','brand','rep'));
exception when duplicate_object then null; end $$;

-- One hash = one link. Unique AND the index the resolver seeks on.
create unique index if not exists idx_share_link_token_hash
  on public.share_link (token_hash);

-- Status vocabulary widened by the repo's drop-and-re-add-with-the-full-list
-- pattern (034:4, 040:22), retaining every legacy value the way 027:206-210 did.
-- 'active' is RETAINED as the legacy synonym of 'live' — existing rows are not
-- rewritten, and both are treated as live by the resolver.
alter table public.share_link drop constraint if exists share_link_status_check;
alter table public.share_link add constraint share_link_status_check
  check (status in (
    'active',          -- legacy (024 default) — same meaning as 'live'
    'live',
    'expired',         -- the clock ran out
    'revoked',         -- the artist withdrew authority
    'replaced',        -- a newer link supersedes this one
    'unpublished',     -- the act pulled the whole Passport
    'withdrawn',       -- the bound version was withdrawn
    'wrong_recipient'  -- the recipient declared this is not them
  ));

-- ──────────────────────────────────────────────────────────────────────────
-- A3 · share_link_event — append-only receipts (mint · open · revoke · expire)
-- ──────────────────────────────────────────────────────────────────────────
-- WHY A SEPARATE TABLE: share_link.opened_at/open_count (024) are a mutable
-- summary. A summary cannot answer "was this link ever opened after it was
-- revoked", cannot be replayed, and cannot be audited. Receipts can.
-- IDEMPOTENCY: every write carries an idempotency_key. A replayed open (double
-- tap, retried fetch, a proxy prefetch) collides on idx_sle_idempotent and is a
-- no-op — the same receipt, never a second one.
create table if not exists public.share_link_event (
  id              uuid primary key default gen_random_uuid(),
  share_link_id   uuid not null references public.share_link(id) on delete cascade,
  event           text not null check (event in (
                    'minted','opened','revoked','expired','replaced','wrong_recipient_declared')),
  -- Caller-supplied, deterministic. Open: hash of (link, session, coarse time
  -- bucket). Mint: hash of the mint request. Never a PII value.
  idempotency_key text not null,
  occurred_at     timestamptz not null default now(),
  -- Method-safe detail only: outcome key, audience, coarse UA class. NEVER a
  -- count, a score, or anything that returns to the artist as a number.
  detail          jsonb
);

create unique index if not exists idx_sle_idempotent
  on public.share_link_event (share_link_id, event, idempotency_key);
create index if not exists idx_sle_link_time
  on public.share_link_event (share_link_id, occurred_at desc);

alter table public.share_link_event enable row level security;

-- Append-only by construction: an INSERT policy and a SELECT policy exist; no
-- UPDATE policy and no DELETE policy are ever created, so RLS refuses both.
-- Writes arrive through the SECURITY DEFINER functions below (or the service
-- role), never from an anonymous client directly.
drop policy if exists sle_owner_insert on public.share_link_event;
create policy sle_owner_insert on public.share_link_event
  for insert with check (
    exists (select 1 from public.share_link sl
             where sl.id = share_link_id and public.can_access_artist(sl.artist_id))
  );

-- READ IS OPERATOR-ONLY. This is a firewall decision, not an oversight: canon
-- says a link row shows the artist DELIVERY and EXPIRY only — never how many
-- times a buyer opened it. The artist-facing projection is share_link_delivery_v.
drop policy if exists sle_operator_read on public.share_link_event;
create policy sle_operator_read on public.share_link_event
  for select using (public.is_operator());

revoke select on public.share_link_event from anon;

-- ──────────────────────────────────────────────────────────────────────────
-- A4 · share_link_delivery_v — the ONLY artist-facing projection of a link
-- ──────────────────────────────────────────────────────────────────────────
-- Delivery + expiry. No opened_at, no open_count, no event count, no derived
-- "engagement" anything. A reaction is a reaction (019); an open is not one.
-- security_invoker = true is NOT optional here: a view created by the postgres
-- role otherwise runs with the OWNER's rights and would hand every caller
-- every artist's links, bypassing share_link's RLS entirely. With it, the
-- existing sl_org_all / sl_operator_read policies still decide who sees what.
create or replace view public.share_link_delivery_v
  with (security_invoker = true) as
  select sl.id,
         sl.act_id,
         sl.artist_id,
         sl.passport_version_id,
         sl.recipient_label,
         sl.audience,
         sl.purpose,
         sl.status,
         sl.expiry,
         sl.expiry_kind,
         sl.revoked_at,
         sl.replaced_by,
         sl.tracking_disclosed,
         sl.created_at
    from public.share_link sl;

comment on view public.share_link_delivery_v is
  'Artist-facing link list: delivery and expiry ONLY. open_count/opened_at are deliberately absent (firewall: no counts return to the artist).';

revoke all on public.share_link_delivery_v from anon;

-- ──────────────────────────────────────────────────────────────────────────
-- A5 · resolve_share_link() — the ONLY anonymous read path (SECURITY DEFINER)
-- ──────────────────────────────────────────────────────────────────────────
-- Read-only. Takes the sha256 hex of the presented token. Returns exactly ONE
-- typed outcome. On any dead outcome it returns the reason AND NOTHING ELSE —
-- no act name, no version id, no snapshot. A dead link must not leak the thing
-- it used to open.
--
-- Outcome vocabulary is the contract shared with src/lib/shareLink.js:
--   ok · not_found · expired · revoked · superseded_not_permitted · wrong_recipient
-- ('replaced' and 'unpublished' collapse into revoked/not_found deliberately —
--  the six outcomes above are the typed surface the client renders.)
create or replace function public.resolve_share_link(p_token_hash text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  sl  public.share_link%rowtype;
  pv  public.passport_versions%rowtype;
begin
  if p_token_hash is null or length(p_token_hash) <> 64 then
    return jsonb_build_object('outcome','not_found');
  end if;

  select * into sl from public.share_link where token_hash = p_token_hash;
  if not found then
    return jsonb_build_object('outcome','not_found');
  end if;

  if sl.status = 'wrong_recipient' or sl.wrong_recipient_at is not null then
    return jsonb_build_object('outcome','wrong_recipient');
  end if;
  if sl.status in ('revoked','replaced','unpublished','withdrawn') or sl.revoked_at is not null then
    return jsonb_build_object('outcome','revoked');
  end if;
  if sl.status = 'expired' or (sl.expiry is not null and sl.expiry <= now()) then
    return jsonb_build_object('outcome','expired');
  end if;
  if sl.status not in ('active','live') then
    return jsonb_build_object('outcome','revoked');
  end if;

  select * into pv from public.passport_versions where id = sl.passport_version_id;
  if not found then
    return jsonb_build_object('outcome','not_found');
  end if;

  -- A superseded version stays reachable ONLY through the live link that binds
  -- it — that is the whole point of binding one immutable version. It becomes
  -- unreachable the moment the link stops being live (handled above). What is
  -- refused here is a version that was WITHDRAWN or never published at all.
  if pv.state is not null and pv.state not in ('published','superseded') then
    return jsonb_build_object('outcome','superseded_not_permitted');
  end if;

  return jsonb_build_object(
    'outcome',             'ok',
    'share_link_id',       sl.id,
    'passport_version_id', pv.id,
    'version_no',          pv.version_no,
    'version_state',       pv.state,
    'audience',            coalesce(sl.audience, pv.audience),
    'act_id',              coalesce(sl.act_id, pv.act_id),
    'expiry',              sl.expiry,
    'snapshot',            pv.snapshot
  );
end $$;

revoke all on function public.resolve_share_link(text) from public;
grant execute on function public.resolve_share_link(text) to anon, authenticated, service_role;

-- ──────────────────────────────────────────────────────────────────────────
-- A6 · record_share_link_open() — replay-safe receipt (SECURITY DEFINER)
-- ──────────────────────────────────────────────────────────────────────────
-- Separate from the resolver so resolution stays read-only and a measurement
-- failure can never block a recipient from reading. Returns true when a NEW
-- receipt was written, false when the call was a replay. Never raises.
create or replace function public.record_share_link_open(p_token_hash text, p_idempotency_key text)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_link uuid;
  v_rows integer := 0;
  v_new  boolean := false;
begin
  if p_token_hash is null or p_idempotency_key is null then return false; end if;

  select id into v_link from public.share_link
   where token_hash = p_token_hash
     and status in ('active','live')
     and revoked_at is null
     and wrong_recipient_at is null
     and (expiry is null or expiry > now());
  if v_link is null then return false; end if;   -- a dead link records nothing

  insert into public.share_link_event (share_link_id, event, idempotency_key, detail)
  values (v_link, 'opened', p_idempotency_key, jsonb_build_object('via','resolve_share_link'))
  on conflict (share_link_id, event, idempotency_key) do nothing;
  get diagnostics v_rows = row_count;
  v_new := (v_rows > 0);   -- 0 rows = the receipt already existed = a replay

  -- The 024 summary columns stay maintained for compatibility, but ONLY on a
  -- genuinely new receipt — a replay must not inflate anything. Neither column
  -- is exposed to the artist (share_link_delivery_v omits both).
  if v_new then
    update public.share_link
       set opened_at = coalesce(opened_at, now()),
           open_count = open_count + 1
     where id = v_link;
  end if;
  return v_new;
end $$;

revoke all on function public.record_share_link_open(text, text) from public;
grant execute on function public.record_share_link_open(text, text) to anon, authenticated, service_role;

-- ──────────────────────────────────────────────────────────────────────────
-- A7 · mint_share_link() — idempotent (SECURITY DEFINER, owner/org only)
-- ──────────────────────────────────────────────────────────────────────────
-- Idempotency: the caller supplies a key derived from the mint request. Calling
-- twice with the same key returns the SAME row and does NOT mint a second
-- bearer credential. The raw token never enters this function — only its hash;
-- the caller is the only place the raw token ever exists.
create or replace function public.mint_share_link(
  p_passport_version_id uuid,
  p_token_hash          text,
  p_audience            text,
  p_recipient_label     text,
  p_purpose             text,
  p_expiry              timestamptz,
  p_idempotency_key     text
) returns uuid
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_artist uuid;
  v_act    uuid;
  v_id     uuid;
begin
  select artist_id, act_id into v_artist, v_act
    from public.passport_versions where id = p_passport_version_id;
  if v_artist is null then raise exception 'unknown passport_version %', p_passport_version_id; end if;
  if not public.can_access_artist(v_artist) then raise exception 'forbidden'; end if;
  if p_token_hash is null or length(p_token_hash) <> 64 then raise exception 'token_hash must be sha256 hex'; end if;
  if p_idempotency_key is null then raise exception 'idempotency_key required'; end if;

  -- Replay: the mint receipt already exists → return the link it minted.
  select share_link_id into v_id from public.share_link_event
   where event = 'minted' and idempotency_key = p_idempotency_key
   limit 1;
  if v_id is not null then return v_id; end if;

  insert into public.share_link (
    passport_version_id, artist_id, act_id, recipient_label, purpose, audience,
    token_hash, expiry, expiry_kind, status, created_by, tracking_disclosed
  ) values (
    p_passport_version_id, v_artist, v_act, p_recipient_label, p_purpose, p_audience,
    p_token_hash, p_expiry, case when p_expiry is null then 'endless' else 'date' end,
    'live', auth.uid(), false
  ) returning id into v_id;

  insert into public.share_link_event (share_link_id, event, idempotency_key, detail)
  values (v_id, 'minted', p_idempotency_key, jsonb_build_object('audience', p_audience))
  on conflict (share_link_id, event, idempotency_key) do nothing;

  return v_id;
end $$;

revoke all on function public.mint_share_link(uuid, text, text, text, text, timestamptz, text) from public;
grant execute on function public.mint_share_link(uuid, text, text, text, text, timestamptz, text) to authenticated, service_role;

-- ──────────────────────────────────────────────────────────────────────────
-- A8 · revoke_share_link() — future authority stops, history stays
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.revoke_share_link(p_share_link_id uuid, p_idempotency_key text default null)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_artist uuid;
begin
  select artist_id into v_artist from public.share_link where id = p_share_link_id;
  if v_artist is null then return false; end if;
  if not public.can_access_artist(v_artist) then raise exception 'forbidden'; end if;

  update public.share_link
     set status = 'revoked', revoked_at = coalesce(revoked_at, now())
   where id = p_share_link_id and status <> 'revoked';

  insert into public.share_link_event (share_link_id, event, idempotency_key, detail)
  values (p_share_link_id, 'revoked',
          coalesce(p_idempotency_key, 'revoke:' || p_share_link_id::text), '{}'::jsonb)
  on conflict (share_link_id, event, idempotency_key) do nothing;
  return true;
end $$;

revoke all on function public.revoke_share_link(uuid, text) from public;
grant execute on function public.revoke_share_link(uuid, text) to authenticated, service_role;

-- ============================================================
-- ██ END OF PART A. Everything above is additive and reversible. ██
-- ============================================================


-- ============================================================
-- ██ PART B — THE BREAKING HALF · DO NOT RUN WITH PART A ████████████████████
-- ============================================================
-- This block is FENCED IN A COMMENT ON PURPOSE. Applying this file top to
-- bottom performs the additive half ONLY. To perform the breaking half, copy
-- the block below (without the leading `-- `), satisfy step 2 of the apply
-- order (mint links for anyone who must keep access), and run it as ONE
-- transaction — the BEGIN/COMMIT is part of the block so a failed CREATE
-- POLICY rolls back the DROP POLICY that precedes it.
--
-- WHAT IT DOES: replaces `pv_public_read` (001:209-210, "anon may read every
-- snapshot of any published artist") with two policies —
--   pv_share_link_read  — anon may read EXACTLY the version bound by a LIVE
--                         share link (not expired, not revoked, not replaced,
--                         not wrong-recipient).
--   pv_org_history_read — the owner/org keeps the FULL governed history,
--                         including superseded versions.
--   pv_operator_read    — operator retains read for support/audit.
-- Verify after running (as anon, i.e. with the anon key, RLS on):
--   select count(*) from passport_versions;                    -- expect 0
--   select resolve_share_link('<sha256 hex of a live token>');  -- expect ok
--   select resolve_share_link('<sha256 hex of a revoked token>');-- expect revoked
--
-- ─────────────────── COPY FROM HERE ───────────────────
-- begin;
--
-- drop policy if exists pv_public_read on public.passport_versions;
--
-- -- ANON: one live link ⇒ one version. Nothing else, ever.
-- create policy pv_share_link_read on public.passport_versions
--   for select using (
--     exists (
--       select 1 from public.share_link sl
--        where sl.passport_version_id = passport_versions.id
--          and sl.status in ('active','live')
--          and sl.revoked_at is null
--          and sl.wrong_recipient_at is null
--          and (sl.expiry is null or sl.expiry > now())
--     )
--   );
--
-- -- OWNER / ORG: the full governed history stays readable to the people who
-- -- own it — that is the point of "owners retain governed history".
-- create policy pv_org_history_read on public.passport_versions
--   for select using (public.can_access_artist(artist_id));
--
-- -- OPERATOR: support and audit.
-- create policy pv_operator_read on public.passport_versions
--   for select using (public.is_operator());
--
-- commit;
-- ─────────────────── COPY TO HERE ───────────────────
--
-- ROLLBACK OF PART B ALONE (restores 001:209-210 verbatim):
--   begin;
--     drop policy if exists pv_share_link_read  on public.passport_versions;
--     drop policy if exists pv_org_history_read on public.passport_versions;
--     drop policy if exists pv_operator_read    on public.passport_versions;
--     create policy pv_public_read on public.passport_versions
--       for select using (public.artist_is_published(artist_id));
--   commit;
-- ============================================================
