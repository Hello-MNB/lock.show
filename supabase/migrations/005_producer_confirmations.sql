-- ============================================================
-- GIGPROOF — migration 005: producer (מפיק) claim confirmations (P1).
-- A producer confirms a specific claim via a no-login magic link. All writes
-- go through the server (service role); no public RLS on this table.
-- A confirmation upgrades the claim's method_label to 'producer-confirmed'
-- (the strongest label); revoking clears it.
-- Idempotent.
-- ============================================================

-- method_label on claims = the 6-label method-label system (migration 005 seeds
-- 'producer-confirmed'; the full vocabulary + UI lands with the method-label item).
alter table public.claims add column if not exists method_label text;

create table if not exists public.producer_confirmations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  claim_id uuid not null references public.claims(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  producer_contact text,
  response text check (response in ('yes','partial','no','wrong_person')),
  revoked boolean not null default false,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.producer_confirmations enable row level security;

-- Artist owner may read their own confirmation requests' status (no client write —
-- create/respond/revoke all go through the server with the service role).
drop policy if exists pc_owner_read on public.producer_confirmations;
create policy pc_owner_read on public.producer_confirmations
  for select using (public.owns_artist(artist_id));

drop policy if exists pc_operator_read on public.producer_confirmations;
create policy pc_operator_read on public.producer_confirmations
  for select using (public.is_operator());
