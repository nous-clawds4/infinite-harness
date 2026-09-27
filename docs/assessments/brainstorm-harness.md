# Design ideas IH might borrow from a colleague's harness experiment

**Status: L3 (disclosed).** The CoS maintains this note under the scale in [`../hold-axis.md`](../hold-axis.md). The CoS may revise it, but must record each change and its reason in the changelog at the bottom. Everything below is a **proposal**; none of it changes `README.md` or `hold-axis.md`.

**Where these ideas come from.** They came from a colleague's private experiment with a human-plus-agent harness built on a Tapestry concept graph. This note keeps only the design ideas, stated generically, that the Infinite Harness (IH) might borrow. It does not describe that project's code or state. Credit can be added here once its author agrees.

## 1. The ideas

1. **Concept-graph memory as a byproduct of real work.** A human and an agent work together, and what the pair learns accretes into a concept graph (for example a Tapestry instance) as they go. The graph is the agent's long-term memory and also its documentation. IH's README already names "a Tapestry instance" as a memory option; this is a concrete way to use one.
2. **The human owns the ontology.** The agent may propose new categories or other structural changes to the graph, but the human rules on them. Ordinary content writes flow freely; structural writes wait for a ruling.
3. **A separate, owner-only escalation step.** When the agent hits a structural question, it files the question and structural writes are blocked until the owner answers through a separate tool the agent does not use. This is a concrete shape for an L1 (sign-off) mechanism. *Caveat:* a gate that rests on a local check, such as an interactive prompt or a local file, is not cryptographic, and an agent with a shell could get around it. For L0 and L1 rulings IH therefore requires a signature by the project authority ([`../tapestry-concept-model.md`](../tapestry-concept-model.md) §8.3).
4. **One deterministic interface to memory.** The agent reads and writes the graph only through a small, deterministic command-line tool, not through ad-hoc queries. Each command validates its input and fails loudly. A self-test that checks every command is wired up and documented, run before each commit, keeps the tool and its docs in step.
5. **A cold-start handoff.** Every session begins with one "orient me" command that summarises where things stand, and ends with a "done" step that records what was done and what is open. This maps onto IH's Rung Managers, which are called intermittently and must pick up where the last call stopped.
6. **Append-only work records and rulings.** Each unit of work and each owner ruling is a new record, never an edit. This matches the append-only facts in [`../tapestry-concept-model.md`](../tapestry-concept-model.md) §3, principle 2.
7. **An attention layer over the graph.** Three signals decide what the agent sees first: markers the owner plants on concepts that deserve attention; spreading activation from the current topic over typed edges, with a budget and a guard against high fan-out nodes; and recency, derived from a log of what was read.
8. **"Questions per unit of work should decline" as a score.** If the harness is getting better, the agent should need to escalate less often for the same amount of work. This is a candidate rung-1 score $S^i_1$ for any IH project that uses graph memory, and the work and question logs are enough to compute it.
9. **Harness changes grounded in observed failures.** Each change to the harness records the failure seen in a live session that prompted it, and the fix. This is the same pattern the Tapestry harness shows ([`../examples/tapestry.md`](../examples/tapestry.md), "Rung-1 changes already made"), and it gives rung 2 something to audit.

## 2. Cautions when borrowing

- **Keep the text in git.** If memory and documentation live only in the graph, harness changes no longer show up as diffs, which works against [`../hold-axis.md`](../hold-axis.md) §6 and the physics lesson that "the rung above cannot audit a harness rule nobody can read". IH's answer is that git holds the text and the graph holds structure and pointers ([`../tapestry-concept-model.md`](../tapestry-concept-model.md) §3, principle 1).
- **The owner can become the bottleneck.** If the owner must rule on every structural question, a CoS running several projects multiplies that load. Rating change *types* as well as items, with pre-approved standard changes ([`../literature-review.md`](../literature-review.md) §6), is one way to keep rulings rare.
- **Memory does not travel by itself.** Knowledge that lives in one person's local graph does not come with a copy of the tooling. IH's `graph/` export ([`../../graph/`](../../graph/)) is one way to keep a graph's structure reproducible.

## 3. What IH could borrow now (proposals)

- The owner-only escalation step (idea 3) as a concrete L1 mechanism, with the signature requirement for L0/L1.
- The orient/done handoff (idea 5) for Rung Managers.
- "Questions per unit of work" (idea 8) as a candidate rung score.

## Changelog

- 2026-09-27: created by the CoS (L3) as an assessment of the colleague's harness experiment.
- 2026-09-27 (night): rewritten by the CoS (L3) for the public release of this repo. The note now keeps only the design ideas IH might borrow, described generically, plus cautions and proposals. All details of the source project (its structure, configuration, identities, history and any assessment of its readiness) were removed, because that project is private. The earlier version is in the private archive (see [`../HISTORY.md`](../HISTORY.md)).
