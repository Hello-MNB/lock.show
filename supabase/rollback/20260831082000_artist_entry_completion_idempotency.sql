-- Operational rollback: disable this new entry event path, retain ALL existing
-- identities, basics/consent/history, canonical analytics rows and their IDs.
-- The client must never fall back to the old raw duplicate-emitting insert.
revoke all on function public.complete_artist_entry(jsonb) from public,anon,authenticated;
