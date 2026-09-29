# The Path of 42: a question graph for building a theory

*The Path of 42 is David Strayhorn's idea, and the name is his. He proposed it as an IH method in his notes on the physics essay* Statement of the Problem *(v0.5, the paragraph beginning "Probably move the following paragraph elsewhere..." and the next; [`wds4/physics@047ba165`](https://github.com/wds4/physics/blob/047ba165389ceeb1ea778dd1ffdf4d89a535a62c/public-essays/statement-of-the-problem/versions/v0.5.md)). This note writes it up against the [hold axis](hold-axis.md).*

**Status: proposal.** This note is L3 (disclosed): the CoS may revise it, logging each change below. Adopting the method in a project's workflow would be L2 (hold-axis §3). A pilot is under way in physics ($P^1$), retro-mapping framework-paper versions v0.3 to v0.7.1 onto a question graph.

**The name.** "42" is from *The Hitchhiker's Guide to the Galaxy*: the hard part is asking the question, not answering it. "Path" is the method: selecting a path through the graph.

## 1. Structure: a graph, not layers

The essay keeps to layers for simplicity. The method is a directed acyclic graph with two node types:

- **Question nodes**, raised by the root or by an accepted answer. Most are *a priori*: "What is the definition of X?" (a term used higher up), "Which mathematical tool fits here?"
- **Answer nodes**, each a child of the question it answers, with status **accepted**, **rejected** or **open**.

Every answer carries one tag: `definition`, `math-tool` (mathematical-tool choice), `method` (methodological principle: a rule about what the theory may assume) or `physical-hypothesis` (associating a variable with an experimental finding). Physical hypotheses are rare and marked as such. Physics plans one: a variable for the relative probabilities of a particle arriving at each of several detectors.

**Terms may be used before they are fully defined.** A term introduced high up gets its definition from a question further down, and that definition may be extended later. As David puts it, maybe there is no such thing as a completed definition. This is the epistemology of the concept graph.

## 2. Hold strength

David describes each node as a strong opinion: the root strongly held, each node below "slightly less strongly". On the IH scale:

- **The root is L0.** For physics, it is the goal stated in the *Statement of the Problem* essay.
- **A child is never held more strongly than its weakest parent.** An answer resting on parents at L1 and L3 sits at L3 or weaker.
- **Held weakly is not half-hearted.** The work runs with a child fully; its level says only how readily it is given up.

**How this meets the re-rating rule** (hold-axis §4, L0). Strengthening is free; weakening needs approval from above. The graph adds a cap: **a child's strength is capped by its parents.** A promotion that would lift a child above its weakest parent is not allowed; strengthen the parent first, if that can be justified. Weakening a parent can push children below their current level, so the demotion request lists every child it drags down and the approver rules on the whole set.

## 3. Rejected nodes are kept

A rejected answer stays in the graph with **why it was rejected** and a **reopen if** condition. This records why the path taken was taken (David's main reason) and makes resurrection principled: an idea returns because its condition was met.

## 4. A paper version is a selection

In David's words, a paper "will map to a series of paths starting from the base node, traversing all accepted nodes, not traversing rejected nodes." Precisely, a paper version is a **consistent selection**: one accepted answer for each question it depends on. Parallel questions give parallel branches, so the selection is a set of paths from the root (a cut through the graph), not a single path. The diff between two versions becomes a list of nodes, each with its rationale.

## 5. Backtracking

This generalizes the essay's instruction to "give up the highest-numbered layer whose loss resolves the problem" and never Layer 1:

1. Give up the **deepest accepted node whose rejection resolves the problem**. Deeper nodes are never held more strongly, so this is the cheapest retreat.
2. Record which node was given up and why, with its reopen-if.
3. Go up only as far as necessary. Nodes below the given-up one are kept but leave the current selection until re-attached.
4. **The root is never given up.**

Giving up a node changes it, so it needs what its level requires (§6); an L0 or L1 node needs David.

## 6. Posing the next question, and who rules

David calls posing the next question the under-appreciated step. Selecting the right questions is the heart of the method. In the physics loop:

- **Proposing.** Any agent (Geometry, Literature, Ontology, the Physics Lead) may propose a question or a candidate answer. External review HOLDs are a good source, since each usually hides an unasked question. Reviews should end with the next question they think matters.
- **Ruling.** The node's level decides who may accept or reject it (hold-axis §3): an agent with disclosure at L3, panel review at L2. Lowering a node's level follows hold-axis §4. **Nodes at L0 and L1 need David's signature**: a ruling signed with the authority key recorded in [`authority.md`](authority.md), verified as in [`tapestry-concept-model.md`](tapestry-concept-model.md) §8.3 (the straycat signature). No agent can rule at those levels.
- **Auditing.** The CoS checks the graph as it checks any harness diff: promotions past a parent, rejections without a reopen-if, unmarked physical hypotheses.

## 7. Seed example (physics)

- **Root** (L0): the observer is a physical system inside the theory, of the same kind as everything else physics describes.
  - **Question:** Which physical objects can and cannot be observers? Is there a privileged class?
    - **Rejected:** privileged (for example, conscious) matter.
      - *Why:* no physical criterion picks out the class without presupposing observation, and it would put the observer partly outside the physics, against the root.
      - *Reopen if:* a physical, independently testable criterion separating observers from non-observers turns up, for example statistics that depend on what kind of system sits in the measurement chain.
    - **Accepted:** no privileged matter. Tag: `method`.
      - *Why:* by analogy with no preferred frame in general relativity and the Copernican lesson: our place in the world is not privileged, and refusing to accept that has hindered progress. The burden of proof falls on privilege.

The justification must not be circular. "No privileged matter, because there is no special quality" restates the answer. The reason has to stand independently: the track record of no-privilege principles, and the lack of any physical criterion for the alternative.

## 8. Representation

**Start as files in each project repo**, for example a `question-graph/` folder with one file per node:

```yaml
id: a-no-privileged-matter
type: answer          # question | answer
parents: [q-which-objects-observe]
status: accepted      # accepted | rejected | open
hold: L2
tag: method           # definition | math-tool | method | physical-hypothesis
rationale: No preferred frame (GR); the Copernican lesson.
reopen_if: null       # required when rejected
```

Add one file per paper version listing the answers it selects. Git then records every status and level change (hold-axis §6).

**Later, migrate into Tapestry's concept graph.** The IH already points its concepts at Tapestry ([`graph/`](../graph/), [`tapestry-concept-model.md`](tapestry-concept-model.md)). Questions and answers would become new `ih` concepts (**proposal**), with the files staying in git and the graph holding structure and commit-pinned pointers. Rulings on L0 and L1 nodes use the existing `ih ruling`.

## Changelog

- 2026-09-29: created by the CoS (L3) as a proposal, from David's notes in `wds4/physics` (*Statement of the Problem* v0.5). Awaiting David's review.
