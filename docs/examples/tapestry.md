# Worked example: managing the Tapestry repo as $P^2$

**Status: L3 (disclosed).** The CoS maintains this note under the scale in [`../hold-axis.md`](../hold-axis.md). The CoS may revise it, but must record each change and its reason in the changelog at the bottom. The hold-axis map, the candidate scores and the rung-1 targets below are **proposals**; nothing here changes the Tapestry repo.

This note maps the management of David Strayhorn's Tapestry repo, `nous-clawds4/tapestry`, onto the Infinite Harness as project $P^2$, in the same shape as [`physics.md`](physics.md): the goal $G^2$, the base harness $H^2_0$, the rung-1 changes already made to that harness, a hold-axis map, what rung 1 still lacks, and where rung 1 would start.

**Sources and honesty.** Everything below comes from the Tapestry repo as read on 2026-09-27 (`main` at `1e518034`, 12:40 PM ET; `staging` holds nothing that `main` lacks), plus `gh` metadata for PRs, workflow runs and rulesets pulled the same evening. PR numbers were checked with `gh`. Dates in the rung-1 table are the merge dates of the cited PR in US Eastern time (ET) unless the row says otherwise. Counts marked "my count" come from scripts run on the box, and the script is described next to the count. Inferences are marked **(inference)**. One correction to the brief this note was written from: the repo is **public**, not private.

**The harness already improves itself.** The most important fact about $P^2$ is that Tapestry already runs a rung-1 loop of its own, with a harness changelog whose "Origin" column records "which feedback channels actually produce changes" (`engineering-team/CHANGELOG.md`, header). So this note is less a design for rung 1 than a reading of a rung 1 that exists, and of what it still lacks by IH's standards.

## The goal $G^2$

The repo states its goal at two levels.

- **The software.** The README opens: "A local-first knowledge graph for nostr, implementing the **tapestry protocol** for decentralized curation of simple lists (DCoSL) and personalized web of trust metrics using the GrapeRank algorithm." Development "is focused on the **concept graph** — a structured knowledge graph built from nostr events (DLists), stored in Neo4j, and browsable through a React UI". It is "designed to be operated by **humans** through the browser UI, or by **AI agents** through the CLI and API", and "You own your data."
- **The product.** `ROADMAP.md` says Brainstorm Search "will become **a generalized search engine for all the information on the planet** — an alternative to Google", starting as "the best place on nostr to search for **nostr profiles**" and expanding "one searchable category at a time". Its principles include "**Easy, fast, free, effective.** Non-negotiable." and "No nostr account required to use." It calls the order of new categories "the most important strategic question on the roadmap", and leaves its candidate list "unranked on purpose".

The repo also fixes constraints that any work toward the goal must honour. `CLAUDE.md` lists four "Architecture invariants — read every session": POV-first ("there is no 'the view,' only views from a perspective"), decentralized-first ("publishing is permissionless; aggregation is opinionated"), filter at view time, and local-first ("neo4j is the definitive 'me'"). These play the role that physics' firewalls play: they are what a lower rung must not erode.

**Who Tapestry is for** (David, 2026-09-27). Anyone can run a Tapestry instance, and each instance has an Owner. David named three kinds of Owner that the ladder must understand and protect:

- **An individual** running an instance for personal use. What matters here is the README's "You own your data" and the local-first invariant: the instance is the Owner's own knowledge graph, and nothing leaves it unless the Owner chooses.
- **A community leader** whose "customers" are the members of the community. The repo already has customer machinery (per-customer GrapeRank, customer relays, sign-up and status endpoints), so members get scores and views computed from their own point of view on an instance someone else operates.
- **An enterprise organization**, such as NosFabrica, running Tapestry as a service that will be an alternative to Google search in at least some contexts. This is the ROADMAP's Brainstorm Search, with its "Easy, fast, free, effective" and "No nostr account required to use."

For IH, $G^2$ is therefore: **manage the repo so that Tapestry advances toward the README and ROADMAP goals for all three kinds of instance, without violating the architecture invariants.** Earlier drafts of this note asked which of the two goal statements governs when they pull apart, for example protocol and concept-graph work versus search traffic. David's answer is that neither governs alone: $G^2$ covers both uses. A harness change that advances one kind of instance by eroding another (say, a search-service shortcut that assumes one central operator, or a personal-instance feature that leaks data to a shared relay by default) is exactly the kind of lowered bar that rung 2 is there to flag.

The instances in play today illustrate the range. David (straycat) owns tapestry.brainstorm.world and staging.brainstorm.world. The local instance at http://localhost:7778 on David's Mac is owned by Nous. The whole repo is R&D, and the local instance is one of several R&D instances, so its concept graph is a safe place to try out the IH records in [`../tapestry-concept-model.md`](../tapestry-concept-model.md).

## $H^2_0$ as it stands

**Agents and roles.**

- **Fourteen subagent definitions** in `.claude/agents/`. Seven belong to the engineering flow or serve it: `product-owner`, `architect`, `tester`, `implementer`, `reviewer`, `gate-judge` and the read-only `product-expert`. Seven belong to the product flow: `product-strategist`, `ux-researcher`, `product-manager`, `domain-modeler`, `product-designer`, `product-lead` and the read-only `product-advisor`.
- **Tool withholding is platform-enforced, conduct is not.** The Architect and Reviewer have no Edit tool; `gate-judge` has only Read, Bash, Glob and Grep. `engineering-team/README.md` § "Role isolation" is explicit that "Tool *withholding* is enforced by the platform; conduct rules ... remain trust-based prose".
- **The Director** (`engineering-team/roles/director.md`) has no subagent file. It is the main session answering phase gates in Direction mode, using blinded `gate-judge` spawns.
- **Who does the work.** Of the 193 PRs opened since 2026-08-28 (my count, `gh pr list --state all`), `nous-clawds4` opened 91, `virgil-clawds4` 64, `ark-clawds4` 37 and `vcavallo` 1. The three `*-clawds4` accounts are agent identities **(inference from the names and the README's OpenClaw section; the repo does not define them)**.
- **The human** appears in the records as "the operator" or "the owner" who ratifies gates and harness changes. The records do not always say which human; `wds4` (David Strayhorn) opened the harness-review PR #337.

**Workflow.** Engineering Team Mode (`CLAUDE.md`, `engineering-team/README.md`) runs every change through "Product Owner → Architect → Tester → Implementer → Reviewer":

1. `/plan-feature` writes a story under `engineering-team/stories/<epic>/`.
2. `/design-architecture` writes an ADR under `decisions/<epic>/`.
3. `/design-tests` writes a test plan and failing tests.
4. `/implement-feature` makes them pass.
5. `/review-changes` writes a PASS or CHANGES_REQUESTED review under `reviews/<epic>/`.

"The user is the approval gate between phases." The strictness table in `workflows/0-intake.md` decides which phases a bug, refactor or doc change may skip. Above the story sits a **book of work**: `audits/<book>/book.md` records an intent anchor at open, and `/close-book` writes `audit.md` plus a `prd-addendum.md` or `prd-seed.md` at close. The system "never declares done; it proposes done and the user ratifies." Three variants exist:

- **Direction mode.** "Armed" (pre-registered) or "operational" (terms derived from an owner-ratified goal). Gates are answered by the Director under blinded-judge rubrics. "Ad-hoc per-session gate pre-authorization is not a third mode and is forbidden."
- **The Light profile** (`workflows/light-profile.md`), a book-scoped trial since 2026-08-18. It has two human stops and three blinded interior gates.
- **Protocol-spec docs-mode** for BIBLE and ADR work.

A parallel **Product Team** flow (`product-team/`, seven phases from Discovery to Story Decomposition) hands a `stories-queue.md` to engineering. "Neither writes into the other."

**Review.** Review is an artifact, not a GitHub approval. The `main` ruleset requires a PR but **zero** approving reviews (`gh api .../rulesets/15863292`). My grep of `engineering-team/reviews/` found 282 review files, 41 of which contain a CHANGES_REQUESTED verdict token on a heading or in bold. PRs are opened after review: the median time from PR open to merge across the 189 PRs merged since 2026-08-28 is about 2.5 minutes (my count).

**CI and the branch rule.** There are six workflows in `.github/workflows/`:

- `test.yml` runs the stack-free suite (`npm test`) on every PR into `staging` or `main`, with "No retries anywhere".
- `guard-main-source.yml` fails any PR into `main` whose head is not `staging`, `promote/*` or `hotfix/*`.
- Four push-triggered deploy workflows: `main` → tapestry.brainstorm.world, `staging`, `feat/tags` and `feature-magic-carpet`.

The ruleset `main-requires-pr-before-merging` (active, no bypass actors) makes `stack-free` and `main-source-guard` **required status checks** on `main`. A second ruleset blocks deletion and force-pushes on `staging`, `main` and three feature branches. `staging` has no required checks. The guard uses `pull_request_target` so that "a PR could [not] edit this guard away in the same PR that violates it."

The guard is live. Since 2026-08-28 it has failed three runs (my count): two for vcavallo's **PR #759** ("Add b tag authoring", opened 2026-09-26 6:29 PM ET from `add-b-tag-authoring`), and one for **PR #583** (opened 2026-09-05 9:58 PM ET from `protocols/item-publication-designation`). Both PRs are still open. Neither can merge into `main` until it is retargeted to `staging`, which is exactly what the rule is for.

**Release flow.** Feature branch → PR into `staging` (auto-deploys to staging.brainstorm.world) → smoke test → a `staging → main` or `promote/*` PR (auto-deploys to production). The `/cycle-local|staging|prod|full` skills script this chain. They include a safe-to-merge check before the deploy-triggering merge, a SHA-matched deploy-run poll, and a hard production gate: "Auto mode does NOT skip this gate." Since 2026-08-28, 58 PRs into `main` came from `staging` and 4 from `promote/*` branches, and none from `hotfix/*` (my count).

**Memory.** Nothing important lives only in chat, by design:

- `OPEN.md` is the ledger of small loose ends. Its numbered table (342 rows) was frozen on 2026-09-19. New rows are files in `ledger/`: 85 files, from 2026-09-19 to 2026-09-27, 73 OPEN and 12 DONE (my count of `**Status:**` lines). `meta` rows are harness lessons: 158 table rows and 45 row files are typed `meta`.
- `engineering-team/stories/_intake.md` holds queued work, `engineering-team/follow-ups.md` deferred ideas, and `docs/*HANDOFF*.md` session handoffs.
- `/whats-open` (`scripts/whats-open.sh`) derives one roll-up from all of them. A `SessionStart` hook (`.claude/settings.json` → `scripts/session-start.sh`) runs the lint, the meta-escalation banner and a stack probe at every session start.
- `AGENTS.md` tells agents to orient from the **local concept graph** first (`GET /api/concept-graph/summaries`, then `/neighbors`, then the node), and fall back to `firmware/*.json` and `BIBLE.md` when no stack is up.

**The self-improvement machinery.** `scripts/harness-def-paths.txt` defines "what constitutes the harness": `CLAUDE.md`, `AGENTS.md`, the roles, workflows and templates of both teams, `.claude/`, and the harness scripts. A commit that touches those paths must also add a row to `engineering-team/CHANGELOG.md`, with date, change, why and origin (lint check L10). `scripts/harness-lint.sh` asserts 16 invariants (L1–L16). Waivers print visibly with a citation. `scripts/harness-stats.sh` measures the harness. On 2026-09-27 it reported (my run):

- 1,304 phase commits;
- 244 decided reviews, with a "kick-back rate: 0%";
- 94 approves, 14 kick-backs and 6 halts at Direction-mode gates;
- 6 open and 66 closed books;
- a median cycle time of "0d".

`CLAUDE.md` and `AGENTS.md` are capped at 190 and 102 lines by lint check L11.

## Rung-1 changes already made

These are changes to $H^2_0$ itself, not to the product. The "Why" column quotes or paraphrases `engineering-team/CHANGELOG.md` or the file's own comments unless it says otherwise. The CHANGELOG notes that its rows before 2026-07-02 "were **reconstructed after the fact**".

| Date (ET) | What changed | Why | Evidence |
|---|---|---|---|
| 2026-05-04 | **Deploy-chain skills** `/cycle-local\|staging\|prod\|full` and one canonical `docs/SMOKE_TEST.md`. | "deploy/smoke steps were being re-derived (and re-mistaken) per session" | #100; `48de7b57` |
| 2026-05-06 | **Engineering Team harness created**: roles, workflows and templates for PO → Architect → Tester → Implementer → Reviewer, with human gates. README says "Generated 2026-04-30". | Adoption of Rob Conery's *Eliminate Crappy Slop Code* pattern | #111 (vcavallo, into `main`); `4acbe321` |
| 2026-05-11 (commit); on `staging` 2026-06-16 | **Architecture invariants** added to `CLAUDE.md`: POV-first, decentralized-first, filter at view time, plus reflex checks. | "stop centralized-SaaS instincts from silently violating the product's core principles" | `7b9659a0`, which reached `staging` in #268 |
| 2026-06-04 | **Epic-scoped folders** and per-epic numbering; the Reviewer flips a story to Done on PASS. | "three real numbering collisions" | #236; `dacbcf03`; `MIGRATION-epic-folders.md` |
| 2026-06-05 | **Books and the return edge**: `book.md` anchors, `/close-book`, audit plus PRD addendum or seed. | "shipped work wasn't feeding back into product scoping" | #243; `24ed9513` |
| 2026-06-09 | **Direction mode**: the Director role, the blinded `gate-judge`, `/direct-feature`, pre-registration. | "test whether the harness can carry a feature end-to-end with Claude at the gates", "pre-registered like a human study" | #263; `3a2657b2` |
| 2026-06-14 | **`OPEN.md` ledger and `/whats-open` roll-up.** | "loose ends lived only in session memory" | #292; `0143835a` |
| 2026-07-05 | **The self-improvement loop.** An operator-commissioned harness review, then: harness-lint L1–L9, the harness CHANGELOG with the L10 touch-rule, a retro step with a "no-fourth-state" rule for lessons, meta-row escalation, `harness-stats.sh`, the SessionStart hook, and line budgets (L11). | The review's "61 adversarially-verified findings; one meta-problem: everything stated twice, nothing enforced, lessons had nowhere to land" | #337 (opened by wds4); `docs/HARNESS_REVIEW_HANDOFF_2026-07-02.md`; book `audits/harness-self-improvement/` |
| 2026-07-06 | **First CI test gate** (`test.yml`), and the SessionStart hook actually shipped (`.claude/settings.json` un-ignored), with lint L12. | The hook "existed only in the cloud session that wrote it"; "enforcement that only works on one platform is prose" | #338; OPEN.md rows 19, 20 |
| 2026-07-18 | **Safe-to-merge check** wired into `/cycle-staging` and `/cycle-prod`. | "the gate existed but guarded nothing" | #385; `docs/SAFE_TO_MERGE.md`, `scripts/check-safe-to-merge.sh` |
| 2026-07-26 | **Operational direction**: a Director run's terms are derived from an owner-ratified goal via `GET /api/brain/direction/:slug`. A same-day amendment (ADR 0002) makes the boundary guard fail closed. | Arming a book cost "~2,000 words" of pre-registration, "so Direction mode went unused"; the boundary half "had regressed to" prose | #469; ADRs `operational-direction/0001`, `0002` |
| 2026-07-28 | **Two retro fixes**: the book-close gate runs last, and gate judges run verification in the foreground. | The close gate "was **guaranteed red**"; a judge "backgrounded the ~32-min full suite ... and died verdict-less" | #477, #478; OPEN.md #121, #123 |
| 2026-08-07 | **`main-source-guard`**, made a required check on `main` by the ruleset (updated 9:27 PM ET that evening), then verified by deliberately failing test PRs at 8:29 and 9:29 PM ET. | "PR #446 (2026-07-24) merged a magic-carpet ops workflow straight into `main` from an arbitrary feature branch ... and sat reachable on the default branch for two weeks" (workflow comment; issue #515, PR #516) | #517; ruleset `updated_at`; guard runs on `test/guard-smoke-denied` and `test/verify-guard-enforced`. **No CHANGELOG row**, because `.github/workflows/` is not a harness-definition path |
| 2026-08-11 | **Book close carries its own close-out** (step 13): refresh notes, push, fast-forward refs; production promotion and branch deletion stay gated. | The operator: "there's no way I'll remember what the steps are" | #541 (promotion to `main`); CHANGELOG 2026-08-11 |
| 2026-08-18 | **Light profile** installed as a book-scoped trial. | A 2026-08-18 harness review "measured the friction as availability (human stops) ... not gates"; interior gates "do 29% of the corpus's rejecting" | #566; `workflows/light-profile.md` |
| 2026-08-27 | **Staging deploys serialized** (`concurrency: deploy-staging`). | "two rapid merges once ran `docker compose up -d --build` concurrently ... staging 502'd" (workflow comment; OPEN.md row 183) | `a12481f2`. No CHANGELOG row (a workflow file) |
| 2026-09-10 | **SHA-matched deploy-run poll** in the cycle skills, and "never smoke-test without a watched run". | A `--limit 1` lookup "returns the previous run and the smoke tiers then pass against the old container" | #626, #628; OPEN.md row 251 (caught on PR #622) |
| 2026-09-13 | **The test gate reports its own run truthfully**: per-run records under `tmp/gate-runs/`, read back by `npm run gate:status`. | "background-completion notices said exit 0 for failing runs ten times", among five failure modes | #662; ADR `honest-test-gate/0001` |
| 2026-09-18 | **Reviewer step 10**: re-derive every fix on a later round, including the reviewer's own suggested wording. | Three blocking fixes "adopted round 1's suggested wording", which is "how an unverified reviewer phrase enters a record with two roles' apparent endorsement" | #673; `reviews/harness-self-improvement/stranded-close-2026-09-18.md` |
| 2026-09-19 | **Ledger rows get date+slug ids and their own files**; the `OPEN.md` table is frozen; lint L15. | "eleven renumbering or de-duplication events between 2026-08-07 and 2026-09-18, ten of them after 'fetch before you mint' was written down" | #697; ADR `ledger-row-identity/0001` |
| 2026-09-20 | **`OPEN.md` renders as one table again**, with lint L16, and the roll-up scanners stop dropping items. | The table "rendered broken on GitHub for 67 days"; "a scanner that quietly drops an item converts 'nobody looked' into 'we checked and there was nothing there'" | #700, #706 |

Two patterns stand out. First, almost every row starts from an observed failure: a session that re-derived a step, a gate that "guarded nothing", a scanner that failed closed. That is rung 1 working as IH intends. Second, the loop keeps turning prose into mechanism: lint checks, required CI checks, a guard that cannot be edited away from a branch, a gate that records its own verdict. That is the literature review's first recommendation, "make the writable-surface boundary mechanical", being carried out without IH's help.

## The hold-axis map for Tapestry

Tapestry does not use L-numbers. This map is a **proposal** that places its existing rules on the scale in [`hold-axis.md`](../hold-axis.md).

| Level | Tapestry items | Repo basis |
|---|---|---|
| **L0** Locked | $G^2$ as stated above, including the rule that it covers all three kinds of instance. The product vision and the principles marked "Non-negotiable". Production promotion: only an explicit human "yes" merges to `main`. The rule that `main` accepts only `staging`, `promote/*` or `hotfix/*` (a required check that a PR cannot edit away). The ban on ad-hoc per-session gate pre-authorization. | David, 2026-09-27; `ROADMAP.md`; `cycle-full` "Critical: production gate"; `guard-main-source.yml` plus ruleset; `CLAUDE.md` "How to operate" step 4 |
| **L1** Sign-off | The four architecture invariants (invariant 4 was added on an "owner decision 2026-07-24"). Every phase gate in the standard flow. Book completion. The goal an operational Direction run derives from. Branch deletion and promotion offers at close. Harness-definition changes in practice: 18 of the 38 CHANGELOG rows dated 2026-07-28 or later cite an operator or owner ratification, ask or decision (my grep). | `CLAUDE.md`; CHANGELOG 2026-07-25; `engineering-team/README.md` "The user is the approval gate"; `workflows/6-book-close.md` step 13 |
| **L2** Reviewed | Every code change: a Reviewer PASS before merge, and `stack-free` green before `main`. Light-profile interior gates J1–J3 and Direction-mode gates, answered by blinded judges. Doc-lane changes, which get a claims-adherence review. The `LEGACY_*` TA-pubkey constants ("A reviewer who sees a diff removing `LEGACY_*` constants without an accompanying re-parenting migration MUST reject"). | `workflows/5-review.md`; ruleset; `light-profile.md`; CHANGELOG 2026-08-18; `CLAUDE.md` ADR 0015 note |
| **L3** Disclosed | The written rule for harness-definition changes: a CHANGELOG row with why and origin (L10). Lint waivers, which must carry a citation and print as `WAIVED`. Raising the `CLAUDE.md`/`AGENTS.md` line caps ("un-freezing is an L10-visible CHANGELOG event"). A harness defect, which "gets a `meta` row before the session ends". | `engineering-team/README.md` § "Tuning the team"; `scripts/harness-lint-waivers.txt`; CHANGELOG 2026-07-04; `CLAUDE.md` `OPEN.md` row |
| **L4** Free | Ledger rows (open and close). Stories, reviews and audits as records ("changing a record is not a harness change"). `design-philosophies/`, deliberately "not registered" as a harness path. **In practice, `.github/workflows/`**, which carries two required gates but is not a harness-definition path. | `OPEN.md` § "How to use this ledger"; `harness-def-paths.txt` header; CHANGELOG 2026-09-19 |

Three mismatches are worth flagging.

1. **Harness changes: written L3, practised L1.** The rule only requires disclosure, but about half the recent changes cite a human ratification or ask. They arguably belong at L1 in writing too, at least for `CLAUDE.md` and the gate rules. (Physics had the opposite pattern: rules written as L3 that were reviewed first in practice.)
2. **CI workflows sit at L4 but guard L0 and L2 items.** A change to `test.yml` or `guard-main-source.yml` owes no CHANGELOG row. The guard's own addition on 2026-08-07 has none. Promoting `.github/workflows/` into `harness-def-paths.txt` would put these gates under L3 at once. That is a promotion, so under hold-axis §4 it is always allowed.
3. **L0 is L0 by convention.** `nous-clawds4`, the account that opens most PRs, is an admin of the repo (`permissions.admin: true`) and could edit the ruleset. This is the same gap the literature review found in IH itself (§5, recommendation 1). The mitigation is the same: ruleset administration in David's own account, or CODEOWNERS with David as owner.

## What rung 1 still lacks

**No prediction per change.** The CHANGELOG records *why* and *origin* but not *what should happen next*. The literature review's second recommendation (AHE-style prediction manifests) maps directly onto two new columns: "Prediction" (for example, "no more stale-run smoke passes") and "Outcome" (filled in at the next retro or book close). Without them, rung 2 has nothing to score.

**Its own score reads zero.** `harness-stats.sh` reports "kick-back rate: 0%" because it divides *final* CHANGES_REQUESTED verdicts by decided reviews, and a review file that ends in PASS after a CHANGES_REQUESTED round counts as a pass. My grep found 41 review files carrying a CHANGES_REQUESTED verdict token. The Direction-gate tally (14 kick-backs out of 114 decisions) was added on 2026-08-04 because the retro instrument "was structurally blind to exactly the books that generate most rework". The review-file half has the same blindness. The median cycle time "0d" is likewise saturated at day resolution.

**Rules that live outside the repo.** The 2026-08-18 harness review behind the Light profile is cited as a claude.ai artifact link (`light-profile.md`, line 4), not a repo file. Agent memory is named in step 13 as a source of "a false map that reads as authoritative". Physics' lesson applies: "the rung above cannot audit a harness rule nobody can read."

**The ledger grows faster than it closes.** 239 of the 342 numbered rows still read OPEN (my count, using the same status rule as `scripts/lib/collect-meta.sh`), and 73 of the 85 row files do. The meta-escalation banner (≥3 open or >30 days) has presumably been lit continuously **(inference)**, which weakens it as a signal.

**No check that a change serves every kind of instance.** Nothing in $H^2_0$ asks whether a change that helps the search service hurts a personal or community instance, or the other way round. The architecture invariants cover part of this (decentralized-first, local-first), but they are prose read at session start, not a gate. A candidate check, a **proposal**: the review template gains one line asking which of the three kinds of instance the change affects and how, so that rung 2 can later count changes that served one kind at another's expense.

**Enforcement gaps the repo already knows about.** A deploy-triggering merge "can skip the safe-to-merge check unnoticed" (review `safe-to-merge-unenforced-2026-09-19.md`). L10 inspects only the latest commit, and four CHANGELOG rows exist solely to "discharge the missed touch-rule". `staging` has no required checks, so a red `stack-free` run on a feature PR does not block its merge into `staging`.

**Candidate scores** (all **proposals**, all measurable from the repo or `gh` today):

- **CI red rate.** `gh run list --workflow test.yml`. Since 2026-08-28: 8 failures among 209 decided runs (about 3.8%), plus 12 cancelled as superseded (my count). Split out red runs on `staging → main` promotion PRs, which already passed staging. There were 3 (2026-09-07, 09-10, 09-11 ET), and each is a failure that escaped the staging gate.
- **Review rounds per story.** Count CHANGES_REQUESTED rounds in `engineering-team/reviews/**` instead of final verdicts, starting with the 41 files above. Pair it with the Direction-gate kick-back tally `harness-stats.sh` already prints.
- **Reverts and hotfixes.** `git log --grep -i '^revert'` and head branches `hotfix/*` into `main`. Since 2026-08-28 both are zero. The last reverts were 2026-06-15 (`cf984ddb`, on `feature-magic-carpet`) and 2026-05-20 (`4b82a739`). This is the DORA change-fail rate the literature review recommends.
- **Ledger flow.** Opened vs. closed per week, from `**Opened:**` and `**Done:**` in `ledger/*.md`. Track the `meta` share separately, because meta rows are rung 1's inbox.
- **Escaped bugs.** `bug`-typed ledger rows whose finding names staging or production, plus red promotion runs, per promotion.
- **Guard trips.** `main-source-guard` failures (3 since 2026-08-28). The count is small, but each one is a rule doing its job, and a rising count would say the rule is not being taught.
- **Harness-change hygiene.** The share of CHANGELOG rows that discharge a missed touch-rule (4 of 72), and the number of harness-affecting files outside `harness-def-paths.txt` (at least `.github/workflows/`).

PR-to-merge time is *not* a useful score here: at a median of about 2.5 minutes it measures only how quickly an agent merges its own reviewed branch.

## Where rung 1 would start

Three targets, each grounded in something above, each with a prediction so that rung 2 will eventually have data:

1. **Make the kick-back score honest.** Change `harness-stats.sh` to count any CHANGES_REQUESTED round, not just the final verdict, and report hours rather than days. *Prediction:* the reported review kick-back rate rises from 0% to roughly the 41-in-282 order of magnitude, and cycle time stops reading "0d". This gives every later rung-1 change a baseline.
2. **Put the gates under the touch-rule, and add prediction columns.** Add `.github/workflows/` to `scripts/harness-def-paths.txt`, and add "Prediction" and "Outcome" columns to `engineering-team/CHANGELOG.md`. *Prediction:* the next workflow change carries a CHANGELOG row, and each new row names an observable effect that the next book close can check.
3. **Close the loop on promotion failures.** The 3 red `stack-free` runs on promotion PRs show that `staging` accepts merges the `main` gate later rejects. Making `stack-free` a required check on `staging`, or at least counting red-at-promotion per promotion, is a small change with a measurable target. *Prediction:* red runs on `staging → main` PRs go to zero. This touches a ruleset, so it is an L1 decision for David, not something the CoS or a Tapestry agent should change on its own.

No rung 2 yet. Tapestry's two operator-commissioned harness reviews (2026-07-02 and 2026-08-18) were a human acting as rung 2. Under the measurement rule in [`../hold-axis.md`](../hold-axis.md) §1, an agent rung 2 waits until rung-1 changes carry predictions and outcomes.

## Changelog

- 2026-09-27: created by the CoS (L3).
- 2026-09-27 (evening): revised by the CoS (L3) after David's answers of 6:55 PM ET. The goal section now states $G^2$ as covering all three kinds of instance David named (individual, community leader with members as customers, and an enterprise search service such as NosFabrica's), records who owns which instance, and replaces the open question about which goal statement governs with David's answer. The hold-axis map places $G^2$ itself at L0. "What rung 1 still lacks" gains a paragraph on the missing check that a change serves every kind of instance.
