drop function if exists public.accept_roster_invitation(uuid, uuid, uuid);
drop table if exists public.roster_invitation;

-- Deliberately do not recreate the unsafe historic FOR ALL artist_access
-- policies. Restoring them would re-open representation self-activation.
