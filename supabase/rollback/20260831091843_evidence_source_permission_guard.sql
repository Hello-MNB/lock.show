-- Operational rollback: disable evidence commits, never restore the vulnerable
-- pre-guard function. Preserve all evidence/consent, claims, snapshots, receipts,
-- fences, RLS, and authenticated read/reconciliation paths for safe return.
REVOKE EXECUTE ON FUNCTION public.commit_evidence_action(jsonb) FROM PUBLIC, anon, authenticated, service_role;
-- Re-enable only through a separately approved forward release after QA.
-- Reapplying this migration deliberately does not restore EXECUTE privileges.
