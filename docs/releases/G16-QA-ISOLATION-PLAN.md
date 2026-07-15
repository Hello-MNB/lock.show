# G16 — QA/PILOT DATA ISOLATION PLAN (Claude Code + Cowork, 13 Jul)
GOAL: QA writes NEVER pollute pilot signals; test rows identifiable + removable; environment recorded.
1. TAGGING: every QA-created row carries the marker — analytics events get properties.is_qa=true
   (Cowork's harness + my agents set it); app entities (artists/requests/claims) created during QA
   use the reserved prefix 'QA-' in stage_name/requester_name. DEMO mode already writes nothing.
2. EXCLUSION: all funnel/Gate reads (admin cockpit read-model, CFRO checks, Growth Op weekly)
   filter OUT properties->>'is_qa'='true' AND names LIKE 'QA-%'. Binding on the P0.5 cockpit build.
3. CLEANUP: after each QA round Cowork runs the cleanup queries (delete analytics rows where
   is_qa; delete QA-% entities) and records before/after counts as evidence.
4. RECORDING: every QA session logs candidate SHA + environment (preview URL) + window in its
   evidence doc. Preview uses the SAME Supabase project (accepted pilot-stage risk) — isolation is
   BY TAGGING+CLEANUP until a separate staging project is justified post-Gate.
5. CLOSURE: G16 = VERIFIED when Cowork demonstrates one full tagged-QA cycle (write→read-exclusion
   →cleanup) with evidence. Write-path preview gate (G11+G12+G16) then re-evaluates.

## AMENDMENT (14 Jul — child-row isolation protocol; was adopted in SYNC §33 by reference but
## missing from this physical file — GPT RC0 audit Drift-2 corrected here)
6. QA RUN ID: every QA round gets a `qa_run_id` (format `QA-YYYYMMDD-n`). Analytics events carry
   it in properties.qa_run_id (alongside is_qa=true); app entities carry it in the reserved
   name prefix (`QA-YYYYMMDD-n-…`) so every row of a round is traceable to that round.
7. DEDICATED QA ACCOUNT: all QA write-flows run under a dedicated account (email alias
   qa+<run>@lock.show) — never Maria's real account, never a pilot artist's. The account id is
   recorded in the round's evidence doc; Gate reads exclude it by id in addition to tagging.
8. CHILD-ROW GRAPH + FK-SAFE CLEANUP ORDER: QA-created parents have children that must be
   cleaned in dependency order. Deletion order (children first):
   analytics_event → notification → availability_request/booking_request → confirmation_token →
   claim → evidence_item → passport_version → act → artist → organization_member → organization
   (skip any table absent in the live schema; Cowork records the actual executed order).
   Rule: cleanup queries key on qa_run_id / QA-prefix / QA-account-id — never bare date ranges.
9. GATE-READ EXCLUSION PROOF: closure evidence must include one read of the Gate/funnel numbers
   WITH QA rows present and one AFTER cleanup, showing identical non-QA counts (before/after
   comparison per §3, now bound to qa_run_id).
