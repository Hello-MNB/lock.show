-- ============================================================
-- GIGPROOF — migration 006: passport_signals (B2 action-ladder rungs 2–6).
-- Each secondary rung the booker taps logs a lightweight validation signal
-- (the founder learning asset / moat). Rung 1 (availability) is the B3 request.
-- No login: anon may insert against a published artist (like availability_requests).
-- Idempotent.
-- ============================================================
create table if not exists public.passport_signals (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  signal text not null check (signal in
    ('price_details','future_fit','needs_proof','not_this_event','forwarded')),
  note text,
  created_at timestamptz not null default now()
);
alter table public.passport_signals enable row level security;

drop policy if exists ps_public_insert on public.passport_signals;
create policy ps_public_insert on public.passport_signals
  for insert with check (public.artist_is_published(artist_id));
drop policy if exists ps_owner_read on public.passport_signals;
create policy ps_owner_read on public.passport_signals
  for select using (public.owns_artist(artist_id));
drop policy if exists ps_operator_read on public.passport_signals;
create policy ps_operator_read on public.passport_signals
  for select using (public.is_operator());
