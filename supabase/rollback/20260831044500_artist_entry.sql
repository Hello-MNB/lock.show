-- Operational rollback: stop new entry mutations, preserve all identities,
-- consent, Artist/Act data, immutable receipts and terminal noncommit fences.
-- Never restore the direct-write/false-verification onboarding implementation.
revoke execute on function public.commit_artist_entry(jsonb) from public,anon,authenticated;
revoke execute on function public.read_artist_radar_context(uuid,uuid) from public,anon,authenticated;
-- Read and outcome resolution remain available to reconcile in-flight callers.
-- Existing fences still serialize with any already-running commit transaction.
