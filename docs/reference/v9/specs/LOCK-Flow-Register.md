# LOCK.SHOW — Complete Flows by Entity (v2 · 9 Aug 2026)
One chapter per entity. Each chapter: the COMPLETE end-to-end flow, step by step, with every gap marked in place.
Labels: ✅ built & verified · ◐ partial · 📋 designed, not built · ⚙ engineering review · 🟨 needs Maria's decision

═══════════════════════════════════════════

# 1 · ARTIST — complete flow, entry to booking

```
1. ENTRY
   Login → Signup / intent ("Advance my artist career")            ✅
2. ONBOARDING
   Act name + one seed link                                        ✅
   → AI SCAN (phases, live find feed, count)                       ✅
   → WHO YOU ARE: family → subtype(s) → capabilities → receipt     ✅ (edit/back at every step)
   → empty-scan → try another source / build manually              ✅
3. RADAR (home)
   Conclusion sentence → ONE next move → Universe → views          ✅
   ├─ Signals view (what to complete/refresh)                      ✅
   ├─ Scene view (lenses + cohort benchmark)                       ✅
   └─ CATEGORY WORKSPACE (full screen per planet)                  ✅
       conclusion → blocking decision (if any) → professional
       groups → per-method actions (confirm/correct/hide/refresh)  ✅
       ⛔ GAP: "published vs newer" cue per fact                    📋 (A0)
4. PASSPORT
   Library: LIVE NOW / IN PROGRESS / BUILD ANOTHER + history       ✅
   ⛔ GAP: open an old version from history (restore=dialog only)   📋
   → Composer (8 sections, vis switches, ◐ ON REQUEST pill)        ✅
   → Exact Preview (real renderer + banner)                        ✅
   → Publish Review (4-kind diff → consequence → publish)          ✅
   ⛔ GAP: version storage backend                                  ⚙
5. SHARE
   Bound view + expiry + revoke + links-sent history               ✅
   ⛔ GAP: link service backend                                     ⚙
6. INBOX (respond)
   Needs reply · Waiting · Done + filters                          ✅
   Booking enquiry → reply sheet → receipt                         ✅
   Access request → approve/decline                                ✅
   Share activity → view                                           ✅
   ⛔ GAP: disclosure (on-request) route                            📋+⚙ (A1)
   ⛔ GAP: rep-on-behalf reply routes (2)                           🟨 A3 CARD
7. MULTI-ACT
   Act sheet → switch / new act → isolated universe                ✅ (isolation tests ⚙)
```
**Artist verdict: flow complete end-to-end. 6 gaps, all marked, 2 blocked on decisions.**

═══════════════════════════════════════════

# 2 · REPRESENTATION — complete flow, onboarding to handoff

```
1. ONBOARDING
   Who you are → your company → invite the team                    ✅
2. ROSTER (home)
   Overview: hero → needs-attention signals → growth → changed     ✅
   ├─ Artists directory (search, rich cards)                       ✅
   │   ⛔ GAP: desktop rows + preview pane at 40+ acts              📋 (desktop pass)
   └─ Access & mandates (scope · territory · expiry · audit)       ✅
       grant → pending → granted/declined → renew → revoke         ✅
3. ARTIST WORKSPACE (per act)
   Overview (story now · next move · opportunities pointer)        ✅
   Pitch Kit (assets w/ version·owner·freshness)                   ✅
   ⛔ GAP: media rail (thumbnails/playable) instead of rows         📋
   Passports (per-recipient states) · Access sheet                 ✅
4. OPPORTUNITIES (deal flow)
   Desk: Active / Waiting / Closed + stage chips                   ✅
   Capture enquiry (WhatsApp → case)                               ✅
   CASE workspace: brief → WHAT THEY NEED (prepare) →
   conversation → approve-to-send → deal agreed                    ✅
   ⛔ GAP: reply-authority per mandate scope                        🟨 A3 CARD
   → HANDOFF: booked → 6-row pack → Send to Production → receipt   ✅
   ⛔ GAP: Received/Opened states need a real signal                ⚙
5. AGENCY INBOX
   Needs reply · Waiting · Done + Buyer/Artist/Access filters      ✅
6. TEAM & SETTINGS (top bar)                                        ✅
```
**Rep verdict: flow complete. 4 gaps — 1 decision (A3), 1 engineering (handoff signal), 2 design (media rail, desktop).**

═══════════════════════════════════════════

# 3 · PRODUCTION — complete flow, event birth to show delivered

```
1. ONBOARDING
   Event type → org details → invite the team                      ✅
2. GROWTH (home)
   Pulse → Movement (Shows/Venues/Formats) → What changed →
   Patterns & footprint                                            ✅
   ⛔ GAP: zero/thin states for a new workspace                     📋
3. EVENTS
   Home: In motion (NEEDS YOUR HAND lead) / Coming up / Done       ✅
   NEW EVENT: 1 basics → 2 vibe → 3 night & slots
   (multi-day + multi-stage)                                       ✅
   EVENT BOARD: stage tabs, time-rail lanes on ALL stages          ✅
   ├─ Slot peek (routine) → Open slot                              ✅
   ├─ SLOT decide: candidates → event-fit → will-it-fit → book     ✅
   └─ Candidate Passport (producer view)                           ✅
4. ADVANCE (per act)
   "3 items still need resolution" → Performance / Movement /
   Place / Materials (versioned assets, stale banner)              ✅
   ⛔ GAP: "See what changed" diff between rider v3→v4              📋+⚙
   Event-state QA switcher (Planning→Complete)                     ✅
5. SHOW DAY (mode)
   Enter → LIVE takeover: NOW → NEXT → ISSUES → schedule →
   contacts → resolve w/ receipt → exit                            ✅
   ⛔ GAP: activation rule (window vs manual)                       ⚙
6. INBOX
   Needs reply · Waiting · Done + type filters, context headers    ✅
   ⛔ GAP: impact lines only where structured data supports         ◐
7. BOOKING CASE (projection of rep's case)                          ✅
8. TEAM & SETTINGS                                                  ✅
```
**Production verdict: flow complete. 4 gaps — 3 engineering-gated, 1 design (Growth empty states).**

═══════════════════════════════════════════

# 4 · RECIPIENT — complete flow, link to enquiry

```
Link opens → ONE policy view (booker/producer/private/prog/
brand/rep) → decision question → positioning → media →
facts in recipient order → one CTA                                 ✅
→ Request sheet → receipt → lands in artist Inbox                  ✅
Dead link: 6 distinct states + recovery each                       ✅
⛔ GAP: "Request fee guidance" CTA (on-request lifecycle)           ⚙ (A1)
```
**Verdict: complete except on-request (engineering-gated).**

# 5 · CONFIRMER — complete flow
```
Magic link → one bounded statement → Yes / Something's wrong /
Wrong person → terminal receipt · already-answered · wrong-person  ✅
```
**Verdict: complete. No gaps.**

# 6 · ADMIN — complete flow
```
Cockpit: Gate → Auto → Signals → P&L → Privacy → EXCEPTIONS
(each exception → bounded actions → receipt → audit)               ✅
⛔ GAP: IA compression to Operations-first                          📋 (after jobs analysis)
```
**Verdict: functional. 1 structural item deferred by ruling.**

═══════════════════════════════════════════

# GAP SUMMARY — everything open, by blocker type
| # | Gap | Entity | Type | Blocked on |
|---|---|---|---|---|
| 1 | Rep-on-behalf reply routes | Artist+Rep | 🟨 | **Maria — A3 card (7 rows)** |
| 2 | Browser Back / deep-link context | all | ⚙ | Claude Code |
| 3 | On-request lifecycle (fee etc.) | Artist+Recipient | ⚙+📋 | request object |
| 4 | Version store (history/restore/superseded open) | Artist | ⚙+📋 | storage |
| 5 | Handoff Received/Opened | Rep | ⚙ | receipt signal |
| 6 | Asset diff v3→v4 | Production | ⚙+📋 | version store |
| 7 | Published-vs-newer cue per fact | Artist | 📋 | none — buildable now |
| 8 | Pitch Kit media rail | Rep | 📋 | none — buildable now |
| 9 | Growth zero/thin states | Production | 📋 | none — buildable now |
| 10 | Show Day activation rule | Production | ⚙ | Claude Code |
| 11 | Desktop rows+pane / panes | Rep | 📋 | desktop pass |
| 12 | Admin Operations-first IA | Admin | 📋 | jobs analysis |

**Buildable now without anyone: #7, #8, #9. Waiting on Maria: #1. Waiting on engineering: #2–6, #10.**
