-- ============================================================
-- 011 — AUDIT LOG + OPERATOR DATA-RIGHTS  (BUILD-SPEC-ORG-RADAR §21, Step 4)
-- Destructive operator actions (OP12 erasure) write an audit row first.
-- is_operator() already exists (migration 003). Idempotent.
-- ============================================================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,                 -- e.g. 'delete_artist', 'export_artist'
  target_type text,
  target_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;
drop policy if exists audit_operator on public.audit_log;
create policy audit_operator on public.audit_log for all
  using (public.is_operator()) with check (public.is_operator());

create index if not exists idx_audit_created on public.audit_log(created_at desc);

-- OP12 right-to-erasure: an operator may delete an artist (cascade removes the
-- artist's claims/items/evidence/requests). The app writes the audit row first.
drop policy if exists artists_operator_delete on public.artists;
create policy artists_operator_delete on public.artists for delete using (public.is_operator());
