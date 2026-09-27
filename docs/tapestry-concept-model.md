# Proposal: an IH concept model for a Tapestry instance

**Status: L3 (disclosed).** The CoS maintains this note under the scale in [`hold-axis.md`](hold-axis.md) and records each change and its reason in the changelog at the bottom. The note began as a proposal. David answered its open questions on 2026-09-27 at 6:55 PM ET, and delegated the smaller ones to the CoS. §7 records his answers and the CoS's decisions, and the rest of the note has been revised to match. With those answers, the CoS created the §4 concepts, with schemas and a small seed set of elements, on the local R&D instance (http://localhost:7778 on David's Mac, owned by Nous) on 2026-09-27 at about 7:03 PM ET. [`../graph/`](../graph/) holds the export and the script. Any write to an instance David owns (tapestry.brainstorm.world, staging.brainstorm.world) still needs his sign-off.

**What David asked for.** A way to represent IH data in his locally running Tapestry instance, using a feature he stressed: the concept graph's Neo4j often holds only *pointers* to data that lives elsewhere (a repo file, a local DB, a URL, a nostr event), in any format. The harness files stay in git, where diffs are auditable, and the graph holds structure plus pointers.

**Sources and honesty.** §1 comes from the Tapestry repo (`nous-clawds4/tapestry`, `main` at `1e518034`, read 2026-09-27). File citations give `path:line` against that commit. §2 comes from two read-only commands run on David's Mac at about 6:15 PM ET on 2026-09-27: GET requests only, no writes, no signing. Everything from §3 on is design. It was marked **proposal** until David's answers of 2026-09-27; the parts his answers settled are now stated as decisions, and §7 says which answer or decision each rests on. Inferences are marked **(inference)**.

## 1. How Tapestry's concept graph works

**A concept is a list header plus a fixed skeleton.** On the wire, a concept is a DList header: kind **39998** (replaceable ListHeader; kinds 9998/9999 are the legacy non-replaceable forms). Its elements are kind **39999** events whose `z` tag holds the header's address (`protocols/drafts/tapestry-concepts.md` § "Event kinds", § "Addressing"). Every node is addressed as `<kind>:<pubkey>:<d-tag>`, and that string is stored as the Neo4j `uuid` (`BIBLE.md` §5). "What makes something a concept is **not its event kind** — it's its **position in the graph**" (kind unification, same draft).

When `create-concept` runs, it mints the header plus the core nodes: a Superset, a JSON Schema, a Primary Property, a Properties set, and the property-tree, core-nodes and concept graphs (`BIBLE.md` §9, §11). It wires them with `IS_THE_CONCEPT_FOR`, `IS_THE_JSON_SCHEMA_FOR` and similar edges (§6). The **class thread** `ConceptHeader → IS_THE_CONCEPT_FOR → Superset → IS_A_SUPERSET_OF* → HAS_ELEMENT → element` is how elements are found (§6).

**Instances and properties.**

- **Each instance is a kind-39999 event.** Its data sits in a `json` tag in "word-wrapper" format (`BIBLE.md` §8). The second-brain concepts use one top-level section per concept, for example `{"externalResource": {...}}` (`src/api/normalize/index.js:2613`).
- **Properties come from the concept's JSON Schema.** `POST /api/normalize/save-schema` takes `{concept, schema}` (`src/api/normalize/index.js:1907`), and the property tree (Property nodes, `IS_A_PROPERTY_OF`) is generated from the schema (`BIBLE.md` §6).
- **Uniqueness is not enforced by the server.** "`x-tapestry.unique` is advisory only — no server code enforces it"; each write endpoint that cares must refuse duplicates itself (second-brain ADR 0004, Context).

**Relationships.**

- **Most relationships are derived** from event structure: the `z` parent pointer, and the `n`/`s` class-thread tags. "Only editorial/provenance relationships (IMPORT, SUPERCEDES, PROVIDED_THE_TEMPLATE_FOR, ENUMERATES) are explicit nostr events" (`tapestry-concepts.md`).
- **Hand-made edges are narrow.** `POST /api/normalize/add-relationship` adds a single Neo4j-only edge, but its whitelist is just `HAS_ELEMENT` and `IS_A_SUPERSET_OF` (`BIBLE.md` §11).
- **The `b` tag carries pointers between nodes.** On a 39998 or 39999 event, `["b", <address>, "pointer"]` derives `REFERENCES {source:'b-tag'}`, which is "a bookmark, not agreement". `"inherit"` derives `INHERITS_FROM` (`BIBLE.md` §22, §25).
  - On current `main` no general endpoint authors a `b` tag. `POST /api/normalize/set-b-tag` exists only in the open **PR #759** (vcavallo), which targets `main` from a feature branch and fails the repo's `main-source-guard`.
- **The second brain links by record field, never by edge.** A pointer is a field in the element's JSON (a goal slug, say) that is dereferenced at read time "by grouping — never an edge". The `HAS_RESOURCE`-edge option was rejected because it needs the whitelist extended and "would not survive export/restore" (ADR `second-brain/0004`, Decision 2 and Option B).

**How concepts are created.** There are five routes.

| Route | Mechanism | Citation |
|---|---|---|
| UI | Concepts → New Concept calls `createConcept({name, plural, description})` → `POST /api/normalize/create-concept` | `ui/src/pages/concepts/NewConcept.jsx:5,32`; `ui/src/api/normalize.js:17` |
| HTTP API | `POST /api/normalize/create-concept` with body `{name, plural?, description?, dTag? \| random? \| nonce?, conceptHeaderOverrides?}`, then `save-schema {concept, schema}`, then `create-element {concept, name, json}`. Plus `save-element-json {uuid, json}` and `set-json-tag`. | routes `src/api/normalize/index.js:5472-5474`; handlers `:1183`, `:1907`, `:1760` |
| Purpose-built brain writes | `create-child-goal`, `update-goal-intent`, `create-resource`, `verify-resource`, `create-work-record`, `note-goal-idea`, `make-proposal`, `approve-proposal`, `skip-proposal`, `record-priority-signal`. Each validates its input and refuses by name (e.g. `goal-not-found`, `resource-exists`). | `src/api/normalize/index.js:5476-5485`; handlers `:2190`, `:2523`, `:2831`, `:3158`, `:3266` |
| CLI | `tapestry concept add <name> [items...]`, `tapestry concept element <concept> <name>`, `tapestry concept schema <concept>` (tapestry-cli, a separate public repo) | `BIBLE.md` §12. The tapestry-cli repo was last pushed 2026-03-27, so it may lag the API **(inference)** |
| Nostr | Any key may publish kind 39998/39999 events. A client-signed event reaches the local relay through `POST /api/strfry/publish`, which verifies the signature and is otherwise permissionless. Firmware concepts come from `firmware/active/` via `POST /api/firmware/install`, which itself calls `create-concept`/`create-element`. | `src/api/strfry/commands/publishEvent.js:74-92`; `src/firmware/install.js:171,245`; `BIBLE.md` §7 |

**Who may write.**

- **The middleware gate.** `/api/normalize` is on the owner-only POST list (`src/middleware/auth.js:423`). A request passes if it comes from an owner session (a NIP-07 sign-in) **or** from a "genuinely-direct-local" caller: loopback peer and no proxy header (`req.localTrusted`, `auth.js:343-363`).
- **The handler gate.** The brain write handlers re-assert `isOwner(req) || req.localTrusted` (for example `:2192-2195`).
- **What this means for agents.** A local agent that reaches the app over loopback (brainstorm-harness does it with `docker exec … curl`) passes the same gate as the owner. From the Mac host, `localhost:7778` is not loopback inside the container: the brain read `GET /api/brain/goals` answered 403 (§2).

**Signing.**

- **Every normalize write is TA-signed.** It is signed with the instance's Tapestry Assistant (TA) key, loaded from secure storage at startup (`loadTAKey`, `src/api/normalize/index.js:90`; `signAndFinalize`, `:105`). It is then written to local strfry by `strfry import` (`publishToStrfry`, `:115`) and imported into Neo4j (`importEventDirect`).
- **These writes stay local.** The second-brain writes are "local-only, never publishEverywhere" (`:2129`).
- **What the keys mean.** `BIBLE.md` §31: the TA is "the instance's 'me'" and a hot server key. The owner's key is "cold — interactive signing (NIP-07 / external signer); never held server-side". Owner-authored letters enter the brain "only by an explicit, auditable act".
- **Unsigned state exists too.** Event-less nodes (`add-subset`) and the relationship primitives are Neo4j-only and unsigned. Under §30 such state is precious, and "only a Neo4j backup preserves" it.

**How external pointers are expressed today.**

1. **The `tapestry external resource` concept** (second-brain ADR 0004, 2026-07-23): `locatorKind` is one of `file`, `vault-note`, `nostr-event`, `repository` or `web-address` (`src/api/normalize/index.js:2409`), and `locator` is a free string. Each resource also carries a title (stored as `name`), `whyKept`, `keywords`, `notedOn`, `lastVerified` and `lastVerifyStatus`. Freshness (`current`/`stale`/`unreachable`) is derived at read time. Its identity is (goal, locator), and it must attach to exactly one existing goal (`createResource`, `:2554`). The concept's own description reads: "The brain organizes knowledge; it never contains it."
2. **Record fields** naming another element's slug (the `parent` and `goal` idiom above).
3. **Pointer-typed `b` tags** to any nostr address (§22).
4. **`lmdb:<tapestryKey>`**, which offloads a large `json` value to the local LMDB store. It is a storage detail, not a semantic pointer (§8, §29).

**Instances and owners** (David, 2026-09-27). Anyone can run a Tapestry instance, and every instance has exactly one Owner. David (straycat) owns tapestry.brainstorm.world and staging.brainstorm.world. The local instance at http://localhost:7778 on David's Mac is owned by Nous. The whole Tapestry repo is R&D, and the local instance is one of several R&D instances; if its concepts get messed up, it is not the end of the world. The Owner is who `isOwner(req)` recognises, and the TA key is that instance's server key, so on the local instance a TA-signed record means "written by something running on Nous' instance", not "approved by David".

## 2. What the local instance showed

Two read-only commands against `http://localhost:7778` on David's Mac (`/api/status`, `/api/firmware/versions`, `/api/audit/firmware`, the two primitive probes, `/api/brain/goals`, `/api/concept-graph/summaries`, and `/neighbors` for six concepts):

- **Running and current enough.** strfry up 30 days; firmware **v1.0.0** active; the `relationship-primitives` and `node-primitives` probes present. I found no endpoint that reports the running commit, so the code version is unknown.
- **TA pubkey `11f23fe4…`.** This is the same prefix second-brain ADR 0004 cites from its "live instance" recon, so that design was probably reconnoitred on this instance **(inference)**.
- **63 concept headers**, including: `tapestry owner goal` (35 elements), `tapestry proposal` (10), `tapestry work record` (8), `tapestry external resource` (**0**), `tapestry restore drill` (1), `goal set` (2), `word` (584), `trusted dictionary snapshot` (117), `adoption disposition` (294).
- **Four concepts that appear in no repo code, docs or ADRs I searched** (my `git grep`). I guessed that David created them by hand. That guess was wrong: David says Nous' Tapestry Assistant authored them in July, probably for the dormant Goals feature. IH does not reuse them (§7, answer 4):
  - `tapestry team` (2 elements): "Something that can be handed a goal and carry it out: a team of roles, a script, or a single session given a prompt. Each entry POINTS at where it is really defined; its internals never live here."
  - `tapestry executive action` (4): "A standing instruction the Executor runs again and again — the top-level loop that tends the goal concept and mediates attention…"
  - `tapestry privacy level` (3): "levels of privacy for data stored in the second brain…"
  - `maturational state of a concept` (7).
- **`project for the engineering team`** (5 elements) is named in a second-brain story but is a different idea: "outlines of new features or bug fixes for tapestry…".
- **Owner-only reads are closed from the host.** `GET /api/brain/goals` → HTTP 403 "Owner access required", as expected from outside the container.

**The lesson from §2:** the local instance already has several parts IH needs. `tapestry owner goal` is a goal with a statement, a "done means" and a "stays inside". `tapestry external resource` is the pointer. `tapestry proposal` is an append-only sign-off loop. `tapestry work record` is an append-only log. The model below reuses them where they fit. It does not reuse `tapestry team`, even though its description reads well for agents, because David asked that the four July concepts be left alone unless they turn out surprisingly well suited, and a harness or agent needs fields that `tapestry team` does not define.

## 3. Design principles

1. **Git holds the text; the graph holds structure and pointers.** Every harness file, goal text and review stays in git. A graph element names it by a pointer pinned to a commit, with the branch recorded next to it for readability (§7, decision B). Pinning the SHA keeps the audit trail. Tracking a moving branch would not.
2. **Append-only facts for anything that changes.** Changes, predictions, outcomes, re-ratings, rulings and evaluations are new elements, never edits. This follows `tapestry proposal` and `tapestry work record` ("Never edited; corrections are new records").
3. **Link by record field holding the target's address.** A relationship is a field in the record's JSON section whose value is the target's full address (`39999:<pubkey>:<d-tag>`, or `39998:…` for a concept), dereferenced at read time. This is the second brain's idiom, with addresses in place of slugs (§7, decision A). It does not depend on `set-b-tag` or PR #759.
4. **Reuse by default.** An existing concept is reused wherever its meaning fits, and David encourages this. When two use cases turn out not to be well aligned, the concept graph will support forking the concept into two or more distinct concepts, so reuse now does not lock anything in. Only the IH-specific concepts are new, and they get an `ih ` name prefix so they cannot collide with second-brain data.
5. **The graph records the hold axis; git enforces L0** (§6). On the local R&D instance, records are signed with the instance key, and David's personal key is not required.

## 4. Proposed concepts

Here "fields" means the concept's JSON section. `→` marks a record-field link: a field holding the target's address. Every record also carries `name`, `slug` and `description`, as the second-brain records do. A **pointer** is an object with the external-resource vocabulary plus the pin (§7, decision B).

| Concept | Reuse or new | Fields | Links | External pointers |
|---|---|---|---|---|
| **Project** $P^i$ | new `ih project` | `index` (0, 1, 2 …), `name`, `status`, `openedOn` | → `goal` ($G^i$), → `baseHarness` ($H^i_0$), → `agent` ($A^i$) | `repository` (the project repo) |
| **Goal** $G^i_j$ | **reuse `tapestry owner goal`** | `statement`, `deliverable` (done means), `boundary` (stays inside), `origin`, `capturedOn` | → `parent`. A rung goal $G^i_j$ ("improve $H^i_{j-1}$") is a child of $G^i$ | a `tapestry external resource` on the goal, pointing at the **original** goal text at a pinned SHA, for the drift check (d) |
| **Harness** $H^i_j$ | new `ih harness` | `j` (the rung index), `version` (commit SHA), `branch`, `status` | → `project`, → `rung` (the rung that produced it; none for $H^i_0$), → `supersedes` (previous version) | `locators`: one pointer per harness-definition path |
| **Rung** $j$ | new `ih rung` | `project`, `j`, `scoreDefinitions`, `minHistory` (the §1 measurement gate), `mode` (`separate` or `merged-into-lower`) | → Goal ($G^i_j$), → `improves` Harness ($H^i_{j-1}$), → Agent ($A^i_j$) | none |
| **Agent** $A^i_j$ | new `ih agent` (not `tapestry team`; see §2 and §7) | `role` (PM, Rung Manager, reviewer…), `model`, `account` | → `runs` (Harness), → `rung` | `definition` (agent definition file); `web-address` for an external model |
| **Skill** | new `ih skill` | `name`, `holdLevel` (the strictest consumer's, per lit. review §7), `provenIn` | → `usedBy` [Harness …] | `repository` (`SKILL.md` at a SHA) |
| **HarnessChange** | new `ih harness change` (append-only) | `summary`, `why`, `origin`, **`prediction`** `{expect, atRisk, metric, horizon}`, `diffAudit` `{weakenedDefinitions, removedChecks, demotions}` | → `modifies` Harness, → `madeBy` Rung, → `touches` [Item …] | **evidence**: PR / commit `web-address` or `repository` locators |
| **ChangeOutcome** | new `ih change outcome` (append-only) | `verdict` (`confirmed`, `refuted`, `reverted`, `inconclusive`), `before`, `after`, `observedOn` | → HarnessChange, → [Evaluation …] | evidence locators |
| **HoldLevel** | new `ih hold level`, five fixed elements L0–L4 | `rank` (0–4), `label` (Locked, Sign-off, Reviewed, Disclosed, Free), `whoMayChange`, `requires` (the table in `hold-axis.md` §3) | none | `repository` (`hold-axis.md` at a SHA) |
| **Item** | new `ih item` (a rule, check, definition or file placed on the axis) | `itemType`, `summary` (short; the text stays in git), `holdLevel` (**derived** from the latest valid Rating) | → Harness, → HoldLevel | `repository` locator with an anchor |
| **Rating** | new `ih hold rating` (append-only) | `from`, `to`, `direction` (promote or demote), `reason`, `proposedBy` | → Item, → Ruling (required for a demotion) | none |
| **Ruling** | new `ih ruling` (§6) | `decision` (approve or refuse), `reason`, `ruledBy`, `ruledOn` | → `decides`: the Rating or HarnessChange it decides | `evidence`: the git commit or PR where the ruling is recorded |
| **Score** $S^i_j$ | new `ih score` | `name`, `method`, `heldOut` (bool), `direction` (higher or lower is better) | → Rung | `repository` (the script that computes it) |
| **Evaluation** | new `ih evaluation` (append-only) | `value`, `n`, `measuredOn`, `window` | → Score, → Harness version or → HarnessChange | `web-address` (a `gh` run, a PR), `repository` (an output file) |

The prediction and outcome pair is the literature review's second recommendation (AHE-style, §4 and §8.2). A HarnessChange with a ChangeOutcome is exactly one rung-2 data point.

```mermaid
flowchart LR
  P[ih project P^i] -->|goal| G[tapestry owner goal G^i]
  G -->|parent of| GJ[owner goal G^i_j]
  P -->|base harness| H0[ih harness H^i_0]
  R[ih rung j] -->|goal| GJ
  R -->|improves| H0
  R -->|runs| A[ih agent A^i_j]
  H1[ih harness H^i_j] -->|rung| R
  C[ih harness change] -->|modifies| H0
  C -->|made by| R
  C -->|touches| I[ih item]
  O[ih change outcome] -->|of| C
  O -->|uses| E[ih evaluation]
  E -->|measures| S[ih score S^i_j]
  S -->|belongs to| R
  I -->|holdLevel| L[ih hold level L0..L4]
  RT[ih hold rating] -->|re-rates| I
  RU[ih ruling] -->|decides| RT
  K[ih skill] -->|used by| H0
  K -->|used by| H1
  H0 -.->|locator| GIT[(git: harness files @sha)]
  C -.->|evidence| PR[(PR / commit)]
  G -.->|external resource| GT[(original goal text @sha)]
  E -.->|evidence| RUN[(CI run / file)]
```

Solid arrows are record-field links. Dotted arrows are pointers out of the graph.

**Why a goal reuses `tapestry owner goal`.** On the local instance, an owner goal is the instance owner's goal, and the owner is Nous, while $G^i$ is David's. The concept's fields (statement, done means, stays inside, parent) fit $G^i$ exactly, so under principle 4 it is reused. If "a goal the owner holds" and "a goal a project serves" pull apart, it is the first candidate for a fork. The same goes for `tapestry external resource`: its identity rule ties each resource to exactly one goal, so IH records that are not goals carry their pointers as fields with the same vocabulary (`locatorKind`, `locator`) instead of as resource elements.

## 5. Instantiation examples

These illustrate the shape. They were written before David's answers and nothing in this section was sent. Placeholders in angle brackets are values that are not known.

**Physics, $P^1$** (facts from [`examples/physics.md`](examples/physics.md)):

- `ih project` "physics": `index: 1`, repository `github.com/nous-clawds4/physics`.
- Goal: a `tapestry owner goal` whose `statement` quotes the *Statement of the Problem* essay's opening. Its external resource points at that essay at `<sha>:<path>` (the path is not recorded in physics.md).
- `ih harness` $H^1_0$ at `<sha>`, with locators for `papers/`, `public-papers/observer-space-framework/`, `versions/` and `reviews/`.
- `ih item` "No $\lvert a\rvert^2$ in by hand": `holdLevel` L0. Its Rating has direction promote, from none to L0, and needs no Ruling.
- `ih item` "cover notes for the external referee": proposed at L2. Currently cover notes are merged without review, so this Rating is a promotion.
- `ih harness change` "panel rules (a) and (b)" (2026-09-27): `why` "external review #128 found at least eight outline bullets dropped or weakened after three panel PASSes". Evidence #128, #130, #131, #132. `prediction` (a **proposal**, since no prediction is recorded in the repo): "the next external review finds no dropped or weakened outline bullets". Its ChangeOutcome stays open until the v0.6 external review (cover #145) returns.
- `ih evaluation` for the score "panel catch rate", v0.5: 3 panel PASSes (#124–#126), then 6 must-fix items from #128.

**Tapestry, $P^2$** (facts from [`examples/tapestry.md`](examples/tapestry.md)):

- `ih project` "tapestry": `index: 2`, repository `github.com/nous-clawds4/tapestry`.
- Goal: a `tapestry owner goal` whose statement quotes the README's first sentence. External resources point at `README.md` and `ROADMAP.md` at `1e518034`.
- `ih harness` $H^2_0$ at `1e518034`, with one locator per line of `scripts/harness-def-paths.txt`.
- `ih item` "PRs into `main` only from `staging`, `promote/*` or `hotfix/*`": proposed L0. Its locator is `.github/workflows/guard-main-source.yml@1e518034`, plus a `web-address` for ruleset 15863292.
- `ih harness change` "main-source-guard" (2026-08-07, PR #517): `why` quotes the workflow comment about PR #446. `prediction` is retrofitted and marked as such: "no feature-branch PR merges into `main`". ChangeOutcome `confirmed`: since 2026-08-28 every PR merged into `main` came from `staging` or `promote/*`, and the guard failed 3 runs (PRs #583 and #759) (my count).
- `ih harness change` (proposed): "count every CHANGES_REQUESTED round in `harness-stats.sh`". `prediction`: "the reported kick-back rate rises from 0%".
- `ih skill` `cycle-staging` (`.claude/skills/cycle-staging/SKILL.md@1e518034`), `usedBy` $H^2_0$.
- For cross-fertilization, a future `ih skill` "literature review" (IH's own `docs/literature-review.md` method) would be `usedBy` the rung-1 harnesses of both $P^1$ and $P^2$. The query "skills used by more than one harness" is then a grouping over `usedBy`.
- `ih evaluation` for "CI red rate" (`stack-free`), 2026-08-28 to 2026-09-27: 8 of 209 decided runs; evidence `gh run list --workflow test.yml`.

What one element looks like when created through the generic API. It follows the decisions in §7: links are addresses, and pointers pin a commit. The JSON section's key is the concept's primary-property key (`ihHarnessChange` for `ih harness change`), which is how `create-concept` names it. The d-tag is passed explicitly and equals what `create-element` would derive by default (`slug(name)-hash8(conceptAddress)`, `src/lib/dtag.js:51`), so a record's address is known before it is written. This example was not sent.

```json
POST /api/normalize/create-element   (example; not sent)
{ "concept": "ih harness change",
  "name": "tapestry main-source-guard 2026-08-07",
  "dTag": "tapestry-main-source-guard-2026-08-07-<hash8>",
  "json": { "ihHarnessChange": {
      "name": "tapestry main-source-guard 2026-08-07",
      "slug": "tapestry-main-source-guard-2026-08-07",
      "description": "PRs into main only from staging, promote/*, hotfix/*",
      "modifies": "39999:<TA pubkey>:<d-tag of the H^2_0 record>",
      "madeBy": "39999:<TA pubkey>:<d-tag of the tapestry rung-1 record>",
      "summary": "PRs into main only from staging, promote/*, hotfix/*",
      "why": "PR #446 bypassed staging (workflow comment)",
      "prediction": { "expect": "no feature-branch PR merges into main",
                      "metric": "main-source-guard failures; non-allowed heads merged",
                      "horizon": "rolling", "retrofitted": true },
      "evidence": [ { "locatorKind": "web-address",
                      "locator": "https://github.com/nous-clawds4/tapestry/pull/517" },
                    { "locatorKind": "repository",
                      "locator": "github.com/nous-clawds4/tapestry@1e518034a9e0277a79d27747bb26ece59c55023d:.github/workflows/guard-main-source.yml",
                      "repo": "nous-clawds4/tapestry", "branch": "main",
                      "commit": "1e518034a9e0277a79d27747bb26ece59c55023d",
                      "path": ".github/workflows/guard-main-source.yml" } ] } } }
```

A purpose-built `ih` write endpoint, like the second brain's, would be better than `create-element`. It could refuse a HarnessChange with no prediction, a demotion with no Ruling, or a duplicate locator, as `create-resource` refuses today.

## 6. Recording and enforcing the hold axis in the graph

**Recording is easy.** An Item's current level is derived at read time from its append-only Ratings, much as the second brain derives a goal's standing and a resource's freshness. A rung-2 audit becomes a query: every Rating with `direction: demote` and no valid Ruling, and every HarnessChange whose `diffAudit.demotions` is non-empty. Those are flagged, not scored (lit. review §5, idea 3). Because the text stays in git, a level change shows up in the git diff as well (`hold-axis.md` §6). The graph adds the cross-project view that git lacks.

**Enforcing is harder, because every write looks the same.**

- Every `/api/normalize` write is signed by the same TA key.
- The gate is `isOwner(req) || req.localTrusted` (`auth.js:343-363`), so an agent reaching the app over loopback passes it exactly as the owner does.
- `approve-proposal` has the same gate (`src/api/normalize/index.js:3266-3270`).
- So a TA-signed "approval" proves only that *something local* wrote it. This is the brainstorm-harness weakness in another form: `bin/rule`'s TTY-plus-"owner" gate is, in its own words, "not cryptographic" (`assessments/brainstorm-harness.md` §2).

**Decision: L0 stays in git; the graph is the record, not the lock** (David, 2026-09-27, answer 3). The local instance is an R&D instance owned by Nous, so IH records there are signed with the instance's TA key, and David's personal key is not required. The graph therefore cannot prove who approved a demotion, and it does not try to. Enforcement lives where it already lives: the L0 and L1 items are files in the IH repo, and a change to them is a git commit that David makes or signs off. An `ih ruling` element records that decision and points at the commit or PR where it was made (its `evidence` pointer), so a reader who doubts a ruling checks git, not the signature.

**Kept for later: owner-signed rulings.** On an instance where David is the Owner, a stronger form is available without new server code. An `ih ruling` would be a kind-39999 event signed with the Owner's key through NIP-07 and published client-signed through `POST /api/strfry/publish`, which verifies the signature but gates nothing else (`publishEvent.js:74-92`). Readers would accept a demotion only if a matching Ruling has `pubkey == OWNER_PUBKEY`, which is the asymmetry rule of `hold-axis.md` §4 made cryptographic. `GET /api/brain/direction/:slug`, which "fails CLOSED" on anything unjudged (Tapestry `engineering-team/CHANGELOG.md`, 2026-07-26), is the pattern such a reader would follow. Two costs keep this on the shelf: client-signed events land in strfry but are not imported into Neo4j at publish time (`BIBLE.md` §6, §31), and nothing on the local instance needs it.

**Relay privacy.** Normalize writes are local: `publishToStrfry` pipes the event to `strfry import` (`src/api/normalize/index.js:115`), and nothing in the handler publishes outward. The one server-side path to public relays is the strfry router, whose streams are listed by `GET /api/strfry/router-status` and written to `/etc/strfry-router-tapestry.config` (`src/api/strfry/routerStatus.js`, `routerConfig.js`). If the `dcosl` preset (both directions, kinds 9998/9999/39998/39999) were enabled, IH events would be mirrored to public relays (`BIBLE.md` §14 "Router Presets"). §7, decision C sets the rule every IH writer follows.

## 7. David's answers and the CoS's decisions (2026-09-27)

David answered at 6:55 PM ET on 2026-09-27. His four answers are summarised first, then the decisions he delegated to the CoS. The eight open questions this section used to hold are all resolved here; the last list says where each one went.

**David's answers.**

1. **$G^2$ covers every kind of instance.** Anyone can run a Tapestry instance: an individual for personal use, a community leader whose "customers" are the members of the community, or an enterprise such as NosFabrica running it as a service that will be an alternative to Google search in at least some contexts. The ladder must understand and protect all of these use cases. [`examples/tapestry.md`](examples/tapestry.md) now states $G^2$ that way.
2. **Reuse concepts wherever it makes sense.** Reuse is encouraged. The concept graph will ultimately support forking a concept into two or more distinct concepts when use cases are not well aligned (principle 4).
3. **Each instance has an Owner, and the local instance is R&D.** David owns tapestry.brainstorm.world and staging.brainstorm.world; Nous owns the local instance. Signing IH records with the instance key is acceptable there, and David's personal key is not required. L0 protection stays in git (§6).
4. **Leave the four July concepts alone.** `tapestry team`, `tapestry executive action`, `tapestry privacy level` and `maturational state of a concept` were authored by Nous' Tapestry Assistant in July, probably for the dormant Goals feature. IH does not reuse them. Agents get their own concept, `ih agent`.

**Decisions delegated to the CoS.**

- **A. Links are fields holding addresses.** A link is a field in the record's JSON section whose value is the target's full address (`39999:<pubkey>:<d-tag>`, or `39998:<pubkey>:<d-tag>` for a concept). A field that can name several targets holds an array of addresses. An address is what Neo4j stores as `uuid`, so a reader can join on it directly, and unlike a slug it is unique across concepts and authors. IH writes pass an explicit d-tag equal to `create-element`'s default derivation, so an address is known before the record is written and two records can point at each other. The model does not depend on PR #759 or on `set-b-tag`. If pointer-typed `b` tags land later, they may be added alongside the fields, and the fields stay authoritative.
- **B. Pointers pin a commit and record the branch.** A pointer into git is an object: `{ "locatorKind": "repository", "locator": "github.com/<owner>/<repo>@<full sha>:<path>[#anchor]", "repo": "<owner>/<repo>", "branch": "<branch>", "commit": "<full sha>", "path": "<path>" }`. The `locator` string alone is enough to resolve it; the other fields make it readable and queryable. `branch` records which line of history the commit was read from and is never used to resolve the pointer. Pointers of other kinds (`web-address`, `nostr-event`) use the same object with only `locatorKind` and `locator`.
- **C. Relay privacy is confirmed before every write.** An IH writer refuses to write unless it confirms, in the same run and immediately before writing, that: the `dcosl` preset is present and disabled; no enabled stream with direction `up` or `both`, in either the router state or the router config file, has a filter that could match an IH event (by kind, author or tag); and no `strfry sync` with direction `up` or `both` is running or scheduled. If any of this cannot be read, the writer treats it as a failure and writes nothing. IH data stays on the machine. On 2026-09-27 the local instance passed this check. The `dcosl` preset was disabled. Seven outbound streams were enabled, and none could carry an IH event: five `both` streams to dcosl.brainstorm.world are limited by `#z` to firmware tag concepts, and two are limited by kind ([`../graph/README.md`](../graph/README.md)).
- **D. The IH repo keeps a JSON export of the graph.** A `graph/` folder in this repo holds a JSON export of every IH concept and element on the instance, regenerated after each batch of writes, with the instance, the TA pubkey, the date and the commits the pointers were pinned to. Git then remains the audit trail for the graph's structure as well as its text, and another instance can recreate the IH graph from the export.
- **E. Who writes, for now.** A CoS script run on David's Mac calls the normalize API over the container's loopback (`docker exec tapestry …`), which `auth.js` treats as the Owner (`src/middleware/auth.js`, the `isDirectLocal` branch). `create-concept`'s own duplicate check compares against a double-encoded pubkey (the comment at `src/api/normalize/index.js:1255-1259` names the double encoding), so by my reading of the code it cannot match an existing header, so the script checks for existing concepts itself and skips them. A purpose-built `ih` endpoint that refuses a HarnessChange without a prediction, or a demotion without a Ruling, is still the better long-term shape; it would be a Tapestry change and go through Tapestry's own harness.

**Where the old open questions went.** Namespace (old 1): answer 2 and principle 4. The July concepts (old 2): answer 4. Who writes (old 3): decision E. Owner-signed rulings (old 4): answer 3 and §6, kept for later. Edges (old 5): decision A. Locators (old 6): decision B. Privacy (old 7): decision C; `tapestry privacy level` is not used (answer 4). Reproducibility (old 8): decision D.

## Changelog

- 2026-09-27: created by the CoS (L3, proposal).
- 2026-09-27 (evening): revised by the CoS (L3) after David's answers of 6:55 PM ET. Added the instance-and-owner model to §1. Corrected §2: the four July concepts were authored by Nous' Tapestry Assistant, not by David, and are no longer reused. Rewrote §3 around reuse by default (with forking), address-valued links and commit-pinned pointers. In §4, replaced `tapestry team` with a new `ih agent` concept, dropped the owner-signed requirement from `ih ruling`, and explained why `tapestry owner goal` is still reused. Updated the §5 example to the new link and pointer shapes. Rewrote §6: L0 stays in git, TA signing is acceptable on the local R&D instance, owner-signed rulings are kept for later, and relay privacy is spelled out. Replaced the §7 open questions with David's answers and the CoS's decisions A–E.
- 2026-09-27 (night): the CoS (L3) noted in the status line that the §4 concepts now exist on the local instance, and added the result of the first relay-privacy check to decision C. Both link to the new `graph/` export.
