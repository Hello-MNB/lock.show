-- ============================================================
-- 049 DOWN · restore `artists.created_by` to a caller-supplied column
--
-- REVERTING THIS RE-OPENS QA-INDEP-07 F1. That is what reverting means here, and
-- it is stated rather than hidden: with the trigger gone, an authenticated caller
-- can again insert an artists row carrying another person's `created_by`, and any
-- check that reads that column as ownership can be made to certify a cross-tenant
-- write. Do not revert 049 while 041 is applied unless you also revert 041.
--
-- Idempotent, and harmless against a database that never had 049.
-- ============================================================

begin;

drop trigger  if exists trg_artists_pin_created_by on public.artists;
drop function if exists public.artists_pin_created_by();

commit;
