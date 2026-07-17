# ADVISOR ACCESS RUNBOOK — eran@agendos.app (owner order, 13 Jul 2026)
## ⚠️ STATUS: WAITING (owner, 13 Jul) — invitation goes out ONLY when we are ready. Nothing here executes until Maria's word.
## 🚩 P0 AMENDMENT (GPT + Cowork audits, ADOPTED): LEAST-PRIVILEGE REQUIRED.
Today's operator role carries WRITE powers (activate payments, approve upgrades, publish state,
export/delete artist data). An ADVISOR must get READ-ONLY oversight. Therefore: the §1 SQL below
is NOT to be run as-is for Eran — Claude Code first ships the capability separation
(operator_owner vs operator_advisor, or capability flags: business_read/pii_read/payment_manage/
publish_manage/data_export/data_delete/audit_read). Cowork keeps the grant BLOCKED until it can
prove prohibited mutations fail at UI + RPC + RLS levels for the advisor user. Maria = full owner
capabilities, unchanged.
Owner directive: Eran (serial entrepreneur, developer) gets access to SEE/EXAMINE everything.
Execution discipline: every grant below is an OWNER action from Maria's own accounts, or a
Cowork action on Maria's DIRECT word (prod-DB guardrail). No credentials in chat/files, ever.

## 1) App — OPERATOR role (the in-app "see everything" role)
Mechanism (verified in code + migrations, not guessed):
- `profiles.role = 'operator'` is allowed by migration 003's CHECK constraint.
- `is_operator()` grants RLS oversight READ across profiles/artists/claims/requests/etc.
- `/admin` dashboard requires ROLES.OPERATOR (App.jsx:190).
Steps, in order — do not skip step 1:
1. Eran signs up normally at app.lock.show (any role — e.g., Artist; takes 1 minute).
   ⚠️ The update below only works AFTER his auth user exists.
2. Maria says DIRECTLY to Cowork: "grant operator to eran@agendos.app".
3. Cowork runs in Supabase SQL editor (single statement, idempotent, read back before/after):
   ```sql
   update public.profiles set role = 'operator'
   where id = (select id from auth.users where email = 'eran@agendos.app');
   -- verify: select p.role, u.email from public.profiles p join auth.users u on u.id = p.id
   --         where u.email = 'eran@agendos.app';
   ```
4. Eran signs out/in → lands on /admin (operator home). Done.
Rollback: same statement with `role = 'artist'`.

## 2) GitHub — repo read access (code + docs of record)
Maria (org owner of Hello-MNB) → repo lock.show → Settings → Collaborators →
invite `eran@agendos.app`'s GitHub account with **Read** (raise later only if he'll commit).
Everything governed lives on branch `claude/b4-gigproof-discovery-e7749o` until the release train.

## 3) Supabase — dashboard access (DB, auth, logs)
Maria → supabase.com → project qexfndiyallwqhhzeerd → Settings → Team →
invite eran@agendos.app as **Developer** (full visibility; cannot delete the project).
⚠️ NOT "Owner" — no one else should be able to remove Maria's control.

## 4) Vercel — deployments + preview URLs
Maria → Vercel team → Settings → Members → invite eran@agendos.app as **Member**
(sees deployments, previews, logs; project settings stay Maria's).

## 5) Drive — collaboration folder
Maria shares the B4 folder (1QyQtp-vVcqosKplB_zMmtWNweBH_PaS3) with eran@agendos.app
as **Viewer** (Commenter if he should annotate). Canon mirror is inside it.

## 6) Team surfaces (no account needed — Maria shares the links)
- Version Map artifact (share from the artifact's share menu)
- Flows-per-Entity artifact (same)
- How-to-Release artifact (same)

## Boundaries (protect the project AND the guest)
- Operator role = oversight READ + admin screens. It is NOT a license to run migrations;
  DB structure stays behind Maria's word + the migration discipline (021 frozen, 034+ after backups).
- Nothing in this runbook shares a password, key, or token. All grants are revocable invites
  from Maria's own consoles, and §1's SQL is reversible in one line.
- If Eran needs WRITE access anywhere later — that's a new owner decision, not an escalation
  anyone performs silently.
