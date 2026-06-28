-- ============================================================
-- GIGPROOF — migration 007: entitlements (A8 Founding Passport, manual payment).
-- Artist pays once (Bit/transfer/invoice, NO Stripe) → marks 'I've paid' →
-- status 'pending' → operator confirms → 'active'. The artist is never stuck;
-- the home shows the status. Idempotent.
-- ============================================================
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  subject_id uuid references auth.users(id) on delete set null,
  kind text not null default 'founding_passport',
  status text not null default 'pending' check (status in ('pending','active','cancelled')),
  amount_note text,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  activated_by uuid
);
alter table public.entitlements enable row level security;

-- Artist owner: read + create their own (pending) entitlement.
drop policy if exists ent_owner_read on public.entitlements;
create policy ent_owner_read on public.entitlements
  for select using (public.owns_artist(artist_id));
drop policy if exists ent_owner_insert on public.entitlements;
create policy ent_owner_insert on public.entitlements
  for insert with check (public.owns_artist(artist_id));

-- Operator: read all + activate (mark paid).
drop policy if exists ent_operator_read on public.entitlements;
create policy ent_operator_read on public.entitlements
  for select using (public.is_operator());
drop policy if exists ent_operator_update on public.entitlements;
create policy ent_operator_update on public.entitlements
  for update using (public.is_operator()) with check (public.is_operator());
