# Worked example: the physics program as $P^1$

This note maps David Strayhorn's physics program onto the Infinite Harness. The project is $P^1$ and lives in the private repo `nous-clawds4/physics`. The note covers the program's goal $G^1$, its base harness $H^1_0$, the rung-1 changes already made to that harness, and where its rules sit on the [hold axis](../hold-axis.md).

**Sources and honesty.** Everything below comes from the physics repo as of 2026-09-27, up to and including PR #145. PR numbers were checked with `gh`. Dates are merge dates in US Eastern time. Anything not evidenced in the repo is marked **proposal** or "(not in repo)". Two rows in the rung-1 table rest on facts David gave the CoS directly; they are marked "(not in repo)" with their source.

## The goal $G^1$

The program starts from what its *Statement of the Problem* essay calls "the idea that physics lacks a precise explanation of what the observer is". The essay asks for:

- a precise definition of the observer as a physical object;
- a precise mathematical definition of the space of all possible observers;
- local equations of motion through that space that restrict which motions are allowed without being fully deterministic;
- measurement modelled as branches in the allowed motions;
- "a probability interpretation that is entirely classical and requires no additional assumptions", from which "the Born rule is truly derived, not merely justified".

The essay argues that such a theory is not excluded by Bell's theorem: "It is a LHV theory, but it is local in observer-space, not in classical spacetime." The repo README frames the payoff. General relativity and quantum mechanics are both to be recovered as approximations, and "the laws of GTR and QM will appear to be valid to the vast majority of observers". That in turn requires one reasonable measure on observers, which the README expects to come from countability, following David's 2008 motivation for outcome counting. Paper 1 states the constraint that matters most for goal protection: typicality must be "well-defined without taking the squared modulus of a Hilbert-space amplitude as a primitive". The public outlines put the same constraint as a firewall: "No $|a|^2$ in by hand as multiplicity."

## $H^1_0$ as it stands

- **Agents.**
  - The **CoS** coordinates and decides merges. All 145 PRs were opened, and all 138 merged PRs were merged, from the shared `nous-clawds4` account.
  - The teammates are **Geometry**, **Literature** and **Ontology**. Every in-house review file in the repo is signed by one of these three (11, 13 and 13 files respectively).
  - **Physics** is listed as a teammate in the CoS's notes, but no review file or PR in the repo is signed by it (not in repo).
  - The **external referee** is Claude, run through Claude Code. Fable 5.1 did rounds 1–3 (#92, #105, #117). Opus 5.5 did round 4 (#128).
- **Two tiers of text.**
  - In-house notes live in `papers/` (63 files, including Paper 1, `papers/observer-space-ontology.md`).
  - The public paper lives in `public-papers/observer-space-framework/`. Its folder README calls it "the readable cut".
- **Version folders.** Drafts go in `versions/` as `vX.Y-outline.md` or `vX.Y-prose.md`, and older versions are never overwritten. There are 12 versions so far, v0.1 to v0.6. Reviews go in `reviews/` as `vX.Y-<label>-<reviewer>.md`, with a required header giving Reviewer, Date and Verdict.
- **Pipeline.** Each version goes through these steps:
  1. outline;
  2. panel review of the outline (Geometry, Literature, Ontology);
  3. PASS;
  4. prose;
  5. panel review of the prose;
  6. a Claude cold pass with a cover note;
  7. a Geometry pressure-test of any external HOLD;
  8. the next outline.
- **Review labels.** Reviews keep four labels apart: Postulate, Hope, Open and Firewall. Reviewers must not "demand a Born derivation".
- **Merge gate.** 51 PR bodies carry "Do not merge unless CoS says", "until CoS / David says" or a similar line.
- **Two public essays** (2026-09-27). *Statement of the Problem* is "strong opinions, strongly held". *Mathematical Foundations* is "strong opinions, weakly held".

## Rung-1 changes already made

These are changes to $H^1_0$ itself, not to the physics. Where the repo records the reason, it is quoted or paraphrased. Where the reason comes from David directly, the source is given. Otherwise the table says the reason is not recorded.

| Date (ET) | What changed | Why | Evidence |
|---|---|---|---|
| 2026-08-30 | **Locks on Paper 1's object.** The jet–patch equivalence and the individuation cut were marked "locked", and "Paper 1 untouched" became a standing constraint in PR bodies and reviews. | Keeps the elementary object fixed while everything around it is explored. | #2 (`papers/observer-space-geometry.md`, "Locked equivalence", "Locked individuation cut"), then carried in nearly every later PR |
| 2026-08-30 | **Standing order: keep going without David.** While David's availability is limited, the CoS continues the program without waiting. It keeps producing honest notes, including kills (results that rule an idea out), and assigns the next open hole instead of stopping at a clean checkpoint: "a clean remainder is not a stop". | David found it frustrating when the program stopped at a clean checkpoint during his absence. | David, direct instruction to the CoS, 2026-08-30 (not in repo). The 78 PRs of 2026-08-30 (#1–#78), many of them kills, are consistent with it |
| by 2026-09-06 | **Stopped the "leftover $R$-property mill".** This was the run of one-note-per-property PRs of the form "X is extra" (#46–#78, all opened 2026-08-30). Its stopping became a checklist item. | Reason not recorded in the repo. The constraint itself is recorded. | #74, #77, #78 left open and never merged; #87 "no R-leftover mill"; #93 "mill still ceased"; a panel checklist row from v0.3 on |
| 2026-09-06 | **Public paper separate from in-house notes, written outline first.** Prose is written only after the panel PASSes the outline. | `papers/` is "crowded with in-house notes"; the public paper is "the readable cut". | #79 (v0.1 outline), #80/#81 (HOLDs), #83 (v0.1.1), #84/#85 (PASS), #87 ("expand PASSed v0.1.1 outline"); restated as a rule in #119, "outline first; prose after panel" |
| 2026-09-06 | **Geometry added to the panel.** v0.1 and v0.1.1 were reviewed by Ontology and Literature only. | Reason not recorded. | #80, #81, #84, #85 vs #90 (first Geometry review, v0.2 prose) |
| 2026-09-06 | **External cold review after the panel PASS.** | The panel PASSed v0.2. The first external read found a HOLE (the CWS singleton) that the panel missed. | #92 (HOLD), confirmed by Geometry #93, leading to v0.3 outline #94 |
| 2026-09-06 on | **Ontology reviews last**, as a self-review of the draft it wrote, after reading Geometry and Literature. | Observed practice. No written rule was found. | v0.3 outline #95 → #96 → #97; v0.6 #131/#132 → #133; #136/#137 → #138; essays #141 → #142 ("Literature's #141 was read first"). Contrast v0.1: Ontology #80 came before Literature #81 |
| 2026-09-07 | **Cover notes for external Claude reviews.** Each note says what changed since the last HOLD and what to re-check. | Rounds 1–2 (#92, #105) had no cover note. From round 3 on, the referee reads the cover first. | #116 (v0.4), #127 (v0.5), #145 (v0.6); the v0.4 review says "with the cover note … (read first, as asked)" |
| 2026-09-27 | **Panel rules (a) and (b).** Rule (a): diff every outline bullet against the next version and log what was dropped or restored. Rule (b): recompute every pinned instance ("compute, don't just check conformance"). A claims-and-pins table (C1–C32) was also added. | The panel PASSed v0.5 (#124–#126). The external review #128 then found "at least eight outline bullets were dropped or weakened", although the changelog said "Outline bullets expanded to full sentences". | #128; #130 ("Process rule"); #131 (28 pins recomputed); #132 ("rule (a) diff … Rule (b)"); #135 (scripted audit of about 190 phrases); #137 (32/32 pins recompute, one wording mismatch caught) |
| 2026-09-27 | **External referee switched from Claude Fable 5.1 to Claude Opus 5.5.** | David switched once Opus 5.5 was released. Until then, Fable 5.1 was the best option available. *Observation:* this is a rung-1 change of the "swap in a better component when one exists" kind. Per-review quota cost is now being tracked: roughly half a week's quota per Ultracode review for Fable 5.1 (David's estimate); much smaller for Opus 5.5 (appears so; measurement in progress). | David, to the CoS, 2026-09-27 (not in repo). Repo: #117 (Fable, round 3) vs #128 (Opus, round 4); the #145 cover is for Opus |
| 2026-09-27 | **Two public essays with precedence.** *Statement of the Problem* changes only with David's sign-off, and every change is logged with the challenge that forced it. *Mathematical Foundations* is panel-reviewed and expected to change often. The Problem essay wins conflicts, and conflicts are raised with David. | Separates what David commits to from the mathematical choices, which should stay revisable. The Problem essay "guides how the program answers reviewers". | #139, #140; reviews #141–#144. These are extractions, not splits: `thread-worth-pulling.md` and `mathematical-framework.md` stay unchanged until David signs off, and Problem v0.1 is still "awaiting David's sign-off" |

## The hold-axis map for physics

The physics repo does not use L-numbers yet. This map is a **proposal** that places its existing rules on the scale.

| Level | Physics items | Repo basis |
|---|---|---|
| **L0** Locked | The *Statement of the Problem* essay text, which is David's own words taken verbatim from `thread-worth-pulling.md`. The firewall "no Born or Einstein claims". "No $\lvert a\rvert^2$ in by hand." | Problem README ("No agent or reviewer edits it on their own"); v0.6 constraint lines; v0.1.1 firewall |
| **L1** Sign-off | Changes to the Problem essay's notes and deferred list. The precedence rule. Changes to `thread-worth-pulling.md` and `mathematical-framework.md`. Merging a note that revises a lock, or adopting a working law. The standing order to keep going without David ("a clean remainder is not a stop"). | Problem README rules 1–4; Foundations README; #104 ("David (2026-09-07) adopted … Option F as working in-house join law"); standing order: David, 2026-08-30 (not in repo) |
| **L2** Reviewed | Adding a hypothesis or working postulate. Each new public version. Every *Mathematical Foundations* version. Cover notes for the external referee, because they steer it (**proposal**: at present they are merged without review). | #131 R2 (three clauses required before $R\ne\emptyset$ could stand as a Postulate); Foundations README rule 1; cover notes #116, #127, #145 have no review files |
| **L3** Disclosed | Revising Paper 1's motion or measure while keeping its object, allowed only if the paper says so plainly. Revising or abandoning an assumption at a genuine dead end ("type (ii) abandonable"). Demoting a working reading. Every drop or restore goes in the changelog. | #128 item 4 → #130/#135 ("object kept, motion revised, measure revised; countability thesis not carried"); #42 (abandonment "named, not taken"); #118/#119 (Option F demoted to E, in the changelog) |
| **L4** Free | Merging PRs that respect the locks. Merging external review files. Banners that keep every original line (#134). Routine docs and README pointers. | CoS merge practice |

In practice the L3 items above also got panel review before merging (for example, the v0.6 motion and measure revision went through #131–#133 and #136–#138). So they could arguably sit at L2. They are placed at L3 because what the rules require is open disclosure, not a prior gate.

The standing order sits at L1, not L0. It is a rule David set about the harness's own behaviour, and only his sign-off changes it. But the CoS may reasonably propose amendments, for example a pause rule when review quota runs short, and proposing is what L1 allows. L0 is kept for the goal and its firewalls.

## What rung 1 still lacks

**No explicit score.** Rung-1 changes so far have been made on judgment, usually right after an external review exposed a miss. These candidate scores are all **proposals**:

- **Panel catch rate.** Count required changes found by the panel before the external review, and required changes the external review found afterwards. The data already exists:
  - v0.5: three panel PASSes (#124–#126), then six must-fix items from #128.
  - v0.6: the panel required two changes to the outline (#131) and four to the prose (#136, #137) before the external pass. The external result on v0.6 is pending (cover #145).
- **Rounds per version.** The number of HOLD → revision cycles before a PASS.
- **Cost per external review.** Quota spent per round and per model. Tracking began on 2026-09-27 (see the model-switch row), but the figures are David's estimate or still being measured, and none are in the repo yet.
- **Drift count.** The number of Problem-essay clauses that a version strains. The Foundations essay already names tensions T1 and T2 and questions Q-D1 to Q-D5 for David.

**Rules that live only in memory or chat.** Until this note, the standing order and the reason for the model switch existed only in the CoS's memory and in chat. Rules like these should be written into the project repo, because the rung above cannot audit a harness rule nobody can read.

**One leak to watch.** The external referee is the held-out evaluator (mechanism (b)). It is only partly held out. It reads a cover note written by the team, and it also reads the in-house reviews. Keeping cover notes short, factual and reviewable is the cheap fix.

**No rung 2 yet.** Four external rounds and one panel-rule change are not enough history to score rung 1's changes. Under the measurement rule in [`../hold-axis.md`](../hold-axis.md), rung 2 waits.
