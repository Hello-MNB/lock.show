-- DOWN 048 — restore the 026 public write path.
--
-- DELIBERATELY DOES NOT DROP THE ADDED COLUMNS OR ANY ROW. Reverting the
-- conversion mode must never destroy captured waitlist records or a consent
-- history — B4-70.10 §10.1 requires that a return to signup mode "preserve
-- waitlist records and consent history". Dropping whatsapp_consent/consent_*
-- would delete exactly the evidence a consent claim rests on. The columns are
-- inert without the RPC, so leaving them costs nothing.
drop function if exists public.join_waitlist(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text,text,text);
drop policy if exists wl_definer_insert on public.waitlist_signup;
create policy wl_anon_insert on public.waitlist_signup
  for insert with check (true);
-- THE GRANT, not just the policy (independent QA, D4). The up-migration revokes
-- INSERT from anon/authenticated; recreating the policy without re-granting the
-- privilege left capture SILENTLY BROKEN after a rollback — RLS allowed the row
-- and the table-level grant refused it. Verified by execution: an anon INSERT
-- after this down file must succeed.
grant insert on public.waitlist_signup to anon;
grant insert on public.waitlist_signup to authenticated;
drop table if exists public.waitlist_rate;
