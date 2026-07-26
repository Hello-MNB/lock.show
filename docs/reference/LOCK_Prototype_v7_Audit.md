# LOCK Prototype v7 — Complete UX/UI, User-Flow and Design-System Audit

**Artifact audited:** `LOCK Prototype v7 (standalone).html`  
**Audit date:** 23 July 2026  
**Scope:** all 39 numbered prototype states; all reachable role flows; interaction logic; information architecture; microcopy; accessibility structure; responsive layout rules expressed in the source; design-system relevance and implementation alignment.

## 0. Corrected Product Principles

| Principle | Canonical product rule | UX/UI consequence |
|---|---|---|
| Artist sovereignty | The artist can see all information about their own act that the system holds, including sources, uncertainty, conflicts, stale items, restricted fields and recipient previews | Never hide artist-owned information from the artist because it is unsuitable for another recipient. Recipient visibility controls affect shared outputs only |
| RADAR primacy | The RADAR is the artist’s core working environment and the most important product interface | The RADAR receives the richest information architecture, strongest navigation, source controls, review states and next actions. It must not be reduced to a decorative six-ring dashboard |
| PASSPORT purpose | The PASSPORT sells and explains the artist to external entities | Lead with media, relevance, live context, trust and a clear next action. Evidence supports the story; it must not visually dominate the story |
| One governed truth | RADAR and PASSPORT are two renderings of one governed artist data spine | Do not duplicate or manually rewrite artist facts per view. Change order, emphasis, explanation and depth by recipient |
| Recipient adaptation | Booker, producer, representative and private/corporate client views use a consistent architecture with recipient-specific ordering and messaging | Tailoring is a presentation rule, not a reason to arbitrarily suppress complete professional information. Genuine sensitive data still requires explicit visibility controls |
| Human-readable quantities | Internal value bands may support governance, privacy or normalization, but “bands” are not an attractive human-facing presentation | Display a clear value, range, visual scale, comparison context or plain-language label. Keep the band code in metadata/tooltips, not as the primary content |
| Visual hierarchy | Media and meaning lead; technical provenance follows through progressive disclosure | Source, date, freshness and evidence limits remain accessible without turning the main experience into an audit table |

## 1. Bottom Line

LOCK v7 contains a strong product idea and a coherent dark visual direction, but it is not yet a complete product prototype. The index claims 39 screens, while the artifact actually contains **21 base surfaces, 10 overlays or state variants, 5 development/testing states, 2 exact duplicate presets, and 1 internal design-system gallery**.

The highest-risk issues are not visual polish:

1. A public Passport recipient can switch freely between Booker, Producer, Private Event and Representative presentations, bypassing the owner’s intended message, order and any genuinely sensitive disclosure rules.
2. Representative permissions are logically broken: a declined access request is treated as granted, and every roster artist opens largely the same SHIDAPU content.
3. “Mapped information” is presented with progress bars, glowing percentages and status words such as “Confirmed” and “Developing,” creating the prohibited impression of artist readiness, quality or rank.
4. Multiple controls look functional but do nothing; several forms submit without required data or retain only a fraction of what was entered.
5. The RADAR is visually treated as a coverage dashboard rather than the full artist intelligence workspace, while the Passport lacks the persuasive, media-led recipient experience required to sell the artist.

## 2. Audit Confidence and Constraint

| Audit layer | Status | Evidence |
|---|---|---|
| Screen/state inventory | 🟢 Confirmed | All 39 presets and their state mutations inspected |
| Navigation and interaction logic | 🟢 Confirmed | All routes, click handlers, state variables and dead controls inspected |
| User-flow completeness | 🟢 Confirmed | Entry, transition, persistence and completion states mapped |
| Microcopy and information architecture | 🟢 Confirmed | All user-facing strings and section structures inspected |
| Accessibility structure | 🟢 Confirmed | Semantic elements, labels, dialogs, menus, tabs and keyboard handlers counted |
| Visual system expressed in code | 🟢 Confirmed | Tokens, inline styles, components, typography, spacing and status colors inspected |
| Pixel-level rendered QA | 🟡 Not completed | The audit environment could not open the local standalone file in its cloud preview; findings do not claim screenshot-level visual validation |

## 3. Prototype Inventory Audit

| Prototype claim | Actual implementation | Audit decision |
|---|---:|---|
| 39 screens and states | 39 numbered presets | Accurate only as an index count |
| Unique base product surfaces | 21 | Treat these as the real screen inventory |
| Overlays/state variants | 10 | Keep as component states, not separate screens |
| Development/testing states | 5 | Move to QA harness; do not count as product screens |
| Exact duplicate presets | 2 pairs | Merge/remove |
| Internal component gallery | 1 | Keep outside the product route tree |
| Numbered presets that do not immediately show the advertised state | 1 | Screen 25 requires another click before the error appears |
| Buttons in artifact | 109 | High raw-control count for a mobile-first prototype |
| Buttons with connected actions | 97 | Twelve are inert; six inert controls appear in real product surfaces |
| Inputs | 14 | None use semantic `<label>` elements |
| Textareas | 5 | Several are uncontrolled or lack save state |
| Forms | 0 | Submission, validation and keyboard behavior are not modeled semantically |
| Headings | 0 | Visual headings are `<div>` elements; document structure is absent |
| Dialogs | 4 | None declares `aria-modal`; no focus trap or focus return |
| Menus | 2 | Neither uses `menuitem` semantics |
| Tab lists | 1 | Contains buttons but no `tab`, selection or panel semantics |
| Page language | Missing | No `lang` attribute |

## 4. P0 Findings — Must Be Resolved Before Further UI Polish

| ID | Confirmed finding | Business/risk impact | Required correction |
|---|---|---|---|
| P0-01 | Public Passport viewers can change their own role and open all four role presentations | The artist loses control of the intended narrative; genuinely sensitive fields may be exposed; recipient adaptation becomes cosmetic | A shared link opens the owner-selected recipient presentation. The artist can preview every view. Shared tabs expose the full approved professional story for that recipient, while only explicitly sensitive fields require permission controls |
| P0-02 | `repGranted` is true for every state except `pending`; therefore `declined` is rendered as granted | Direct authorization and trust failure | Model explicit states: `requested`, `pending_artist`, `granted`, `declined`, `revoked`, `expired`; render actions only for `granted` |
| P0-03 | Roster entries for SHIGAON and Dune Choir open a largely static SHIDAPU action panel | Wrong-entity decisions, cross-artist data contamination | Every route must carry `artist_id`; all content, permissions and actions must resolve from that artist |
| P0-04 | Coverage percentages are labelled and animated like readiness/quality scores | Violates the current no-scoring rule, misleads artists and weakens the RADAR’s value as an intelligence interface | Make coverage a quiet secondary RADAR utility called `Mapped information`; remove glow, achievement language, targets and “Confirmed/Developing” states |
| P0-05 | Public discovery is labelled “VERIFIED FINDS”; colored platform logos function as verification badges | Overstates what a public link or platform match establishes | Use `Source match`, `Connected account`, `Artist-confirmed`, `Document-supported` and `Counterparty-confirmed` as separate method statuses |
| P0-06 | Add Event retains only the event name; date, location and slots are not persisted, and the form submits empty | Production flow cannot create a reliable event entity | Use a structured event model with required fields, validation and a review step |
| P0-07 | Anonymous availability requests collect a preferred channel but no contact details | The artist cannot contact the requester | Collect name plus the destination required by the chosen channel; verify/confirm before submission |
| P0-08 | Signed-out deep-link copy promises return to the intended screen, but login always routes to intent selection | Broken conversion and trust at high-intent entry | Preserve `return_to`, complete authentication, then restore the exact authorized surface |
| P0-09 | Real product controls are inert: Offer Edit, Add Link/File, five Rep Onboarding choices and the second candidate’s Ask action | Prototype presents false completion and cannot validate usability | Connect every visible control or render it visibly disabled with a clear scope label |
| P0-10 | Passport content contradicts the governed information model and combines unrelated signal families under “Artist Assets” | Weak decision quality, poor artist presentation and evidence misuse | Make PASSPORT media-led and persuasive while rendering approved information from all 18 governed categories. Keep streaming, audience, community, event economics, operational readiness and legal data semantically separate |
| P0-11 | Representative “Update Passport” jumps into the artist editor and changes to artist navigation | Role and authority context is lost | Open an artist-scoped representative workspace with permission-aware edit/submit-for-approval behavior |
| P0-12 | The source confirmer treats “No” and “Can’t assess” like a successful confirmation | Evidence integrity failure | Store each response distinctly and never strengthen a claim from rejection, uncertainty or inability to assess |

## 5. Screen-by-Screen Audit — All 39 Numbered States

### Status key

| Decision | Meaning |
|---|---|
| **Keep** | Valid product surface; targeted improvements required |
| **Redesign** | Product need is valid, but current structure cannot support the intended job |
| **Merge** | State belongs inside another screen/component and should not be counted separately |
| **QA-only** | Valid test state, not a product screen |
| **Remove/park** | Not relevant to the current build or actively misleading |

| # | Indexed screen/state | Decision | Confirmed UX/UI and flow findings | Required redesign and microcopy direction | Priority |
|---:|---|---|---|---|---|
| 1 | Login | **Redesign** | Email/password and Google both bypass authentication; no validation, error, loading, show-password or account state; Forgot Password is a dead anchor; language switch is plain text; labels are placeholders only | Separate **Sign in** and **Create account**. Add password visibility, validation, reset flow, OAuth callback, email verification and return-to-deep-link. Replace “Continue” with **Sign in**. Replace “Start your universe” with the approved public acquisition phrase | P0 |
| 2 | Signup / intent | **Keep, revise** | Three clear goals, but they mix user identity with one current task; no option for multi-role users; wording assumes knowledge of LOCK’s value; all paths immediately become different workspaces | Ask **What do you want to do first?** Then allow roles/workspaces after account creation. Suggested cards: **Build my artist profile**, **Manage artists**, **Plan an event or lineup**. Add “You can add another workspace later” | P1 |
| 3 | Workspace hub menu | **Merge** | Useful role switcher, but admin is exposed to a demo user; account count says three workspaces while hub lists four; emoji violates the stated icon rule; buyers are explained in technical copy | Keep as one account/workspace switcher component. Gate Admin by role. Replace emoji with system icons. Remove “Buyers arrive by link…” from the menu; it is internal architecture copy | P1 |
| 4 | Artist onboarding | **Redesign** | CTA is always enabled; act name, link and genre are not validated as a meaningful set; no duplicate/entity-match review; no “Other” detail; privacy assurance lacks a policy link; one link is presented as enough without showing what happens when multiple acts match | Use three steps: **Name or act**, **Starting source**, **Confirm the right profile**. CTA: **Find my profiles**. Add entity-match review, act type, individual/team format and “None of these are mine.” Replace technical privacy copy with **Nothing is shared until you choose a view and publish it** | P0 |
| 5 | AI scan / first result | **Redesign** | Fixed six-platform scan is disconnected from the source entered; “VERIFIED FINDS” overclaims public matches; the legacy-handle review row is not clickable; no cancel/background option; no source/freshness/method explanation | Rename to **Finding possible matches** and results to **Possible source matches**. Let the artist confirm, reject or connect each source. Add **Continue in background**. Do not use a verification badge until ownership or bounded confirmation exists | P0 |
| 6 | Radar universe | **Redesign as the product core** | Strong six-planet concept, but the screen behaves like a decorative coverage scorecard. Glowing percentages and “Confirmed/Developing/Needs Review/Found” conflate information coverage, evidence state and artist readiness; the interface does not surface the full artist information universe, cross-category relationships, recent changes or actionable intelligence | Keep six planets as navigation, not as the final information display. Add a private **Artist intelligence home** with searchable categories, recent changes, source health, conflicts, opportunities, recipient previews and contextual next actions. Coverage becomes a quiet secondary status with **mapped / review / stale / not found** counts. The artist can open every held fact and its provenance | P0 |
| 7 | Planet inspector | **Redesign as a full RADAR workspace** | Bottom sheet tries to show sources, conclusion, categories, conflict, next action and coverage at once; sources are visually “verified” through colored logos; dialog lacks modal/focus behavior; category rows do not open detail; Add Link/File is inert | Convert to a full planet workspace with **Overview · Categories · Sources · Opportunities · Sharing**. Each category opens an information canvas with facts, media, dates, conflicts, freshness and source drawer. Keep a compact sheet only as a quick preview. CTA: **Review this category** | P0 |
| 8 | Inspector — next move | **Merge with 7** | This is the same component as Screen 7 with another selected planet; both already contain a next move; counted as a new screen without a distinct job | Treat “next move” as a reusable card inside every private category page. Copy: **Recommended next step** + one outcome + estimated effort, without growth-score promises | P2 |
| 9 | Passport edit + preview | **Redesign completely** | Highest-complexity screen. It exposes a “readiness” bar; groups unrelated signals under Artist Assets; shows only four generic blocks rather than drawing from all six planets/18 categories; visibility is treated as global suppression; only the one-line fit is editable; no source drawer, freshness, conflicts, version or save state; Share remains active after unpublish; Tech Rider state is not reconciled with public producer copy | Build one governed **PASSPORT Composer** beside the private RADAR—not inside it. Persistent header: recipient view, draft/published state and last updated. The artist can inspect all source information while composing; controls only determine the external rendering. Use the same tab family across recipients, reorder emphasis and copy per entity, and provide live preview. Lead with hero, media and recipient relevance; move provenance into drawers. Remove the readiness bar entirely from PASSPORT | P0 |
| 10 | Share Passport | **Redesign** | Recipient selection changes only message text; the destination link is not proven to carry the intended presentation; copy/share actions only display toasts; no expiry, revoke, named recipient, access level, link history, tracking choice or publication check | Recipient choice selects a governed PASSPORT presentation and message. Show **You are sharing: Booker view** plus a visual preview and included-tab summary. Add optional recipient name, expiry, forwarding policy and link management. The artist always retains access to every view and underlying fact | P0 |
| 11 | Requests / reactions | **Split** | One feed mixes view analytics, availability enquiries, representative access requests and stale shares. “Opened twice” introduces tracking/compliance implications. A single reply state is reused; no thread, delivery, channel confirmation or assignment | Split into **Enquiries**, **Access requests** and **Share activity**. Use a detail thread for each enquiry. Replace “After you shared” with **Inbox**. Do not show exact open behavior until tracking consent and definitions are approved | P0 |
| 12 | Representative onboarding | **Redesign completely** | Five selection controls are inert; selected states are decorative; no representative identity, organization, roster import, artist invite, authority scope or team setup is captured | Ask for **Your role**, **Organization/team**, **How many artists**, then **Invite or request access to an artist**. Copy: **Artists approve the access you request. You can only view or edit what they allow** | P0 |
| 13 | Roster universe | **Keep, expand** | Good next-action list, but no search/filter, add artist, team assignment, permission filter or source of status. Bulk Share risks sharing different artists without recipient review. All artist routes do not preserve correct artist data | Add filters for **Needs action / Waiting / Ready to share / Stale** and search. Replace **Share all ready** with **Prepare 2 shares**, then review recipient and view per artist. Every row routes by `artist_id` | P0 |
| 14 | Artist action panel | **Redesign completely** | Declined access is treated as granted; different roster artists render static SHIDAPU actions; editor navigation loses representative context; “opened yesterday—reply within 24h” lacks source and thread; no permission/audit view | Header must show artist, current permission scope and acting organization. Tabs: **Overview · Information · Shared views · Enquiries · Access**. Actions are permission-gated. Use **View enquiry** rather than a generic urgency statement | P0 |
| 15 | Production onboarding | **Redesign** | All three choices route to the same static lineup without retaining selection; recurring club, festival office and private client are materially different roles; no organization/team or event objective captured | Ask **What are you planning?** followed by structured event setup. Private/corporate client should use a simpler enquiry flow, not the production cockpit. Save the selected event type and tailor required fields | P1 |
| 16 | Lineup cockpit | **Redesign** | Static single event; no event switcher, edit, team, status or timeline. Candidate cards lack availability, source, budget, technical blockers and next-owner. “2 candidates” has no evaluation contract. Confirmed/empty slots cannot be managed fully | Make this the **Event workspace** with tabs: **Overview · Lineup · Candidates · Production · Enquiries**. Each slot shows role, time, duration, requirements, candidate status and owner. Add event switcher and edit action | P0 |
| 17 | Event slot detail | **Redesign completely** | Candidate claims have no sources/dates/limitations; only first candidate actions work; “Pin” can occur without confirmed availability; comparison structure encourages unsupported winner selection; no link to the artist’s event-specific view | Use a common evidence matrix for the slot, but never a total score. Required rows: format, duration, comparable context, technical needs, availability, fee context, missing information. Actions: **Open event-specific view**, **Request missing information**, **Shortlist**, **Confirm with artist** | P0 |
| 18 | Public Passport | **Redesign completely as the artist-selling surface** | Highest disclosure and conversion risk. Viewer can switch role; structures vary; there is no dominant featured media experience; quantitative bands and evidence fragments read like a technical report; sources/dates/limitations are either absent or visually compete with the artist story; claims such as 800+ crowd and testimonials are not visibly bounded; CTA is identical for all roles | One link opens one owner-selected recipient presentation. Use a consistent tab family—**Overview · Media · Live · Audience · Offer · Details**—with recipient-specific order, headlines, emphasis and CTA. Show the full approved professional narrative, not a thin subset. Lead with large media, booking relevance and human-readable evidence. Keep source method/date/limits accessible through compact labels and drawers. Never present internal band codes as the main visual value | P0 |
| 19 | Buyer request sheet | **Redesign** | Missing requester name, actual contact value, location, time, budget context and privacy consent. “In-app message” is impossible for a no-account recipient. Form submits without required fields or validation | Minimum viable fields: name, date/flexibility, location, event type, contact method + destination, message. Add context-specific fields progressively. CTA: **Send availability enquiry**. Success must show channel, next step and reference | P0 |
| 20 | Confirm / correct / decline | **Remove from active scope or complete properly** | Screen says “FROZEN ENTITY” and “not part of current build”—technical scope language exposed to users. No actual profile verification. Blank corrections can be submitted. “No” and “Can’t assess” resolve as successful help | If frozen, remove from production route and DS. If retained, model claim, confirmer identity, relationship/scope, precise response, correction, consent, expiry and audit record. Replace “strengthens proof” with **Your response will be recorded with this exact claim** | P0 |
| 21 | Admin cockpit | **Redesign** | Six static metric cards with no period, denominator, owner, SLA or drill-down. “Nothing burning” is unprofessional. Publish queue, claim review and incidents require workflows, not only counts. Admin is reachable from demo hub | Build task queues: **Publication review**, **Evidence conflicts**, **Access incidents**, **Cost/usage**, **Data quality**. Every metric needs definition, period, threshold and action. Copy: **No open incidents** | P1 |
| 22 | Empty scan state | **Keep as state, revise** | Supportive tone, but Add Source immediately enters the universe without validating or saving the entered source. Empty scan appears only after the scan timer; no manual-build alternative or contact/support path | Validate the source, display match/error, then continue. Add **Build manually** and **Try another source**. Copy: **We did not find a reliable match yet. Add a profile, release, set or website to continue** | P1 |
| 23 | Pending consent state | **Merge with 13** | Preset is identical to the default roster, where the pending-consent artist is already visible. It does not show a distinct lifecycle or detail state | Keep `Pending consent` as a roster filter/status. Add request date, requested scope, expiry and **View request**. Do not count as a separate screen | P2 |
| 24 | Stale request state | **Merge with 11** | Preset is identical to the default Requests screen, which already includes the stale request. The “refresh and share” action loses the original recipient context | Keep stale as an enquiry/share state. Preserve recipient, shared view and original thread. Copy: **This event date has passed. Archive it or send a current view for a new date** | P2 |
| 25 | Save failed / retry | **QA-only; fix preset** | The numbered state does not show a save error until the user performs another action. Therefore the index does not actually open the state it claims to demonstrate | In QA harness, preset should immediately render error. Product behavior: keep entered data locally, show **We couldn’t save this change. Your previous version is still active** + **Try again** | P1 |
| 26 | Multi-Act switch / new Act | **Redesign** | Switch works, but New Act only shows a toast; no entity is created. No rename, archive, owner, members, act type, duplicate check or separation confirmation | New Act opens a short creation flow and returns with an empty governed universe. Add **Manage acts**. Copy: **Create a separate act** and explain that members and sources are not copied unless selected | P0 |
| 27 | Unpublished / dead link | **Keep, repair** | Warm privacy-preserving state is good, but “Ask for current Passport” notifies an artist without collecting requester identity/channel. No verified public contact or safe fallback | If a public contact is allowed, offer **Contact the artist**. Otherwise collect name/contact before requesting an updated link. Copy: **This shared view is no longer available** | P1 |
| 28 | Already answered | **Keep as confirmer state** | Clear terminal message, but no safe close/return, claim reference, privacy link or correction path if the confirmer made a mistake | Add **Close** and, within an allowed window, **Report a mistake**. Show only a minimal claim reference without exposing artist-private data | P2 |
| 29 | Wrong person | **Keep as confirmer state** | Clear terminal copy, but no distinction between wrong recipient and no longer authorized; no report-abuse path | Offer **This was sent to the wrong person** and **Report misuse** as separate outcomes. Confirm no further contact for this request | P2 |
| 30 | Account & plan | **Redesign** | Email and WhatsApp are editable without verification; no password/security, language, timezone, notification settings, privacy, export/delete, role membership or workspace permissions. “Plan & billing” routes to the same page. Workspace count conflicts with hub | Split **Profile**, **Security**, **Notifications**, **Privacy & data**, **Workspaces & access**, **Plan & billing**. Verify changed email/phone. Add data export and account deletion controls | P0 |
| 31 | Pending access — both sides | **Redesign as end-to-end flow** | Only representative-side waiting panel is shown. The artist-side approval is hidden inside the mixed Requests feed. No request initiation, scope, expiry, notification, revoke or audit trail | Create two linked surfaces: rep request status and artist approval detail. Artist sees requested permissions individually. Rep sees granted/declined/expired outcome. Both sides see scope and date | P0 |
| 32 | Act switched — N.Söf | **Merge with 6** | Valid state example, not a unique screen. It proves switching state but not data separation, because only hard-coded values change | Keep as test fixture. Add a visible act-context breadcrumb and verify all editor, share, request and analytics data remain isolated by `act_id` | P1 |
| 33 | Deep-link entries | **QA-only** | This is a routing test menu, not a user screen. It exposes technical URL examples. Signed-out-return promise is broken. Missing revoked, expired, unauthorized and deleted-entity routes | Move to automated routing tests. Required cases: valid public view, unpublished, revoked, expired, unauthorized, signed-out return, deleted entity, invalid token and unknown route | P0 |
| 34 | Reduced motion | **QA-only** | No product setting; CSS disables every animation, including potentially meaningful loading feedback. Visually almost identical to Radar and counted as a screen | Test under OS preference and account preference. Remove decorative motion while preserving non-motion state indicators. Do not count as a product screen | P1 |
| 35 | Keyboard navigation | **QA-only** | Native planet buttons support Tab/Enter, but the hint overstates whole-product accessibility. Sheets have no focus trap/return; drag handles are not keyboard focusable; tab semantics are absent | Add automated keyboard acceptance criteria. Dialog open must move focus; Tab stays within modal; Escape closes; focus returns to trigger. Use real tabs and labels | P0 |
| 36 | Demo-mode hub | **Remove duplicate** | Exact same preset as Screen 3; both already show Demo labels | Keep a single hub screen. Demo mode should be an environment banner/fixture, not a duplicate state | P3 |
| 37 | Add event sheet | **Redesign completely** | Only event name is controlled; date, location and slots are discarded. No required fields, timezone, privacy, team, budget, production contact or structured slot model. Empty event submits as “Untitled event” | Use a full-page mobile flow: **Event basics → Schedule/slots → Requirements → Team/sharing → Review**. Save draft after each step. CTA: **Create draft event** | P0 |
| 38 | Notifications | **Merge/redefine** | All four items are recommendations, not notifications. No read/unread, dismiss, snooze, priority or settings. Opening an item does not change the count | Rename to **Recommendations** and place it in private workspaces, or build a true Notification Center that also includes enquiries/access/system events. Avoid duplicating the Radar next-step card | P1 |
| 39 | Component gallery | **Remove from product; rebuild as canonical DS** | Claims all components are token-driven, but real screens use raw inline elements and hard-coded values. It includes unused/irrelevant components and seven skins; missing the governed evidence and disclosure components the product actually needs | Maintain the design system as a separate development asset with implemented components, states, API, accessibility and usage rules. The product must consume those components instead of duplicating styles | P0 |

## 6. User-Flow Audit

| Flow | Current path | Completion status | Confirmed breakpoints | Required completion contract | Priority |
|---|---|---|---|---|---|
| Authentication and account recovery | 1 → 2 | 🔴 Broken | No real authentication, forgot-password flow, email verification, errors or signed-out return | User can create/sign in, recover access, verify identity and resume the exact authorized deep link | P0 |
| Artist first run | 2 → 4 → 5/22 → 6 | 🟡 Partial | No entity resolution, source confirmation, scan review or reliable empty-state save | Correct act is resolved; every source is accepted/rejected; user lands on a truthful private universe | P0 |
| Source review and information maintenance | 6 → 7/8 | 🔴 Incomplete | No category detail pages, source drawer, upload/connect flow, freshness review, conflicts queue or field-level governance | All 18 categories can be reviewed and edited with source, method, date, visibility and limitation | P0 |
| Multi-act management | 6 → 26/32 | 🔴 Incomplete | New act does not create; no ownership/members/archive; isolation not proven across all screens | Create, switch, edit and archive acts with guaranteed source and permission separation | P0 |
| Recipient-view composition and publishing | 9 → 18 | 🔴 Broken | Editor is not category-complete; global visibility controls; role leakage; no version/save/publication contract | One governed data spine renders permitted, ordered content per recipient; draft/publish/version/revoke are explicit | P0 |
| Share and link management | 9 → 10 → 18 | 🔴 Broken | Recipient choice changes message only; no access policy, expiry, publication check, actual copy/share contract or link history | Link is bound to view policy, publication version and optional expiry; owner can inspect and revoke it | P0 |
| Share activity and enquiry response | 10 → 11 | 🔴 Incomplete | Mixed feed; tracking undefined; no message thread/delivery/assignment/context preservation | Enquiries, access requests and share activity are separated; replies remain in a traceable thread | P0 |
| Representative access lifecycle | 12 → 13/14/31 → artist approval in 11 | 🔴 Broken | Onboarding inputs inert; request initiation absent; declined=granted; scope/audit/revoke missing; wrong artist data | Scoped request, artist approval, granted work, change approval, revoke and audit are linked end-to-end | P0 |
| Representative roster operations | 13 → 14 → 9/10/11 | 🔴 Broken | Artist identity and representative context are lost; bulk share unsafe | Every action stays scoped to the selected artist, acting organization and granted permission | P0 |
| Event creation and artist invitation | 15 → 16 → 37 | 🔴 Broken | Onboarding selection discarded; event fields discarded; invite link is a toast only | Structured event persists; team and context are defined; invitation link carries correct event context | P0 |
| Candidate/slot evaluation | 16 → 17 | 🔴 Incomplete | Unsupported claims, incomplete controls, no event-specific views or confirmed availability | Common criteria, bounded evidence, missing-information requests, shortlist and confirmation states | P0 |
| Recipient availability enquiry | 18 → 19 → 18 success | 🔴 Broken | No contact destination; no validation; CTA identical across personas | Recipient can send a deliverable enquiry; artist sees source, context and reply channel | P0 |
| Unpublished/revoked-view recovery | 27 | 🟡 Partial | Updated-link request cannot identify requester; revoked/expired/unauthorized cases missing | Privacy-safe state with an actionable permitted contact path and distinct route outcomes | P1 |
| Bounded source confirmation | 20 → 28/29 | 🔴 Parked and logically incorrect | Frozen scope note exposed; identity verification absent; rejection and uncertainty handled as positive | Either remove from beta or complete precise claim/identity/response/audit lifecycle | P0 |
| Account, permissions and plan | 3 → 30 | 🔴 Incomplete | Security/privacy/workspace controls absent; account data unverified; counts inconsistent | User can manage identity, security, notifications, data rights, roles, billing and workspace memberships | P0 |
| Admin operations | 3 → 21 | 🔴 Incomplete | Counts only; no queues, definitions, permissions or drill-down | Role-gated operational queues with owners, SLAs, audit and action states | P1 |

## 7. Most Complicated Screens and How to Simplify Them

| Screen | Complexity diagnosis | Why it is difficult now | Simplified target architecture |
|---|---|---|---|
| 9 — Passport editor | **Critical overload** | Composition, coverage, editing, visibility, preview, publication and sharing coexist in one long feed | Header with view/recipient/status → category tabs → one section editor at a time → source/visibility drawer → persistent Preview and Publish actions |
| 18 — Public Passport | **Critical disclosure and IA failure** | Four different products are embedded behind viewer-controlled role tabs | One recipient policy per link; shared information tabs with recipient-specific order and visibility; contextual CTA |
| 11 — Requests | **Mixed jobs** | Enquiries, access approvals, analytics and stale shares use the same card pattern | Inbox landing with type filters → dedicated detail/thread screen per item |
| 6–8 — Radar + inspector | **Status conflation** | Coverage, evidence state, recommendations and gamification are expressed through the same planet visuals | Radar shows private mapping coverage only; category pages handle evidence status and actions |
| 16–17 — Lineup and slot | **Entity-model gap** | Event, slot, candidate, request and confirmation states are compressed into cards | Event workspace → structured slot → candidate matrix → request/shortlist/confirm lifecycle |
| 39 — Design system | **Documentation theatre** | Huge gallery is disconnected from implementation and contains product-irrelevant options | Small implemented component library organized by foundation, data/evidence, workflow, disclosure and feedback |

## 8. Missing Screens and States

### 8.1 Required for beta integrity

| Missing screen/state | Why it is required | Connects to |
|---|---|---|
| Create account + email verification | Authentication cannot be simulated by routing | 1–2 |
| Forgot/reset password | Current link is dead | 1 |
| Authentication error/loading/SSO callback | Prevents false success | 1 |
| Return-to-deep-link state | High-intent recipient conversion | 1, 33 |
| Act/entity match review | Avoids wrong-profile merges | 4–5 |
| Duplicate/conflicting-profile resolution | Entity integrity | 4–8 |
| Source match review queue | Public discovery is not confirmation | 5–8 |
| Connect/upload source flow | Add Link/File is inert | 7–8 |
| Category detail/editor for all 18 categories | Current Passport and Radar are incomplete | 6–9 |
| Source Drawer | Required provenance, date, freshness and limitation | 7–9, 18 |
| Recipient visibility matrix | Prevents accidental disclosure | 9–10 |
| Draft/published/version history | Publication is currently a boolean only | 9–10 |
| Shared-link manager with revoke/expiry | Link governance | 10, 27 |
| Enquiry detail/thread | Reply activity cannot be tracked | 11, 19 |
| Representative access request detail | Permission scope and approval | 12–14, 31 |
| Representative change review/artist approval | Artist remains owner | 14, 31 |
| Event list/switcher | Production cockpit supports only one static event | 16 |
| Structured event editor | Current Add Event discards data | 37 |
| Structured slot editor | Free-text slots are not operational | 16, 37 |
| Artist invitation response | No artist-side event context/availability response | 16–17 |
| Candidate event-specific view | Producer needs governed relevant information | 17–18 |
| Contact capture/verification | Anonymous enquiries are undeliverable | 19, 27 |
| Privacy, consent and communication notice | Sharing, tracking and outreach need explicit control | 10–11, 19–20, 30 |
| Report incorrect information / misuse | Required trust and correction path | 18, 20, 27–29 |

### 8.2 Required before scale

| Missing capability | Business impact |
|---|---|
| Search/filter/saved views for roster, events and inbox | Operational speed and scale |
| Team assignment, ownership and SLA | Multi-user execution |
| Audit history for permissions, edits and publication | Trust, compliance and dispute handling |
| Notification preferences and channel verification | Delivery reliability and cost control |
| Data export, deletion and account closure | Privacy and regulatory readiness |
| Admin publication/evidence/access queues | Quality control |
| Defined analytics consent and event taxonomy | Measurement without misleading “opened” claims |
| Localization architecture | Hebrew/English experience cannot be a plain text toggle |

## 9. Passport Architecture Recommendation

Recipient PASSPORTS must use **one consistent information architecture**, while tab order, hero message, emphasis, explanatory copy and CTA change by recipient. This does not mean creating thin recipient subsets: each view may present the artist’s complete approved professional information when it adds value. Only genuinely sensitive or irrelevant operational detail should be progressively disclosed or excluded. The artist always sees the full underlying information and every recipient preview in the private RADAR.

### 9.1 Canonical shared tab family

| Tab | Governed category sources | Purpose |
|---|---|---|
| Overview | Identity, Positioning, selected milestones, offer | Fast orientation |
| Media | Catalog, Creative Differentiation, selected live media | Experience before metrics |
| Live | Live Footprint, Technical Readiness where permitted | Booking and production confidence |
| Audience | Streaming, Audience, Content, Community and Ticketing as separate blocks | Human-readable market context without signal mixing or raw band presentation |
| Offer | Booking Market, formats, territory, lead time, enquiry route | Commercial next step |
| Details | Trust, relationships, business/legal status, team/contact, career history | Progressive disclosure |

### 9.2 Recipient-specific order and default visibility

| Recipient | Recommended tab order | Leading content | Default hidden/restricted |
|---|---|---|---|
| Booker | Overview → Media → Live → Audience → Offer → Details | Booking relevance, representative media, relevant live history | Artist-private conflicts, private legal documents and commercial health; other approved professional information remains reachable |
| Producer | Overview → Live → Media → Offer → Details → Audience | Act format, technical pack, comparable-event context, dependencies | Private strategy and unrelated confidential history; approved artist, media and audience context remains reachable |
| Representative | Overview → Media → Audience → Live → Details → Offer | Positioning, catalog, differentiation, audience/content engine, opportunity | Only information outside granted representative authority or artist-approved sharing scope |
| Private/corporate client | Overview → Media → Offer → Live → Details → Audience | Experience, packages, trust, visual impact and simple contact | Legal documents, monetization and production grids; approved artist story and selected context remain reachable |

### 9.3 Role and permission rule

| Current behavior | Required behavior |
|---|---|
| Viewer selects Booker/Producer/Client/Representative and changes the narrative | Link opens one presentation chosen by the artist/authorized owner or derived from an authenticated relationship |
| Each role has different page structure | All use the same tab family; order and components change |
| Share recipient changes message only | Recipient selection binds message + view policy + CTA + link |
| Global Shown/Hidden toggles | Field/section presentation is controlled per recipient view; this never removes the information from the artist’s RADAR |
| Broad recipient filtering | Default to complete approved information with progressive disclosure; restrict only for a named privacy, authority, legal or commercial reason |
| Sensitive data can be exposed by switching tabs | Restricted fields never ship in the page payload for that link |

### 9.4 PASSPORT persuasion hierarchy

| Layer | What the recipient sees | Design rule |
|---|---|---|
| 1. Immediate impression | Artist identity, high-impact visual, playable media and one recipient-specific relevance statement | Must communicate the artist before showing metrics |
| 2. Relevant confidence | Live context, representative work, credible relationships, event fit and selected audience context | Use cards, timelines, maps and media—not audit tables |
| 3. Complete exploration | All approved professional categories relevant to understanding the artist | Consistent tabs; recipient-specific ordering; no artificial information walls |
| 4. Evidence detail | Source method, date, freshness, attribution and limitation | Compact label first; drawer/detail on demand |
| 5. Conversion | Availability enquiry, booking contact, production request, representation action or package enquiry | One primary CTA tailored to the recipient |

### 9.5 Human-facing value presentation

| Internal representation | Do not show as primary UI | Preferred human presentation |
|---|---|---|
| `audience_band: 10k–50k` | “Band B3” or an unexplained bucket | **24.8K followers on Instagram** · measured date · source; use a range only when exact data is unavailable |
| `ticket_sales_band: 500–999` | Large coded band chip | **500–999 tickets recorded for this event** with event context and attribution status |
| `fee_band` | Abstract tier or colored rank | **Indicative range available on request** or an authorized monetary range with context |
| `territory_strength_band` | Heat color without value or definition | Named territory, platform-specific value, measured period and plain-language context |
| `coverage_percentage` | Glowing progress achievement | Quiet private RADAR summary: mapped, review, stale and not found |
| `evidence_confidence_band` | “High confidence” as a quasi-score | Exact evidence method: connected account, artist-confirmed, document-supported or counterparty-confirmed |

## 10. Microcopy Audit

### 10.1 Global language problems

| Current pattern | Problem | Recommended direction |
|---|---|---|
| “Proof” used 23 times | Overpromises and conflicts with the preferred public tone | Use **evidence**, **confirmed appearance**, **source-backed history**, **documented requirement** or the exact method |
| “Verified” used for public matches and profile badges | Conflates source discovery, account ownership and bounded confirmation | State the method: **Possible match**, **Artist-confirmed**, **Connected account**, **Counterparty-confirmed** |
| “Readiness” used for information coverage | Implies ability, quality or booking probability | Use **Mapped information** or **Information coverage** |
| “Confirmed / Developing / Needs Review / Found” on planet percentages | Mixes evidence status with coverage and personal development | Coverage: **Mapped / Review / Stale / Not found**. Evidence: separate method badge |
| “Universe lit up / growing” after evidence actions | Gamifies a risk-control system and implies progress quality | Use factual feedback: **Saved. This category now has a current source** |
| “No fake control, ever” | Defensive and product-internal | Use **You can edit after the artist approves your requested access** |
| “Nothing burning” | Flippant for operational incidents | Use **No open incidents** |
| “FROZEN ENTITY — not part of current build scope” | Internal development language exposed to users | Remove from any product surface |
| “AI scan” / “AI cost” | Implementation-centred rather than job-centred | User: **Find possible profiles**. Admin: **Discovery usage and cost** |
| “One thing / first thing buyers verify” | Unsupported universalization | Use **Recommended next step** and explain the exact observed gap |
| Internal “bands” used as visible labels | Machine-readable grouping is unattractive and unclear to people | Show the value, a meaningful range or a plain-language description with context; retain the internal band only in metadata |

### 10.2 High-impact replacement examples

| Screen | Current | Recommended |
|---:|---|---|
| 4 | Start your universe | **Build your artist profile** |
| 4 | LOCK does the digging | **We’ll look for profiles and releases that may belong to this act** |
| 5 | VERIFIED FINDS | **POSSIBLE SOURCE MATCHES** |
| 6 | TODAY’S READ | **RECOMMENDED NEXT STEP** |
| 6 | Strengthen live proof | **Add a recent live source** |
| 7 | NEXT MOVE · ONE THING | **RECOMMENDED NEXT STEP** |
| 9 | 82% mapped | **82% of applicable information mapped — private** |
| 9 | PROOF | Use the exact section: **LIVE HISTORY**, **CATALOG**, **TICKET EVIDENCE**, etc. |
| 10 | Who’s receiving it? The message adapts. | **Choose the view you want to share** |
| 11 | After you shared | **Inbox** |
| 12 | You’ll see readiness | **You’ll see mapped information, open requests and permitted next actions** |
| 17 | crowd-size proof pending | **Attendance source not yet added** |
| 18 | STRONGEST PROOF | **RELEVANT LIVE EVIDENCE** |
| 19 | Check availability | **Send availability enquiry** |
| 27 | This Passport is no longer public | **This shared view is no longer available** |
| 37 | Create event & get artist invite link | **Create draft event** |
| 38 | Notifications | **Recommendations**, unless a real notification center is built |

### 10.3 Canonical product-term use

| Term | Product meaning | Correct use |
|---|---|---|
| RADAR | The artist’s complete private intelligence and control environment | Private navigation, category workspaces, source review, conflicts, opportunities, recipient previews and actions |
| PASSPORT | The external artist-selling experience generated from governed RADAR information | Share composer, recipient-specific views, published links and conversion journeys |
| Universe | The complete information model behind the artist | Explanatory/onboarding concept; do not use as a substitute for concrete navigation labels |

Do not alternate RADAR and PASSPORT as stylistic synonyms. The distinction must remain visible in navigation, page titles, onboarding and microcopy.

## 11. Design-System Audit

### 11.1 Core implementation problem

The gallery says “Every component, every state — all token-driven,” but the product screens are built mostly from raw buttons, divs, inputs and large inline style strings. `LockButton`, `LockCard`, `LockInput`, `LockChip` and `LockSheet` are demonstrated in the gallery but are not consistently used by the actual screens.

This creates three separate systems:

1. Gallery components.
2. Raw product-screen patterns.
3. JavaScript-generated style strings for navigation, chips, roster rows and status states.

The fix is not to add more gallery components. The product must consume one implemented component library.

### 11.2 Component-by-component decision

| Current component/pattern | Audit finding | Decision |
|---|---|---|
| LockButton — 4 variants, 2 sizes, 3 states | Relevant; real screens do not use it consistently; many controls are below the documented 44px target | **Keep and enforce** |
| Icon button | Relevant; accessible-name usage is inconsistent | **Keep with required label, tooltip and 44px target** |
| LockChip — 8 states | Overloaded: evidence, workflow, error, filter and N/A are mixed | **Split** into EvidenceMethodBadge, WorkflowStatusChip and FilterChip |
| Method labels | Highly relevant, but only four examples and not connected to actual evidence cards | **Keep and expand** with source date/freshness/limitation |
| LockInput | Relevant; actual inputs lack labels/forms/validation | **Keep and enforce** with semantic label, helper, error and required states |
| AI draft textarea style | Relevant but visually coded only by a dashed border | **Rename** to SuggestedDraftField and add “Suggested—review before publishing” |
| Toggle | Relevant for visibility, but current view composer uses ambiguous Shown/Hidden buttons | **Keep** with recipient-specific label and accessible switch semantics |
| Checkbox and radio | Generic examples are unused in current product | **Keep only if required by implemented flows; otherwise remove from beta DS** |
| Generic tabs — Overview/Evidence/Passport/Settings | Generic and not aligned to recipient-view architecture; no semantic implementation | **Replace** with governed content tabs and proper tab semantics |
| Skeleton/shimmer | Relevant for discovery and data loading | **Keep**, respect reduced motion |
| Paper marketing card | Marketing-site pattern inside app DS; not used by product flows | **Move** to marketing-site library |
| LockCard — seven variants | Too many named visual variants; most can be one card with tone and elevation | **Merge** to BaseCard + `tone` + a few specialized composites |
| Planet states | Conflates coverage, evidence and readiness; percentage glow implies scoring | **Redesign completely** as private CoverageRing + separate category statuses |
| Source icons — “verified vs needs-you” | Platform branding is incorrectly used as verification | **Split** SourceIcon from EvidenceMethodBadge |
| Avatars and badges | Relevant but multiple roles are mixed | **Keep** as ActAvatar, PersonAvatar and Role/EnvironmentBadge |
| Iconography | Relevant; product still uses emoji despite “no emoji” rule | **Keep and enforce** |
| Screen anatomy | Useful guidance but contradicted by real screens and many inline helper blocks | **Rewrite** as layout templates by screen type |
| Toasts and achievements | Toasts relevant; frequent achievements are excessive for evidence governance | **Keep Toast; restrict Celebration** to onboarding milestones |
| Progress bar | Dangerous while labelled readiness; acceptable only for private mapping coverage | **Rename/restrict** |
| Numeric band chips | Technically useful but visually cold and unattractive for artist presentation | **Remove from primary UI**; render exact values, meaningful ranges, scales or plain-language context and retain the band internally |
| App bar and bottom navigation | Relevant, but role switching causes wrong navigation context | **Keep; bind to active workspace and role** |
| Persona pills | Unsafe when they unlock different disclosure scopes | **Replace** with owner-side preview controls; never viewer-side permission controls |
| List rows | Relevant, but roster/request/notification patterns can share a base | **Merge** to EntityRow/TaskRow with typed status |
| Event slots | Relevant and used | **Keep; add structured data and actions** |
| LockSheet | Relevant, but actual dialogs lack focus behavior and sheets are overused | **Keep for short tasks only; full-page for complex editing** |
| Promo card | Relevant to sharing if actually generated | **Keep after generation/export behavior exists** |
| Empty state | Relevant | **Keep with next step, manual route and support path** |
| Seven interchangeable skins | Brand dilution, extra QA cost and no user value | **Remove**; keep LOCK theme plus high-contrast/accessibility mode |
| Georgia editorial typography | Declared for marketing/hero but not consistently used in product | **Move to marketing library or remove** |
| DM Mono method typography | Relevant if readable at mobile sizes | **Keep with minimum accessible size** |
| Prototype shell/index | Development tool, not product design system | **Move to QA harness** |

### 11.3 Duplicated patterns to consolidate

| Duplicated implementation | Consolidated component |
|---|---|
| Back buttons repeated across screens | `BackButton` / contextual header |
| Raw section cards with near-identical border/radius/padding | `SectionCard` |
| Roster, notifications, source rows and request headers | `EntityRow` / `TaskRow` |
| Status chips built by multiple helper functions | Typed status components with separate namespaces |
| Multiple raw bottom sheets | `BottomSheet` with focus management |
| Share/WhatsApp/copy buttons | `ShareActionGroup` |
| Raw chip selectors for genres/types/recipients | `ChoiceChipGroup` |
| Public and editor offer pills | `OfferSummary` |
| Multiple source/platform icon rows | `SourceList` |
| Inline success, achievement and error messages | `InlineAlert` + `Toast` |
| Event confirmed/candidate/empty cards | `EventSlotCard` |
| Buyer assets and representative footprint metrics | Signal-family-specific cards, never one mixed `AssetCard` |

### 11.4 Components currently missing from the DS

| Required component | Why it is load-bearing |
|---|---|
| CoverageRing / CoverageSummary | Private mapping without artist scoring |
| CategoryStatusRow | Separates mapped, review, stale, conflict and not-found states |
| EvidenceCard | Claim + exact method + source + date + evidence ceiling |
| SourceDrawer | Provenance, freshness, owner, artifact and limitation |
| ConflictResolutionCard | Resolve aliases, duplicate profiles and mismatched sources |
| RecipientViewTabs | Consistent page architecture with recipient-specific order |
| VisibilityRuleControl | Show/hide per recipient view with restricted-state explanation |
| RecipientPreviewHeader | Makes the current preview scope unmistakable |
| PublicationStatus / VersionHistory | Draft, published, replaced and revoked views |
| SharedLinkRow | Recipient, view, created, expiry, activity policy, revoke |
| MediaPlayer / MediaRail | Audio/video is central to the artist experience |
| PerformanceTimeline | Dated, bounded live history |
| TerritoryEvidenceMap | Platform/period-specific geography without demand inference |
| EventEvidenceCard | Capacity, issued, sold, scanned and attribution separated |
| TicketFunnel | Event-level funnel with attribution limit |
| ProductionReadinessPack | Rider, plot, I/O, changeover and dependencies |
| ContextualOfferCard | Format, territory, lead time and context-specific terms |
| DocumentStatusMatrix | Private legal/business readiness |
| RolePermissionMap | Artist/manager/agent/production authority |
| RelationshipGraph | Project-linked relationships only |
| EnquiryThread | Traceable buyer/artist communication |
| AccessRequestCard | Requested permission scope and lifecycle |
| EventContextCard | Structured event details shared with invited artists |
| CandidateEvidenceMatrix | Slot-specific comparison without total score |
| HumanValueDisplay | Converts governed exact/range/band data into an understandable value, context, date and optional detail disclosure |

### 11.5 Visual language and colour correction

| Area | Current risk | Required direction |
|---|---|---|
| RADAR | Glow-heavy rings make coverage feel like scoring and consume the visual hierarchy | Keep the six-planet identity but reduce glow. Use calm neutral surfaces, clear hierarchy and one accent per active planet. Information and action must dominate decoration |
| PASSPORT | Dark technical cards and dense evidence labels make the artist feel like a risk report | Use larger imagery, playable media, editorial spacing and warmer/high-contrast surfaces. Evidence should feel credible but secondary |
| Status colour | Green/amber/red can imply artist quality | Reserve status colours for workflow state—current, review, stale, conflict—not talent, value or booking fit |
| Platform colour | Branded icons appear to validate claims | Use platform colour only for source recognition; evidence method is a separate neutral label |
| Recipient identity | Entirely different layouts fragment the product | Use the same shell and tab system; adapt hero copy, ordering, featured modules and CTA |
| Quantitative display | Bands and tiny metadata feel machine-generated | Use readable numbers/ranges, direct labels, charts only when useful, and contextual captions |
| Typography | Small uppercase/mono text dominates important content | Reserve mono for provenance and method metadata. Use the primary humanist/editorial face for artist story, navigation and decisions |

## 11.6 Archive-Recovery Rule

The older prototype is a useful inventory of options, labels and possible states, but it is not authoritative product logic. Reuse an archived item only after mapping it to a current governed field, user job, source method and completion state.

| Archive content type | Reuse | Required treatment |
|---|---|---|
| Genre, event-type, role, platform and contact-option lists | Yes | Normalize terminology, remove duplicates, support search and allow governed additions |
| Source/platform inventories | Yes | Use as AI-discovery candidates; do not imply a live integration or verified ownership |
| Artist, representative, event and buyer states | Selectively | Reconcile with the current entity, permission and recipient model |
| Readiness, proof, verification and development labels | No, without rewrite | Replace with current mapping, evidence-method and workflow terminology |
| Skins, decorative variants and duplicated cards | No | Keep only the current LOCK visual system and accessibility mode |
| Old PASSPORT content blocks | As data clues only | Remap to the current six planets, 18 categories and shared PASSPORT tab family |

## 11.7 Smart Selection and Data-Entry Interaction Standard

Every menu, dropdown, chip group, autocomplete or option picker must be part of a complete data-entry process. A closed list alone is not sufficient for artist, event or source intelligence.

| Interaction stage | Required behavior | User-facing outcome |
|---|---|---|
| 1. Context | Explain why the information is requested and how it will be used | The user can make an informed choice without product jargon |
| 2. Smart default | Preselect only when a reliable existing value or current context supports it | Faster completion without silent assumptions |
| 3. Search and browse | Search by label, alias and related term; group long lists; show recent/recommended choices | The user does not scan an unstructured wall of options |
| 4. AI suggestions | Suggest likely values from discovered sources and explain the basis | Suggestions are useful but visibly unconfirmed |
| 5. Multi-select logic | Allow single or multiple values according to the field’s governed cardinality; show limits and prioritization | The stored answer matches the real-world entity |
| 6. Conditional detail | Open relevant follow-up fields after a selection | Selecting “Live band” can request members/roles; selecting “Festival” can request stages/dates |
| 7. Other/not listed | Allow **Add another option** or **Not listed** with a descriptive field and review path | Taxonomy gaps do not block the user |
| 8. Unknown/not applicable | Separate **I don’t know yet** from **Not applicable** | Missing information is not stored as a false negative |
| 9. Review | Show the resulting structured statement before saving when the choice affects identity, permissions, rights, fees or public presentation | High-impact decisions are explicit |
| 10. Save and recovery | Autosave drafts, show saved state, preserve progress and allow undo/version review where material | No data is lost when the user leaves or an AI process continues |

### Required control behavior by type

| Control | Use when | Required interaction |
|---|---|---|
| Radio cards | One high-impact choice among 2–5 clear alternatives | Whole card clickable; concise consequence; keyboard selection; no hidden follow-up |
| Searchable combobox | One choice from a long governed list | Typeahead, aliases, grouped results, no-result path, clear selection |
| Multi-select combobox | Multiple choices from a long list | Selected tokens, priority/order when relevant, limit guidance, remove/undo |
| Choice chips | Small optional set with short labels | Clear selected state, field label, helper text and **More options** when incomplete |
| Cascading selector | Country → city, event type → format, role → authority or similar dependency | Child options refresh predictably; previous values are never silently discarded |
| Date/time picker | Events, releases, measurements, expiry or availability | Locale/time-zone clarity, flexible/unknown option where valid, conflict feedback |
| Range input | Fee, capacity, audience or duration when exact value is unavailable | Display units and endpoints; distinguish approximate, declared and source-supported values |
| File/link input | Source evidence, media, rider or document | Detect type, extract metadata, preview result, allow correction and show visibility before save |
| Entity picker | Artist, member, venue, label, producer, event or organization | Search existing entities first, show disambiguation, then create a new entity only if unmatched |

## 11.8 AI Information-Discovery Flow

AI discovery must be an interactive research assistant inside the RADAR, not a one-click “scan” that silently converts matches into facts.

| Step | System action | Artist interaction | Stored state |
|---:|---|---|---|
| 1. Seed | Accept act name, aliases, official link, location, members and optional starting platform | Confirm the minimum identity seed | `declared_seed` |
| 2. Plan | Show which source families will be searched—profiles, catalog, live history, media, audience, credits and business information | Add/remove source families; choose **Continue in background** | `discovery_plan` |
| 3. Search | Search candidates by exact name, alias, member, credit, location and cross-linked identifiers | See progress by source family rather than a fake universal percentage | `search_run` |
| 4. Cluster | Group likely profiles/releases/events into candidate entity clusters | Open a cluster and see why items may belong together | `candidate_cluster` |
| 5. Disambiguate | Highlight conflicts: same-name artist, legacy handle, duplicate release, shared member or location mismatch | Choose **Mine**, **Not mine**, **Unsure**, **Partly mine**, or **Ask someone** | `artist_review_status` |
| 6. Extract | Propose structured facts from accepted sources | Review extracted fields in context; edit without losing the original source | `suggested_fact` |
| 7. Confirm method | Distinguish public discovery, connected account, artist confirmation, document support and counterparty confirmation | Connect an account, upload evidence or keep the bounded public-source status | `evidence_method` |
| 8. Resolve conflict | Present competing values side by side with source/date | Select current value, keep both as time-bound, or mark unresolved | `resolution_record` |
| 9. Apply | Write approved facts to the governed artist spine and refresh affected RADAR categories | Preview affected PASSPORT views before publication | `governed_fact_version` |
| 10. Monitor | Recheck by freshness rule and surface meaningful changes | Review, dismiss, pause a source or correct the match | `change_candidate` |

### AI discovery screen requirements

| Requirement | Acceptance criterion |
|---|---|
| Transparent scope | The user sees which categories and sources are being checked |
| Explainable match | Every suggestion shows the match basis: alias, linked profile, shared credit, official link, member or other identifier |
| No automatic truth promotion | Publicly discovered content remains a candidate until the governed method permits stronger status |
| Batch review without blindness | The user may accept multiple low-risk candidates, but can inspect each source and undo the batch |
| Manual continuation | The user can add a link, upload a file, enter a fact or create an entity when discovery fails |
| Background operation | Long searches can continue after leaving the screen; completion appears in RADAR tasks/updates |
| Partial results | A failed source does not fail the entire run; show successful, pending and unavailable source families separately |
| Duplicate prevention | Accepted matches merge into existing entities through identity resolution rather than creating duplicate facts |
| Privacy preview | Before a discovered item appears in PASSPORT, the artist sees its recipient presentation and visibility state |
| Auditability | Store query/run time, source, extraction version, artist decision and later changes |

## 11.9 Selection and Discovery Gaps by Current Screen

| Screen | Current selector/discovery gap | Required interactive process |
|---:|---|---|
| 2 — Intent | Single choice permanently determines workspace | Choose first task; explain consequence; allow another workspace later |
| 4 — Artist onboarding | Name, one link and static genre chips do not resolve an act reliably | Searchable act/genre/location fields; aliases; act type; multiple starting sources; entity-match review |
| 5 — Discovery | Fixed source animation and “verified finds” skip planning and confirmation | Use the full AI discovery flow above with source-family progress, clusters and review states |
| 7 — RADAR category | Add Link/File is inert and category rows do not open | Source-action menu: connect platform, add link, upload file, enter manually, request confirmation or rerun discovery |
| 9 — PASSPORT composer | Visibility toggles lack recipient and content context | Recipient selector → tab/section order → included presentation → detail level → preview → publish |
| 10 — Share | Recipient choice changes message only | Select recipient presentation, named recipient, access/expiry and communication channel; validate before link creation |
| 12 — Representative onboarding | Five decorative choices do not collect real role/authority | Searchable role and organization; conditional authority scope; find/invite artists; artist approval |
| 13–14 — Roster/artist | Artist choice is not bound safely to entity data | Search/filter roster; select correct `artist_id`; show permission scope; retain representative context |
| 15–16 — Event setup | Event-type selection is discarded and event details remain static | Event-type-driven wizard; venue/date/time zone; slot structure; genres/formats; team and objectives |
| 17 — Candidate selection | Static comparison and pin action bypass availability | Entity search/AI candidates; event-fit evidence matrix; request missing data; shortlist; confirm availability before booking |
| 19 — Enquiry | Event/contact chips omit the actual contact destination and conditional fields | Event type drives date/location/budget/format fields; contact choice requires validated destination |
| 20 — Confirmation | Response choice collapses different meanings into completion | Claim-by-claim response, correction fields, relationship/scope, consent and clear final review |
| 37 — Add event | Only name persists; types/genres behave decoratively | Structured wizard with smart defaults, conditional fields, review and complete persistence |

## 12. Accessibility and Interaction Audit

| Finding | Severity | Required correction |
|---|---|---|
| No semantic form elements | High | Use `<form>` with submit behavior and validation |
| No semantic `<label>` for 19 form controls | High | Associate every control with a visible label |
| No document headings | Medium | Use structured `h1`–`h3` hierarchy |
| No page `lang` attribute | Medium | Set current locale and update it on language change |
| Four dialogs lack `aria-modal` | High | Add modal semantics and focus management |
| No focus trap or focus return | High | Trap focus inside modal; return to trigger on close |
| Drag handles are `role=button` without keyboard focus | High | Use a real button or make handle decorative |
| Menus lack menu-item semantics | Medium | Use button/list navigation pattern or complete menu semantics |
| Tab list has no tab/tab-panel semantics | High | Implement keyboard-selectable tabs with selected state |
| Reduced motion disables all animations, including loaders | Medium | Replace motion with static progress rather than disabling state feedback |
| Tiny metadata text reaches 8–10px | High on mobile | Set a readable minimum; do not encode critical meaning in microtext |
| Color and glow carry status meaning | High | Add text labels and shapes; verify contrast |
| Colored platform icon means “verified” | High | Remove status meaning from brand color |
| Emoji remains in product despite DS rule | Low/consistency | Replace with system glyphs |
| Sticky coach, sticky CTA and bottom nav may compete vertically | High | Reserve one sticky action region and test small-height devices |

## 13. Recommended Product Screen Architecture

| Workspace | Primary navigation | Core screens |
|---|---|---|
| Artist | Universe · Shared views · Inbox | Six-planet overview; category detail; source review; view composer; shared-link manager; enquiry thread |
| Representative | Roster · Tasks · Inbox | Roster; artist workspace; access requests; view composer with scoped permission; enquiries |
| Production | Events · Candidates · Inbox | Event list; event workspace; structured slots; candidate evidence; invitations; production pack |
| Account | Workspaces · Settings | Profile/security; permissions; notifications; privacy/data; plan |
| Admin | Queues · Data quality · Operations | Publication review; evidence conflicts; access incidents; usage/cost; audit |

## 14. Prioritized Remediation Plan

| Priority | Action | Owner | Definition of Done |
|---:|---|---|---|
| 1 | Lock the governed data, artist-access and recipient-presentation model before more UI styling | Maria + Product/UX + Engineering | Every field has category, source method, date/freshness, evidence ceiling, full artist visibility, recipient presentation rules and an explicit reason for any external restriction |
| 2 | Rebuild Screens 6–9 and 18 as one RADAR-to-PASSPORT system | Product/UX + Engineering | RADAR exposes the artist’s complete universe; the same governed data renders four persuasive PASSPORT views with shared tabs, recipient-specific order/copy/CTA and no internal band codes as primary UI |
| 3 | Repair entity and permission integrity | Engineering | Routes carry `artist_id`; representative states are explicit; declined/revoked access cannot render edit controls; all roster artists show their own data |
| 4 | Complete the minimum viable flows | Product + Engineering | Authentication, entity resolution, source review, event creation, availability enquiry and representative access each have valid start, persistence, error and completion states |
| 5 | Replace scoring-like coverage visuals and verification overclaims | UX Writing + Design | No public/private surface implies talent, readiness, rank or booking probability from mapping coverage or platform presence |
| 6 | Consolidate the design system and make screens consume it | Design + Frontend | Core screens use implemented Button, Input, Card, Status, Sheet, Tabs, Evidence and Disclosure components; unused skins/patterns removed |
| 7 | Run visual, responsive and assistive-technology QA | QA + Design + Frontend | 320/390/430 mobile, tablet and desktop pass; keyboard/focus/labels/contrast/reduced-motion acceptance criteria pass |

## 15. Traffic Light

| Status | Finding |
|---|---|
| 🟢 | Six-planet direction is visible and strategically differentiated |
| 🟢 | Recipient-specific value propositions are present |
| 🟢 | Multi-act, representative and production universes are represented conceptually |
| 🟢 | Warm empty/dead-link/error tone is directionally strong |
| 🟡 | 39 indexed states overstate the number of distinct completed product screens |
| 🟡 | Visual direction is coherent, but implementation is not actually component-driven |
| 🔴 | Recipient-role switching creates a disclosure-control failure |
| 🔴 | Representative permissions and artist scoping are logically unsafe |
| 🔴 | Core forms and several primary actions are nonfunctional or discard data |
| 🔴 | Coverage, evidence status and readiness are conflated |
| 🔴 | RADAR is not yet the complete artist intelligence interface and PASSPORT is not yet a media-led artist-selling experience |
| 🔴 | Human-facing screens expose technical band-like presentation that weakens comprehension and desirability |
| 🔴 | Critical authentication, entity-resolution, publication, event and enquiry flows are incomplete |

## 16. Next Best Action

| Owner | Action | Definition of Done |
|---|---|---|
| Maria + Product/UX + Claude Code | Create a **RADAR → PASSPORT Rendering Contract** for Screens 6–9 and 18 | One implementation table defines every governed category, full artist-private component, PASSPORT tab, recipient-specific order/message/component/CTA, human value display, source-detail treatment and the explicit reason for any external restriction |
