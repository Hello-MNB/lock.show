# GIGPROOF — BUILD SPEC: Org-Account Model + RADAR
**Status:** BUILD-READY · **For:** Claude Code · **Source:** BUILD-HANDOFF §19–§22.
**Authority:** subordinate to CANON v1.1 + Glossary (SSOT). **Firewall absolute** — no score / % / rank / prediction on any surface; draw = bands + method-labels only. Industry terminology per §22.

## 19 · ORG-FIRST ACCOUNT MODEL  [LOCKED — Option A, Maria 28 Jun]
The Organization is the tenant; a Person belongs via Membership. Every account is an org — a solo booker is an org with one owner-member. Becoming an agency = config change on the SAME org (seats + roster + RADAR), zero migration.

### 19.1 Schema (Postgres/Supabase):
person(id uuid PK = auth.users.id, email, display_name, created_at)
organization(id uuid PK, name not null, slug unique, plan default 'solo' [solo|agency|agency_plus], created_by→person, created_at)
organization_membership(id PK, organization_id→organization ON DELETE CASCADE, person_id→person [null until accept], org_role default 'member' [owner|admin|member], status default 'active' [active|invited|suspended], invited_email, invited_by→person, invite_token unique, joined_at, created_at, UNIQUE(organization_id,person_id))
role_assignment(id PK, organization_id→organization CASCADE, person_id→person, functional_role [booker|agency|artist_manager|artist|operator], authority_scope jsonb, created_at)
active_role_context(person_id PK→person, active_organization_id→organization, updated_at)
artist_access(id PK, organization_id→organization CASCADE, artist_id→artists, access_level default 'manage' [manage|view], consent_record_id→consent_records, status default 'active' [active|revoked], created_at, UNIQUE(organization_id,artist_id))
subscription(id PK, organization_id unique→organization CASCADE, plan default 'solo' [solo|agency|agency_plus], seats_included int default 1, seats_used int default 1, status default 'active' [active|trialing|past_due|canceled], current_period_end, created_at)
artists gains owner_organization_id→organization. ALL domain tables (artists, gigs, evidence_artifacts, claims, draw_signals, passport_versions, availability_requests, producer_confirmations) gain organization_id→organization.

### 19.2 RLS spine:
create function current_org_ids() returns setof uuid language sql stable as $$ select organization_id from organization_membership where person_id=auth.uid() and status='active' $$;
Generic per-table: USING(organization_id in (select current_org_ids())).
Role-gated writes: billing/subscription + org delete + ownership transfer → org_role='owner'; member mgmt (invite/remove/role-change)+roster → org_role in('owner','admin'); operate (claims/passports/requests) → any active member. Artist data: owning org OR org with active artist_access(artist_id). Public Passport: anon → only published passport_versions + visibility='passport-ok' claims.

### 19.3 The 6 org screens (HE labels per §22):
O1 Organization settings (הגדרות הסוכנות/החשבון): name·slug·plan badge·created·owner; שמור·(owner)העבר בעלות·🔴(owner)מחק ארגון(confirm+reason+audit). admin edits name; owner-only transfer/delete.
O2 Members+invite (צוות הסוכנות): seat strip מושבים X/Y; per member name·email·תפקיד(בעלים/מנהל סוכנות/אמרגן)·status(פעיל/הוזמן); הזמן אמרגן לצוות(modal email+role)·שנה תפקיד·הסר(confirm). owner/admin; BLOCK invite if seats_used≥seats_included→upsell.
O3 Context switcher (החלף ארגון): top-bar dropdown of person's orgs(name+role)→sets active_role_context. Hidden if one org.
O4 Accept invite (קבלת הזמנה): from email token: הוזמנת להצטרף לארגון [שם] כ[תפקיד]→הצטרף (membership active; if no account→signup first then join). Guard token valid+email match.
O5 Upgrade plan (שדרוג לסוכנות בוקינג): current plan + what agency unlocks(מושבים·רוסטר·RADAR); שדרג לסוכנות(manual pilot→pending→founder confirms)·הוסף מושבים. owner-only.
O6 Billing/seats (חיוב ומושבים): plan·seats included/used·period end·payment status(manual); נהל מושבים·עדכן תשלום(manual, no Stripe). owner-only.

### 19.4 Booker→Agency = config change (NOT migration): solo booker=organization{plan:solo}+1 owner-seat, roster off, RADAR off. Grow: O5 upgrade→plan:agency→seats_included raises+roster+RADAR+AG-screens unlock→O2 invite members→AG2 add artists(artist_access). SAME organization_id throughout — all passports/requests/history stay. No new account, no data move.

### 19.5 Signup reframing: on signup auto-create person + personal organization(plan:solo, them owner) + organization_membership + role_assignment. S2 role-select = "what do you do?"→אמן/אמרגן/מפיק (sets functional_role+landing). "סוכנות" is NOT an option — agency is a booker-org that upgraded+added seats. artist_manager folds into agency growth. Everyone starts solo org; agency is a grown state.

## 20 · RADAR (missing feature) [LOCKED arch · copy DRAFT]
Canon: descriptive + evidence-based only — NO score/%/prediction/cross-artist rank.
### 20.1 Inputs: Roster readiness per artist (rules §17.2, no AI): passport_status·evidence_freshness·readiness_band(bounded)·strongest method_label (from passport_versions+claims+draw_signals via artist_access). Incoming demand (real, consented, no scraping): availability_requests(event_type·location·capacity_band·created_at·status)+reaction signals(action_ladder rungs, rejection chips).
### 20.2 Cross-logic (deterministic, R1–R8). Hero: R1 stale-evidence ∩ matching inbound demand→explained match, never a number: "אמן [X] מתאים לביקוש [event_type/אזור] שנכנס — בנד-המשיכה לא עודכן 90 יום → רענן ראיה". Each match states evidence basis+method-label+date; output=bounded status+action, never score/percentile/prediction.
### 20.3 Feeding link (the missing piece): radar_signal materialization (view/table) keyed (organization_id, artist_id, rule_id, computed_at), recomputed on: passport_versions insert/update · claims/draw_signals change · new availability_request matching a roster artist (demand_match §17.2) · rejection chip/producer_confirmation event. So "ready Passport"=published passport_version with passport-ok claims→eligible for R1/R4→signal card in RADAR. Closes the audit gap (ready passport had no consumer).
### 20.4 Screen AG9: header "RADAR · מודיעין רוסטר וביקוש"→signal feed(cards: signal·evidence basis·method-label·date·ONE action)→screen-level "טפל בסיגנל הבא". Filters artist·signal-type·freshness (triage only, NO ranking sort). Card actions: רענן ראיות/בקש ראיה/טפל בסיגנל/פרסם.
### 20.5 Success metrics: % signals acted-on · demand-match→passport-sent/refresh rate · roster-readiness trend · time-to-action on inbound demand. No vanity, no ranking.

## 22 · TERMINOLOGY LOCK: organization never shown as "ארגון"→display by plan: הסוכנות / החשבון שלי. O1=הגדרות הסוכנות/החשבון. O2=צוות הסוכנות; org_role displays owner=בעלים, admin=מנהל סוכנות, member=אמרגן/סוכן בוקינג. seats=מושבי צוות; invite=הזמן אמרגן לצוות. O5=שדרוג לסוכנות בוקינג (unlocks רוסטר·מושבי צוות·RADAR). roster=רוסטר; artists=אמנים; on roster=אמן ברוסטר. RADAR demand=בקשות זמינות. Locked verbatim: משיכה·בנד-משיכה·תווית-שיטה·אישר מפיק·דרכון הופעות/הדרכון(not פספורט)·מראה·ליין-אפ·סגירת תאריך·רוסטר·אמרגן/מפיק/סוכנות. EN anchor: live music booking·roster·A&R·draw/draw band·availability(hold) request·settlement·lineup·method-label·EPK→Passport·Mirror. Avoid generic: users/items/profile/dashboard/score/listing. Firewall inside slang: bands never numbers; תווית-שיטה replaces bare ✓; no אחוז/ציון/דירוג.

## 23 · BUILD ORDER (each step: build-green + QC gate before next):
Step 1 — Schema+RLS (§19.1-2): create org-first tables + organization_id on all domain tables + current_org_ids() + RLS. Versioned migration. build-green: migration applies, tables+policies exist. QC: RLS smoke test — two orgs; member of A cannot read/write B; owner-only writes reject admins/members; no cross-tenant leak.
Step 2 — 6 org screens + signup reframing (§19.3,19.5): O1–O6; signup auto-creates person+personal solo org+owner membership+functional role (S2=אמן/אמרגן/מפיק, no agency option). build-green: signup creates solo org; invite→accept→member appears; context switch sets active org. QC: seat limit blocks invite beyond seats_included; owner-only guards (confirm+reason+audit); HE labels §22.
Step 3 — RADAR + feeding (§20): radar_signal materialization keyed (organization_id,artist_id,rule_id,computed_at), recompute triggers, R1–R8 rules, AG9 screen. build-green: publishing a Passport + matching inbound בקשת זמינות produces a RADAR card with explained match. QC: FIREWALL — no score/%/rank/prediction; every card=bounded status+evidence basis+method-label+date; triage-only sort; $0 AI.
Step 4 — Producer+Operator (§21): verify producer confirmation→upgrades claim method-label to אישר מפיק (+revoke); build OP3(consent viewer)·OP4(SEC-01 status)·OP12(export/delete) before any real data. build-green: producer reply upgrades label; operator views consent/SEC-01/export-delete. QC: destructive actions require confirm+reason+audit row.
