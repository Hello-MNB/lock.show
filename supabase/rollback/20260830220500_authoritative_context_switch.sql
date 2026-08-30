-- Fail-closed rollback for R15-KU10.
-- Remove the callable switch surface while retaining immutable receipts,
-- context_version and the direct-write denial. Audit history is never deleted
-- and rolling application code back cannot re-open raw active_role_context writes.

revoke all on function public.get_context_switch_receipt(uuid) from public, anon, authenticated;
revoke all on function public.resolve_context_switch_outcome(uuid, uuid, bigint, uuid) from public, anon, authenticated;
revoke all on function public.commit_context_switch(uuid, uuid, bigint, uuid) from public, anon, authenticated;
revoke all on function public.preflight_context_switch(uuid, uuid, bigint) from public, anon, authenticated;
revoke all on function public.select_context_switch_targets() from public, anon, authenticated;

drop function if exists public.get_context_switch_receipt(uuid);
drop function if exists public.resolve_context_switch_outcome(uuid, uuid, bigint, uuid);
drop function if exists public.commit_context_switch(uuid, uuid, bigint, uuid);
drop function if exists public.preflight_context_switch(uuid, uuid, bigint);
drop function if exists public.select_context_switch_targets();
drop function if exists private.context_target_is_authorized(uuid, uuid, uuid);
drop function if exists private.context_role_allowed(text, text);

-- Deliberately retained:
--   public.context_switch_receipt and every receipt row
--   private.context_switch_noncommit and every durable noncommit fence
--   active_role_context.context_version
--   arc_self_read plus direct insert/update/delete revocation
