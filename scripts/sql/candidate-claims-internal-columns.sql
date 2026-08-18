-- ============================================================
-- CANDIDATE — NOT A MIGRATION, NOT APPLIED ANYWHERE.
--
-- Same convention as candidate-req-org-scope.sql and
-- candidate-share-link-columns.sql: a PROPOSAL that can be EXECUTED rather than
-- argued about. Promoting it is the owner's act and it needs the ruling below.
--
-- ── THE DEFECT ──────────────────────────────────────────────────────────────
-- 001:89   internal_confidence numeric,   -- DB-only; never returned to any client
-- 016:6    "claims.internal_confidence (a SCORE — firewall!)"
--
-- The contract at 001:89 says ANY client. Migration 016 enforced it for ANON
-- only — deliberately, and it says so at 016:9: "the OWNER still reads their own
-- private fields via the org policy + the `authenticated` grant." So the column
-- is un-SELECTable by anon and freely readable by `authenticated`.
--
-- That would be an academic gap if nothing read it. Three SHIPPED client reads
-- do, all running as `authenticated`, all `select('*')` on claims:
--     src/lib/db.js:177   (Act-scoped claim list)
--     src/lib/db.js:260   (artist claim list)
--     src/lib/db.js:788   (artist export)
-- A `select *` returns every column the role may select, so the AI's private
-- confidence number is delivered into the artist's browser today. Nothing
-- RENDERS it — scripts/test-guardrails.mjs [4] holds the buyer-facing payload
-- clean and that gate still passes — but "not rendered" is not the contract
-- 001:89 wrote, and a score sitting in a network response is inspectable by the
-- person the firewall exists to protect from scores.
--
-- ── THE SAME CLASS OF COLUMN ────────────────────────────────────────────────
-- 039:76 records extraction provenance as INTERNAL-ONLY "like
-- internal_confidence", so extraction_method, model_version and
-- extraction_provenance are revoked with it. server/index.js:451 already
-- excludes all four from the public payload by hand.
--
-- ── WHY THE LIST IS COMPUTED, NOT WRITTEN OUT ───────────────────────────────
-- A hand-written column list is the defect that shipped in the first draft of
-- candidate-act-public-scope.sql: it was copied from 001 and silently dropped
-- migration 031's `artist_approved` gate. So this file does NOT enumerate the
-- keep-list. It revokes, then re-grants every column of public.claims EXCEPT
-- the internal four, computed from information_schema at apply time. A column
-- added by a future migration is therefore granted automatically and cannot be
-- forgotten; a column that must be private has to be added to INTERNAL below,
-- which is a visible, reviewable act.
--
-- ── WHAT THIS BREAKS, STATED PLAINLY ────────────────────────────────────────
-- `select *` on claims will FAIL for every authenticated caller — permission
-- denied, not a silently narrower row. That is the point (016 did exactly this
-- to artists for anon), and it means the three call sites above must be changed
-- to explicit column lists IN THE SAME COMMIT as any promotion. The gate proves
-- the failure rather than describing it, so the cost is measured, not assumed.
--
-- ── OWNER DECISION REQUIRED ─────────────────────────────────────────────────
-- Two statements in the repo disagree and only Maria can say which is canon:
--   001:89 — internal_confidence is "never returned to any client", or
--   016:9  — the owner reads "their own private fields" as a deliberate choice.
-- If 001:89 is canon, promote this and fix the three call sites. If 016:9 is
-- canon, then 001:89's comment is stale and must be corrected in place, and the
-- artist's own organization reading the AI's confidence number becomes a
-- DOCUMENTED decision rather than an accident of a grant nobody revisited.
-- ============================================================

do $$
declare
  keep text;
  internal text[] := array['internal_confidence','extraction_method','model_version','extraction_provenance'];
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name)
    into keep
    from information_schema.columns
   where table_schema = 'public' and table_name = 'claims'
     and not (column_name = any(internal));

  if keep is null then
    raise exception 'claims has no grantable columns — refusing to revoke';
  end if;

  execute 'revoke select on public.claims from authenticated';
  execute format('grant select (%s) on public.claims to authenticated', keep);
end $$;
