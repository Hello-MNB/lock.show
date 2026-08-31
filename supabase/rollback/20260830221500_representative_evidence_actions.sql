-- Operational rollback disables new paths; NEVER delete receipts, fences,
-- prior Passport snapshots, evidence, claims or version bookkeeping.
revoke execute on function public.commit_evidence_action(jsonb) from authenticated;
revoke execute on function public.resolve_evidence_action(jsonb) from authenticated;
revoke execute on function public.get_evidence_workbench(uuid,uuid) from authenticated;
-- Direct-write restrictions, publication guards and immutable history remain.
