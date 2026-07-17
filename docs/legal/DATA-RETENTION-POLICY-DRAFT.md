# LOCK — DATA RETENTION & DELETION POLICY

> ## ⚠️ DRAFT-UNSIGNED — FOR COUNSEL REVIEW ONLY (T-43)
> Not published, not binding, not counsel-approved. Feeds the M-4 lawyer pack. Concrete retention durations are deliberately absent — counsel must supply them (spec §15.1.6, placeholder L-8). Sources: spec §15.1.4–15.1.5 + the actual Supabase schema (migrations 001–037).

**Controller:** `[legal entity name — placeholder L-1]`, ח.פ. `[L-2]`, address `[L-3]`. Contact: privacy@lock.show.
**Regimes:** Israeli Privacy Protection Law 5741-1981 incl. Amendment 13 (in force 14 Aug 2025); GDPR for EU visitors. Infrastructure (Supabase, Vercel, Anthropic) stores data in the US — cross-border transfer disclosed in Privacy Policy §10.
**Rule (Privacy §11):** keep personal data only as long as needed for its purpose; then delete, anonymize, or restrict.

## 1. Personal-data inventory (real tables, real columns)

| Table(s) | Personal data held | Purpose (lawful basis, §15.1.3) | Retention trigger |
|---|---|---|---|
| `auth.users` (Supabase) + `profiles` + `person` | email, hashed credentials, full_name/display_name, role | operate the account (performance of service) | account active → until deletion request |
| `artists`, `act` | name, stage_name, city, photo_url, bio/one_line, music_links; draw as **bands/booleans only** (firewall) | deliver the service; private Radar (consent, `privacy-processing`) | while account active / act exists |
| `profile_items`, `evidence_artifacts`, `claims`, `gigs`, `draw_signals`, `producer_confirmations` | evidence content, links, files, AI-extracted claims with method labels; per-Act, non-transferable | evidence pipeline (consent; footprint reads gated on `thirdparty-evidence` scope) | while the user keeps using it (Privacy §11) |
| `passport_versions` (+ publish snapshots, 017) | published Passport snapshots (immutable, append-only) | manage publication, document user actions (consent, `public-publication`) | retained to prove what was published, incl. after unpublish (034) |
| `availability_requests`, `professional_reaction`, `opportunity` | requester name, org, event details, capacity/budget **band**, message | demand-side inbound handling, service improvement | for handling + documentation |
| `consent_records`, `audit_log` | consent/withdrawal events (subject_id, scope, version, timestamp); operator audit rows | **prove legal compliance** — append-only, never flag-flips (§15.1.5) | retained **longer** than account data; duration `[counsel — L-8]` |
| `waitlist_signup` (026) | email, name, role, message, source page, locale | Phase-1 demand capture (consent at signup) | until launch invite or removal request `[counsel]` |
| `notifications`, `organization_membership` (invited_email, invite_token), `share_link`, `passport_view_event`, `analytics_event` | notification payloads, invite emails/tokens, share/view telemetry (first-party; `is_demo` flagged, 037) | operate features; measurement | operational; telemetry windows `[counsel/owner]` |
| Payment records (pilot: manual Bit references + `entitlements`, `subscription`) | payer name, amount, date, reference | legal/accounting obligation | statutory period `[counsel — expected ~7y Israeli tax law]` |
| Backups (Supabase-managed) | copies of the above | disaster recovery | purged on backup/operational cycles (Privacy §11) |

`internal_confidence` and any exact-count working values are DB-only, excluded from every export/display path (firewall, migration 016 + `buildSafePayload`).

## 2. Deletion path (as actually built today)

1. **User request:** Settings → "Request data deletion". Copy shown: irreversible; deletion within **30 business days** per Amendment 13 (`settings.deleteWarning`).
2. **Recorded, not instant:** `requestAccountDeletion(userId)` writes a `consent_records` row, `scope='account-deletion'`, `status='withdrawn'` — an auditable withdrawal event.
3. **Operator executes:** `adminDeleteArtist(artistId, reason)` in the operator console — writes an **audit row before the cascade**, mandatory reason; DB `on delete cascade` chains remove dependent rows (evidence, claims, items, passports).
4. **Survivors (by design):** consent, audit, and accounting records are retained to demonstrate compliance (§15.1.4); backups purge on their own cycle.

## 3. Honest gaps (disclosed to counsel — do not paper over)

- **T-22 purge job UNBUILT (❌, register).** Deletion today is a manual operator action against a recorded request; **no automated job enforces the 30-business-day SLA end-to-end**, and no sweep purges orphaned storage files or expired invite tokens. T-22 (Team C, queued Wave 3) is the fix; until it ships the SLA is met by operator diligence only.
- **Self-serve export OWED.** Right-to-access is currently satisfied by operator-side `adminExportArtist(id)`, not a user-facing "Download my data" (§15.1.4) — required before wider/paid launch.
- **No concrete durations anywhere** — policy is qualitative on purpose until counsel fills L-8 (accounting, audit/consent logs, telemetry, waitlist).
- **DPO/representative question OPEN** (L-7); backup-purge cycle values are Supabase defaults, not verified.

## 4. Counsel asks

Provide: concrete retention durations (L-8) · DPO/representative ruling (L-7) · confirmation the consent/audit-record survival model is a valid Amendment-13/GDPR erasure carve-out · sign-off wording for the 30-business-day SLA given the manual path until T-22 ships.

_Version 0.1 · 17 Jul 2026 · status: DRAFT-UNSIGNED · owner: Team G → Maria → counsel._
