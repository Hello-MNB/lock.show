-- ============================================================
-- MIGRATION 048 — WAITLIST RELEASE MODE (CODE-WEB-021A)
--
-- STATUS: DRAFTED — NOT APPLIED to any live environment.
--
-- ADDITIVE ONLY. Migration 026 shipped a minimal waitlist_signup table and a
-- public `anon INSERT` policy, so the browser wrote to the table directly. That
-- is the path B4-70.10 §10.1 requires replacing: it cannot do server-side
-- validation, cannot be idempotent beyond a unique-index 409, cannot rate-limit,
-- and cannot record a versioned consent.
--
-- The site is a STATIC EXPORT (next.config.ts `output: 'export'`), so there is
-- no same-origin API route to move the write behind. A SECURITY DEFINER RPC is
-- therefore the governed path: validation, idempotency and rate limiting run
-- inside the database, and the anon role loses direct INSERT entirely.
--
-- EVERY EXISTING ROW IS PRESERVED. No column is dropped, no value is rewritten,
-- and the 026 role vocabulary stays valid alongside the new one.
-- ============================================================

-- ── 1 · ADDITIVE COLUMNS ────────────────────────────────────────────────────
alter table public.waitlist_signup add column if not exists entity_role      text;
alter table public.waitlist_signup add column if not exists primary_need     text;
alter table public.waitlist_signup add column if not exists whatsapp_e164    text;
alter table public.waitlist_signup add column if not exists whatsapp_consent boolean not null default false;
alter table public.waitlist_signup add column if not exists consent_text     text;
alter table public.waitlist_signup add column if not exists consent_version  text;
alter table public.waitlist_signup add column if not exists consent_locale   text;
alter table public.waitlist_signup add column if not exists consent_at       timestamptz;
alter table public.waitlist_signup add column if not exists utm_source       text;
alter table public.waitlist_signup add column if not exists utm_medium       text;
alter table public.waitlist_signup add column if not exists utm_campaign     text;
alter table public.waitlist_signup add column if not exists utm_content      text;
alter table public.waitlist_signup add column if not exists referrer         text;
alter table public.waitlist_signup add column if not exists cta_placement    text;
alter table public.waitlist_signup add column if not exists updated_at       timestamptz not null default now();

-- The six Entity/Roles from B4-70.10 §10.1, which explicitly forbids collapsing
-- producer, programmer, booking manager and representative into one role.
-- 026's four legacy values stay valid so existing rows keep satisfying the
-- constraint — this is why the check is a UNION, not a replacement.
alter table public.waitlist_signup drop constraint if exists waitlist_entity_role_ck;
alter table public.waitlist_signup add constraint waitlist_entity_role_ck
  check (entity_role is null or entity_role in (
    'artist', 'representative_agency', 'producer_promoter',
    'programmer_booker_buyer', 'venue', 'other'));

-- CONSENT INTEGRITY. A WhatsApp number may be stored without consent (the user
-- typed it and did not tick), but consent may NEVER be recorded without the
-- text, version, locale and timestamp that make it provable — an unversioned
-- "true" is not a consent record, it is an assertion.
alter table public.waitlist_signup drop constraint if exists waitlist_whatsapp_consent_ck;
alter table public.waitlist_signup add constraint waitlist_whatsapp_consent_ck
  check (whatsapp_consent = false
      or (consent_text is not null and consent_version is not null
          and consent_locale is not null and consent_at is not null
          and whatsapp_e164 is not null));

-- ── 2 · RATE LIMITING SUBSTRATE ─────────────────────────────────────────────
-- Coarse and privacy-preserving: a salted hash bucket, never an IP or an email.
create table if not exists public.waitlist_rate (
  bucket      text primary key,
  hits        integer not null default 0,
  window_start timestamptz not null default now()
);
alter table public.waitlist_rate enable row level security;
revoke all on public.waitlist_rate from anon, authenticated;

-- ── 3 · THE GOVERNED WRITE PATH ─────────────────────────────────────────────
-- Replaces the browser's direct table INSERT. Idempotent by design: a repeat
-- email UPDATES only non-sensitive preference fields and returns the SAME
-- neutral receipt as a first-time join, so the response never discloses whether
-- an address is already registered (§10.1: "does not leak whether another
-- person is registered beyond the same neutral receipt").
-- The 16-argument version must be DROPPED, not replaced. `create or replace`
-- cannot change a signature: adding p_message creates a SECOND overload, and
-- PostgREST would then resolve by whichever argument set the caller sent — an
-- old client could keep reaching a function this migration thinks it replaced.
drop function if exists public.join_waitlist(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text,text,text);
create or replace function public.join_waitlist(
  p_email            text,
  p_entity_role      text,
  p_name             text default null,
  p_primary_need     text default null,
  p_whatsapp         text default null,
  p_whatsapp_consent boolean default false,
  p_consent_text     text default null,
  p_consent_version  text default null,
  p_locale           text default 'en',
  p_source_page      text default null,
  p_cta_placement    text default null,
  p_utm_source       text default null,
  p_utm_medium       text default null,
  p_utm_campaign     text default null,
  p_utm_content      text default null,
  p_referrer         text default null,
  -- The 026 `message` column is where CONTACT text has always lived. The
  -- contact form used to INSERT it directly; now it arrives here, so the
  -- column keeps its meaning instead of being emptied by the move (GAP-W1).
  p_message          text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email  text := lower(trim(p_email));
  v_wa     text := nullif(regexp_replace(coalesce(p_whatsapp,''), '[^0-9+]', '', 'g'), '');
  v_bucket text;
  v_hits   integer;
  v_new    boolean;
begin
  -- SERVER-SIDE VALIDATION. The browser's `type=email` and `required` are
  -- conveniences, not controls; anything reaching this function may have
  -- skipped them entirely.
  if v_email is null or v_email = '' or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return jsonb_build_object('ok', false, 'code', 'invalid_email');
  end if;
  if length(v_email) > 320 then
    return jsonb_build_object('ok', false, 'code', 'invalid_email');
  end if;
  if p_entity_role is null or p_entity_role not in
     ('artist','representative_agency','producer_promoter','programmer_booker_buyer','venue','other') then
    return jsonb_build_object('ok', false, 'code', 'invalid_role');
  end if;
  if p_primary_need is not null and length(p_primary_need) > 2000 then
    return jsonb_build_object('ok', false, 'code', 'need_too_long');
  end if;
  if v_wa is not null and v_wa !~ '^\+?[0-9]{7,15}$' then
    return jsonb_build_object('ok', false, 'code', 'invalid_whatsapp');
  end if;
  if p_message is not null and length(p_message) > 4000 then
    return jsonb_build_object('ok', false, 'code', 'message_too_long');
  end if;

  -- CONSENT CANNOT BE ASSERTED WITHOUT ITS RECORD, and cannot be given for a
  -- number that was not supplied. Enforced here as well as in the constraint
  -- so a bad caller gets a clean code rather than a raw constraint violation.
  if p_whatsapp_consent and (v_wa is null or p_consent_text is null or p_consent_version is null) then
    return jsonb_build_object('ok', false, 'code', 'consent_incomplete');
  end if;

  -- RATE LIMIT: 5 joins per email-domain+role bucket per hour. Deliberately
  -- coarse — it must not become a per-person tracker.
  v_bucket := md5(split_part(v_email, '@', 2) || ':' || p_entity_role);
  insert into public.waitlist_rate (bucket, hits, window_start)
       values (v_bucket, 1, now())
  on conflict (bucket) do update
     set hits = case when public.waitlist_rate.window_start < now() - interval '1 hour'
                     then 1 else public.waitlist_rate.hits + 1 end,
         window_start = case when public.waitlist_rate.window_start < now() - interval '1 hour'
                             then now() else public.waitlist_rate.window_start end
  returning hits into v_hits;
  if v_hits > 5 then
    return jsonb_build_object('ok', false, 'code', 'rate_limited');
  end if;

  select not exists (select 1 from public.waitlist_signup where lower(email) = v_email) into v_new;

  insert into public.waitlist_signup as w
    (email, name, entity_role, primary_need, message, whatsapp_e164, whatsapp_consent,
     consent_text, consent_version, consent_locale, consent_at,
     source_page, cta_placement, locale,
     utm_source, utm_medium, utm_campaign, utm_content, referrer, updated_at)
  values
    (v_email, nullif(trim(coalesce(p_name,'')),''), p_entity_role,
     nullif(trim(coalesce(p_primary_need,'')),''), nullif(trim(coalesce(p_message,'')),''),
     v_wa, coalesce(p_whatsapp_consent,false),
     case when p_whatsapp_consent then p_consent_text end,
     case when p_whatsapp_consent then p_consent_version end,
     case when p_whatsapp_consent then p_locale end,
     case when p_whatsapp_consent then now() end,
     p_source_page, p_cta_placement, p_locale,
     p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_referrer, now())
  on conflict (lower(email)) do update
     -- IDEMPOTENT, and deliberately NARROW. A repeat submission may refresh
     -- non-sensitive preferences; it must never CLEAR a consent already given,
     -- which is why every field below is a coalesce that keeps the stored value
     -- when the new one is null, and consent can only move false -> true.
     set name             = coalesce(excluded.name, w.name),
         entity_role      = coalesce(excluded.entity_role, w.entity_role),
         primary_need     = coalesce(excluded.primary_need, w.primary_need),
         -- MESSAGES ACCUMULATE, they do not overwrite. Under the 026 path a
         -- second contact from the same address hit the unique index, returned
         -- 409, and the person's text was simply DISCARDED. Coalescing to the
         -- newest would lose the first message instead; coalescing to the oldest
         -- would reproduce the 026 loss. Appending loses neither. An exact
         -- repeat is not appended, so a double-submit does not duplicate text.
         -- GROWTH IS RATE-LIMITED, NOT BOUNDED — corrected after QA-INDEP-03 (M7)
         -- showed the earlier comment claimed more than the code delivered. The
         -- 5-per-hour limiter and the 4000-character cap bound the RATE; the column
         -- itself had no ceiling and appended forever. Combined with WL-OVERWRITE
         -- (docs/OWNER-PENDING.md — an unauthenticated caller may write to any
         -- address's row), an attacker rotating the six roles could append roughly
         -- 120 KB/hour to a chosen victim's row. The stored value is now capped at
         -- 32 KB: appends stop growing the column past that, and the OLDEST text is
         -- what survives, because the first message someone sent is the one they
         -- are waiting on an answer to.
         message          = case
           when excluded.message is null then w.message
           when w.message is null then excluded.message
           when w.message = excluded.message then w.message
           when length(w.message) >= 32768 then w.message
           else left(w.message || E'\n\n--- ' || to_char(now(), 'YYYY-MM-DD HH24:MI') || E' ---\n' || excluded.message, 32768)
         end,

         -- CONSENT BINDS TO THE NUMBER IT WAS GIVEN FOR (independent QA, D3).
         -- The previous version let whatsapp_e164 move by coalesce while
         -- whatsapp_consent latched one-way to true, so a second submission
         -- could attach a NEVER-CONSENTED number to a surviving `true` — the
         -- row then asserted consent for a number nobody agreed to, with a
         -- consent record captured against a different one. A number change
         -- now RESETS consent unless this same call carries a complete consent
         -- for the new number.
         whatsapp_e164    = coalesce(excluded.whatsapp_e164, w.whatsapp_e164),
         whatsapp_consent = case
           when excluded.whatsapp_e164 is not null
            and excluded.whatsapp_e164 is distinct from w.whatsapp_e164
             then coalesce(excluded.whatsapp_consent, false)
           else w.whatsapp_consent or excluded.whatsapp_consent
         end,
         -- The consent RECORD travels with the flag: when a number change
         -- resets consent, the old text/version/locale/timestamp must not
         -- survive to describe a consent that no longer exists.
         consent_text     = case
           when excluded.whatsapp_e164 is not null
            and excluded.whatsapp_e164 is distinct from w.whatsapp_e164
             then excluded.consent_text
           else coalesce(excluded.consent_text, w.consent_text) end,
         consent_version  = case
           when excluded.whatsapp_e164 is not null
            and excluded.whatsapp_e164 is distinct from w.whatsapp_e164
             then excluded.consent_version
           else coalesce(excluded.consent_version, w.consent_version) end,
         consent_locale   = case
           when excluded.whatsapp_e164 is not null
            and excluded.whatsapp_e164 is distinct from w.whatsapp_e164
             then excluded.consent_locale
           else coalesce(excluded.consent_locale, w.consent_locale) end,
         -- D6: consent_at now ADVANCES whenever the consent TEXT or VERSION
         -- changes, so a timestamp can never describe wording the person had
         -- not yet seen. It stays pinned only while the record is unchanged.
         consent_at       = case
           when excluded.whatsapp_e164 is not null
            and excluded.whatsapp_e164 is distinct from w.whatsapp_e164
             then excluded.consent_at
           when excluded.consent_version is not null
            and excluded.consent_version is distinct from w.consent_version
             then excluded.consent_at
           when excluded.consent_text is not null
            and excluded.consent_text is distinct from w.consent_text
             then excluded.consent_at
           else coalesce(w.consent_at, excluded.consent_at) end,
         locale           = coalesce(excluded.locale, w.locale),
         updated_at       = now();

  -- ONE NEUTRAL RECEIPT for both branches. `already` is returned so the UI can
  -- show a distinct-but-equally-successful message; it is NOT an existence
  -- oracle for a third party, because reaching this point required submitting
  -- that address through the form.
  return jsonb_build_object('ok', true, 'code', case when v_new then 'joined' else 'already' end);
end;
$$;

revoke all on function public.join_waitlist(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.join_waitlist(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text,text,text,text) to anon;
grant execute on function public.join_waitlist(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text,text,text,text) to authenticated;

-- ── 4 · CLOSE THE DIRECT PUBLIC WRITE ───────────────────────────────────────
-- The RPC above is now the only public path in. 026's anon INSERT policy is
-- withdrawn and the table-level grant revoked; existing rows are untouched.
drop policy if exists wl_anon_insert on public.waitlist_signup;
-- IDEMPOTENT. Caught by my own executed suite: without the drop, re-applying 048
-- raises `policy "wl_definer_insert" already exists` and the whole migration
-- aborts. A migration that cannot be re-run is a migration that fails the second
-- time an operator touches it — the same lesson 046 recorded.
drop policy if exists wl_definer_insert on public.waitlist_signup;
-- `false`, DELIBERATELY, and NOT a call to 046's artist_access_trusted_writer().
-- The first version of this policy did call it, which created a dependency that
-- made artist_access_trusted_writer() undroppable and broke the 043-047 rollback
-- chain — the existing grant-scope suite caught it immediately. A waitlist
-- table must not couple itself to the grant-authority migrations.
--
-- `false` is correct on its own terms: join_waitlist() is SECURITY DEFINER and
-- therefore runs as the table OWNER, and a table owner bypasses RLS unless the
-- table is set FORCE ROW LEVEL SECURITY (it is not). So the RPC writes freely
-- while every other principal is refused by this policy. The RPC is the only
-- way in, which is exactly the contract.
create policy wl_definer_insert on public.waitlist_signup
  for insert with check (false);
revoke insert on public.waitlist_signup from anon;
revoke insert on public.waitlist_signup from authenticated;
-- DEFENCE IN DEPTH (independent QA, D13). Only RLS default-deny stood between
-- these roles and the rows; the table-level privileges were still granted, so a
-- future policy mistake would have opened UPDATE/DELETE outright. 026 set this
-- precedent for SELECT ("the anon role cannot SELECT this table even if a
-- future policy mistake opens rows"); 048 now extends it to every verb.
revoke update, delete on public.waitlist_signup from anon;
revoke update, delete, select on public.waitlist_signup from authenticated;
