-- ============================================================
-- GIGPROOF — 002 Add whatsapp_number + notifications table
-- ============================================================

alter table public.artists add column if not exists whatsapp_number text;

-- In-app notifications (stub — no push; just DB records)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,          -- 'new_request' | 'claim_processed' | 'passport_published'
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists notif_self on public.notifications;
create policy notif_self on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
