-- MNB core schema (MASTER-AZ v2.3 §2) — append-only where money/safety is involved.
-- Every table: created_at, market_pack, RLS enabled. Visibility classes enforced via RLS policies.

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ── profiles ────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id),
  side text not null check (side in ('provider','growth')),
  display_alias text not null,
  age_band text not null,                     -- PUBLIC: band only, never exact age
  city_display text not null,                 -- PUBLIC: region-level only
  profession_category text,
  goals_primary text,                         -- PUBLIC
  intent_level int check (intent_level between 1 and 5),  -- MODEL_ONLY
  communication_style text check (communication_style in ('warm','direct','playful','reserved')),
  pacing text check (pacing in ('slow','steady','fast')),
  visibility_mode text not null default 'matches_only' check (visibility_mode in ('matches_only','open')),
  premium_tier text not null default 'none' check (premium_tier in ('none','premium','elite')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified')),
  trust_signals text[] not null default '{}',
  about text,
  market_pack text not null default 'IL',
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;

-- ── companion_memory — the flywheel moat; deleted only via DSR ─────────────
create table companion_memory (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  kind text not null check (kind in ('session','longterm','external')),
  content text not null,
  embedding vector(1536),
  salience real not null default 0.5,
  market_pack text not null default 'IL',
  created_at timestamptz not null default now()
);
alter table companion_memory enable row level security;

-- ── matches ─────────────────────────────────────────────────────────────────
create table matches (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references profiles(id),
  growth_id uuid not null references profiles(id),
  aria_score int not null,                    -- MODEL_ONLY: ordering, never a displayed grade
  score_breakdown jsonb not null,
  why_match_text text not null,               -- the human-facing explanation
  state text not null default 'suggested' check (state in ('suggested','mutual','declined')),
  market_pack text not null default 'IL',
  created_at timestamptz not null default now()
);
alter table matches enable row level security;

-- ── messages — coercion scan writes safety_flag ─────────────────────────────
create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id),
  sender_id uuid not null references profiles(id),
  body text not null,
  safety_flag text not null default 'green' check (safety_flag in ('green','yellow','red')),
  market_pack text not null default 'IL',
  created_at timestamptz not null default now()
);
alter table messages enable row level security;

-- ── goal_fund_txn — APPEND-ONLY escrow ledger; state changes are new rows ──
create table goal_fund_txn (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id),
  provider_id uuid not null references profiles(id),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'ILS',
  state text not null check (state in ('held','dual_confirm','released','disputed','refunded')),
  prev_txn_id uuid references goal_fund_txn(id),
  commission_pct numeric(5,2) not null default 12,
  confirmed_by_provider boolean not null default false,
  confirmed_by_growth boolean not null default false,
  note text,
  receipt_url text,
  market_pack text not null default 'IL',
  created_at timestamptz not null default now()
);
alter table goal_fund_txn enable row level security;
-- Append-only enforcement: no UPDATE/DELETE for any non-service role.
revoke update, delete on goal_fund_txn from anon, authenticated;

-- ── consent_ledger ──────────────────────────────────────────────────────────
create table consent_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  consent_type text not null check (consent_type in ('terms','data_processing','visibility','escrow','marketing')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  ttl interval,
  market_pack text not null default 'IL',
  created_at timestamptz not null default now()
);
alter table consent_ledger enable row level security;

-- ── audit_log — IMMUTABLE legal paper trail ─────────────────────────────────
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  entity text not null,
  payload jsonb not null default '{}',
  market_pack text not null default 'IL',
  created_at timestamptz not null default now()
);
alter table audit_log enable row level security;
revoke update, delete on audit_log from anon, authenticated;

-- ── events — activation, first-paid, D30, funded-connection, liquidity ─────
create table events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  name text not null,
  props jsonb not null default '{}',
  market_pack text not null default 'IL',
  created_at timestamptz not null default now()
);
alter table events enable row level security;

-- ── RLS policies (baseline) ─────────────────────────────────────────────────
-- Own row full read:
create policy "own profile read" on profiles for select
  using (auth_user_id = auth.uid());
-- Counterpart visibility: mutual matches only (visibility_mode honored):
create policy "match counterpart read" on profiles for select
  using (
    exists (
      select 1 from matches m
      join profiles me on me.auth_user_id = auth.uid()
      where m.state = 'mutual'
        and ((m.provider_id = me.id and m.growth_id = profiles.id)
          or (m.growth_id = me.id and m.provider_id = profiles.id))
    )
  );
create policy "own profile write" on profiles for update
  using (auth_user_id = auth.uid());
create policy "own profile insert" on profiles for insert
  with check (auth_user_id = auth.uid());

-- Messages: only participants of the match.
create policy "match participants read messages" on messages for select
  using (
    exists (
      select 1 from matches m
      join profiles me on me.auth_user_id = auth.uid()
      where m.id = messages.match_id and (m.provider_id = me.id or m.growth_id = me.id)
    )
  );
create policy "sender inserts message" on messages for insert
  with check (
    exists (select 1 from profiles me where me.auth_user_id = auth.uid() and me.id = messages.sender_id)
  );

-- Goal Fund: participants read; provider inserts the opening hold; ledger rows immutable.
create policy "participants read escrow" on goal_fund_txn for select
  using (
    exists (
      select 1 from matches m
      join profiles me on me.auth_user_id = auth.uid()
      where m.id = goal_fund_txn.match_id and (m.provider_id = me.id or m.growth_id = me.id)
    )
  );

-- companion_memory: strictly own rows. intent_level exposure is blocked by column grants in app layer.
create policy "own memory" on companion_memory for all
  using (exists (select 1 from profiles me where me.auth_user_id = auth.uid() and me.id = companion_memory.profile_id));

-- consent: own rows.
create policy "own consents" on consent_ledger for all
  using (exists (select 1 from profiles me where me.auth_user_id = auth.uid() and me.id = consent_ledger.profile_id));

-- events: own inserts.
create policy "own events insert" on events for insert
  with check (exists (select 1 from profiles me where me.auth_user_id = auth.uid() and me.id = events.profile_id));

create index idx_matches_provider on matches(provider_id);
create index idx_matches_growth on matches(growth_id);
create index idx_messages_match on messages(match_id, created_at);
create index idx_gft_match on goal_fund_txn(match_id, created_at);
create index idx_memory_profile on companion_memory(profile_id);
