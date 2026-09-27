# brainstorm-harness: assessment for the Infinite Harness

*CoS assessment, 2026-09-27. Covers `nous-clawds4/brainstorm-harness` (fork) and `vcavallo/brainstorm-harness` (upstream), both at commit `6da972c`. Everything here comes from the code and docs I read, plus `gh` metadata and a few offline test runs. Inferences are marked **(inference)**. Times are US Eastern (ET).*

## 1. What it is

The README describes it as "a human and an LLM agent working together, where everything the pair learns accretes into a personal Tapestry concept graph as a byproduct of real work." The graph is the agent's long-term memory and its documentation. The human owns the ontology: the agent proposes categories and the owner rules on them. There are no protocol changes, but it needs one new Tapestry endpoint, `set-b-tag`.

| Component | What it is |
|---|---|
| `bin/brain` (1,309 lines) | Stdlib-only Python CLI with 24 verbs. It is the agent's only interface to the graph. Reads go over HTTP. Writes run `curl` inside the Tapestry container via `docker exec`, because Tapestry's `auth.js` treats a loopback caller as the operator. |
| `bin/rule` (332 lines) | The owner-only tool for resolving the agent's questions. It refuses to run without a TTY and asks you to type `owner` to confirm. |
| `AGENTS.md`, `CLAUDE.md`, `.pi/APPEND_SYSTEM.md` | The bootstrap: identity, "run `brain resume` first", and the non-negotiable rules. |
| `.pi/skills/` | Three pi-format `SKILL.md` skills: `skill-builder`, `graph-audit`, `query-reusable`. |
| `infra/docker-compose.yml` | A pinned local Tapestry image plus Redis, with every port on 127.0.0.1 and `BRAINSTORM_PUBLISH_LOCAL_ONLY=true`. |
| `env.sh`, `flake.nix` | The environment. Nix is optional and the flake targets x86_64-linux only. |
| `runs/` (gitignored) | Local JSONL logs: writes, reads ("tape"), questions, work records, charges. |
| `PRISM.md` | A design journal for a separate interview/viewpoint-mapping instrument, started 2026-09-26. |

**Memory.** The main store is a Tapestry instance: strfry is the source of truth and Neo4j is derived from it. Every graph write is signed by the instance's own TA key (the "Brain Agent"). The agent's own nostr key is used only for DMs. Two pieces of state live only in local files, not the graph:
- The question gate reads `runs/questions.jsonl`.
- Warmth is folded from `runs/reads.jsonl`.

Rulings and work records are written to both the local files and the graph.

**Agents, skills, workflows.** There is one agent, run in pi (the README recommends `qwen3.8:27b` via ollama) or Claude Code, paired with one human owner. There are no multi-agent definitions. Skills are pi `SKILL.md` files. The workflow is a loop:
1. `brain resume` for a cold start.
2. `orient` / `elements` / `query` to read the graph.
3. Do the work, writing back through `write`, `link`, `refer`.
4. `brain ask` to escalate an ontology question. This blocks the 10 "structural" endpoints until the owner runs `rule`.
5. `brain done` before stopping.

The rules are carried partly in prose and partly in these CLI gates.

**The attention layer** is the most novel part. It has three pieces:
- **Charges** are owner-planted attention markers.
- **Resonance** is a weighted spreading-activation footer. It is computed client-side with Dijkstra over typed edges, with a budget of 4, a fan guard at 40 edges and an "apex rule".
- **Warmth** is recency from the read log.

## 2. Maturity

| Signal | Finding |
|---|---|
| History | 50 commits, all by Vinney Cavallo, from 2026-09-23 9:33 PM to 2026-09-26 4:27 PM ET (11/18/15/6 commits per day). The GitHub repo was created 2026-09-26 6:22 PM ET, so the history was pushed in one go. |
| Visibility | Upstream and fork are both private. No LICENSE file. |
| Issues / PRs | None on upstream. Issues are disabled on the fork. |
| Tests / CI | No CI workflows. The only check is `brain selftest`, an offline test that every verb is wired up and documented, run by a pre-commit hook. There are no behavioural tests. |
| Docs | The README (243 lines) is clear and candid about why things are designed the way they are. ROADMAP marks M0 done and M1's deliverable done. M2–M4 are not marked. `.pi/TODO.md` has 4 of 7 graph-audit items open and all of #3 and #4 open. |
| Commit style | Each commit message records a failure seen in a live session and the fix. This is disciplined, empirical iteration. |

**Gaps and inconsistencies I found:**
- `AGENTS.md` says reads go through host port 8778. `env.sh` and the compose file use 9778.
- `bin/brain` and `bin/rule` default to 8778 and container `tapestry` unless `env.sh` is sourced.
- The `AGENTS.md` Identity block hard-codes Vinney's agent npub, owner pubkey and TA key.
- `.pi/tasks/add-doc-elements.sh` hard-codes an old dev-instance TA pubkey.
- `brain help` says "all 18 endpoints"; selftest counts 19.
- `bin/rule` contains dead functions copied from an older `brain`. `cmd_whoami` references `KEYDIR` and `agent_key`, which are undefined there, but `main()` never calls it.
- With the graph unreachable, `brain resume` printed "0 unparented" and no concept count instead of an error. That contradicts its own promise that "real failures announce themselves loudly".
- The gate itself is a TTY check plus a local JSON file. The code comment says it is "not cryptographic". **(inference)** An agent with a shell could edit `runs/questions.jsonl` or fake a TTY.

**Does it run?** The offline parts work. What I ran on the box:
- `brain selftest` → `ok 24 verbs, 19 endpoints, 10 structural — all wired`.
- `brain ask` → exit code 3.
- A structural write → refused with `BLOCKED`, exit code 3.
- `rule ok` without a TTY → refused, exit code 3.
- `orient` with no graph → a clean error.

I did not run it end to end, because the box has no Docker, `nak`, pi or Claude Code. A full run would need:
1. Docker.
2. A Tapestry image built from branch `add-b-tag-authoring`. Stock Tapestry works for everything except `brain refer`.
3. `infra/.env` with the owner pubkey, admin pubkeys and a Neo4j password.
4. `nak` for the agent key.
5. pi with a model, or Claude Code.
6. The owner hand-creating 8 seed concepts, and editing `AGENTS.md`'s Identity block.

**The dependency is David's repo.** `set-b-tag` is `nous-clawds4/tapestry` PR #759, "Add b tag authoring", by vcavallo:
- Opened 2026-09-26 6:29 PM ET and still open.
- +97 lines in one file; the PR body says there are no automated tests yet.
- It targets `main` from a feature branch, so it **fails the `main-source-guard` check**, which only allows `staging`, `promote/*` or `hotfix/*` into `main`.

**The biggest practical gap:** almost all of the accumulated knowledge lives in Vinney's local-only graph, not in the repo. That includes the `recipe`, `trap` and `identifier` elements, the rulings, the `normalizeendpoint` shapes, `cognitive-model` and `common-brainstorm-cypher-queries`. This is deliberate: ruling d05e1827 deleted `docs/ENDPOINTS.md` because "the graph is the single source". **(inference)** So a fork gets the tooling and an empty memory. The `query-reusable` skill fails until its template concept is re-created. The migration script only copies dev→personal on one machine, and the ROADMAP defers federation.

## 3. Fork vs upstream

They are identical. Both `master` branches point at `6da972c`, and the fork has no extra branches or commits. The fork was created 2026-09-27 5:07 PM ET.

## 4. Fit with the Infinite Harness

| IH piece | What brainstorm-harness provides | Fit |
|---|---|---|
| Base harness $H^i_0$ | Memory, cold-start handoff and an escalation gate for one human-agent pair. No team roles, no task pipeline, no goal or acceptance-test artefact. | Partial |
| Memory layer | A Tapestry graph plus a deterministic CLI, work records and rulings. The IH README already names "a Tapestry instance" as a memory option. | **Strong** |
| Skill store | Local pi `SKILL.md` files. Putting skills in the graph is only a TODO (#4). IH-style cross-fertilisation would still be file-based. | Weak |
| Hold axis (L0–L4) | `ask`/`rule` is effectively **L1** (owner sign-off), but only for ontology-structural writes, and it is binary: structural vs not. "Never edit AGENTS.md or bin/brain" is L0 by prose only. No levels are recorded per item, and there is no asymmetric re-rating. | Pattern only |
| Rung score $S^i_j$ | The ROADMAP names a metric: "curation questions per unit of work should decline". It is not implemented; the TODO "Monitor question-to-ruling ratios" is unchecked. The write and work logs could feed it. | Candidate |
| Versioned harness changes | The tooling is in git. **(inference)** Graph content is replaceable signed events, so the harness gives no per-change diff of the memory. Its "no markdown, graph only" rule works against hold-axis §6 ("every harness change is a git commit or PR… hold level recorded next to the item"). | Conflict |
| Multi-project allocation | None: one owner, one instance, one agent. **(inference)** The compose file's fixed container name and ports mean running several instances needs edits. | None |

**Integration risks:**
1. It is 4 days old with a single author, private and unlicensed, and its tuning is recorded against one model (`qwen3.8:27b`).
2. It depends on an unmerged Tapestry PR, and on the loopback-trust behaviour in `auth.js`. That is a Tapestry internal the harness exploits, not a documented API.
3. The owner rules on every ontology question. The ROADMAP itself calls the owner being "the bottleneck forever" the failure mode. A CoS running several projects would multiply that load **(inference)**.
4. Graph-only docs clash with physics.md's lesson that "the rung above cannot audit a harness rule nobody can read" in a diff.

## 5. As the harness for IH project 2: managing the Tapestry repo

The Tapestry repo **already has a substantial in-repo harness**, which makes it the natural $H^2_0$:
- `AGENTS.md` and `CLAUDE.md`.
- `.claude/agents/`: 14 role agents, including architect, implementer, reviewer, tester, gate-judge and product-*.
- `.claude/skills/`: `cycle-full`, `cycle-local`, `cycle-staging`, `cycle-prod`, `direct-feature`.
- `engineering-team/`: roles, stories, epics, workflows, decisions, reviews, audits.
- `product-team/`.
- `ledger/`: about 90 dated follow-up entries.
- Six GitHub workflows, including `test.yml` and the main-source guard.

About 200 PRs have been opened since 2026-08-28 (nous-clawds4 97, virgil-clawds4 64, ark-clawds4 37, vcavallo 2), flowing through a staging → main promotion.

So brainstorm-harness would not be $H^2_0$. At most it would be a memory adjunct. There is a natural seam: Tapestry's own `AGENTS.md` already tells agents to orient from the local concept graph (the "three-call pattern"), and `brain` is a hardened client for exactly that. **(inference)**

What should exist first, all **proposals**:
1. A `docs/examples/tapestry.md` in IH, like physics.md. It would state $G^2$, describe the existing harness as $H^2_0$, list the rung-1 changes already visible in the repo (for example the main-source guard, added after PR #446, per its own comments), and give a hold-axis map.
2. A candidate rung-1 score from data that already exists, for example ledger follow-ups opened vs closed, staging red rate, or review kick-backs per story.
3. A decision on whether graph memory is in scope for project 2 at all.

## 6. Recommendation: **use a part now; wait on adopting it as infrastructure**

The patterns are good and cheap to borrow. As a component it is not ready: it is 4 days old, has no tests, no licence and no transferable memory, depends on an unmerged PR, and conflicts with IH's diff-based audit.

**Next steps:**
1. **PR #759 (your call as Tapestry maintainer).** It needs retargeting to `staging` to pass `main-source-guard`, and it has no tests yet. Nothing has been done; this needs your go-ahead, or a note to Vinney.
2. **Write `docs/examples/tapestry.md`** mapping the existing Tapestry harness as $H^2_0$, with a hold-axis map and a score proposal, before choosing any memory layer.
3. **Borrow three patterns into IH now:**
   - the separate-binary, TTY-gated escalation as a concrete L1 mechanism;
   - `resume`/`done` as the cold-start handoff for Rung Managers;
   - "questions per unit of work" as a candidate rung score.
4. **Before any pilot, ask Vinney** for a licence and for an export of his graph's `recipe` / `trap` / `identifier` / `ruling` content as seed data. Then pilot `brain` as the CoS's own memory for $P^0$ on a throwaway local instance once #759 lands.
