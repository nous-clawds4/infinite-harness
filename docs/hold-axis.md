# How strongly held: an axis for protecting the goal

*The how-strongly-held axis is David Strayhorn's idea. This note writes it up together with two points David and the CoS agreed on: rungs need a score, and the goal needs protection from the harness that serves it.*

**Status:** proposed. Under its own scale this note is L3: the CoS may change it, but must disclose each change openly with its reasons. The exception is the re-rating rule in §4, which is L0.

## 1. Measurement comes first

Rung $j$ exists to make $H^i_{j-1}$ better. That means rung $j$ needs a score $S^i_j$ that can tell a better $H^i_{j-1}$ from a worse one. Without a score, a Rung Manager can only produce changes that *sound* like improvements.

The signal gets worse as you climb:

- **Rung 1** scores $H^i_0$ by the work $A^i_0$ produces. Every task is a data point.
- **Rung 2** scores $H^i_1$ by whether rung 1's changes raised $S^i_1$. Each data point is a whole rung-1 change, plus enough rung-0 work afterwards to judge it.
- **Rung $j$** has sparser, slower and noisier data than rung $j-1$.

So a new rung is added only when the rung below it has enough history to evaluate: a run of changes, each with a before-and-after score. An upper rung without that history is optimizing noise, or worse, optimizing the story told about the rung below. This is one concrete input to the question in the README, "How many rungs in the ladder?"

## 2. Protecting the goal from the harness

Any optimizer eventually finds that the cheapest way to look better is to lower the bar. It can soften a definition, drop a check that keeps failing, reread the goal in a way that is easier to meet, or quietly move a hard requirement to "open". No bad intent is needed. It is simply the direction of least resistance.

Guarding against this is not the job of one special rung. **Each rung $j$ audits rung $j-1$.**

- Rung 1 is where erosion happens, because it edits $H^i_0$, and $H^i_0$ contains whatever states or tests $G^i$.
- Rung 2 is where erosion is caught. Its score, $S^i_2$, is about whether rung 1's changes were real improvements, and a lowered bar is not one.
- The human is the check at the top. At any moment the ladder has a highest rung, and whoever sits above it is the human.

Four mechanisms, all cheap:

**(a) The goal lives outside the writable surface.** The goal statement and its acceptance tests are kept where rung $j-1$ cannot write them: a separate file or folder under a stronger hold level (§3), with changes gated by review. Rung $j-1$ may read the goal. It may not edit the thing it is scored against.

**(b) Score against held-out external evaluations.** At least part of $S^i_j$ comes from evaluations the lower rung can neither see in advance nor edit. An example is a fresh review by an external model that did not take part in the work, run cold. The lower rung may prepare the work and a short cover note. It does not write the exam. Anything the lower rung writes for the examiner, such as a cover note, is a channel for steering, so it is kept short, factual and itself reviewable.

**(c) Audit every harness diff.** Every change to $H^i_{j-1}$ is read for three things: weakened definitions, removed or loosened checks, and items moved to a weaker hold level. These are flagged even when the score went up, and especially then.

**(d) Periodic drift check.** From time to time, current output is compared against the *original* goal text, not against the harness's latest paraphrase of it. Paraphrase is where drift hides.

## 3. The axis: how strongly held

Holding is a spectrum, not a binary "locked or not". Every item in a harness gets a level: a goal statement, a definition, a rule, a check, a file.

| Level | Name | Who may change it | What a change requires |
|---|---|---|---|
| **L0** | Locked | Only the human | The human makes or authors the change |
| **L1** | Sign-off | An agent may propose | Explicit human sign-off before it takes effect |
| **L2** | Reviewed | An agent may propose | Peer or panel review before it takes effect |
| **L3** | Disclosed | An agent may change it | Open disclosure, with reasons, where readers will see it (for example, in the artifact's own changelog); reviewable after the fact |
| **L4** | Free | An agent may change it | Nothing beyond the log (commit or PR history) |

L2 ranks above L3 because a gate before a change is stronger than review after it.

Examples, for a generic project:

- **L0:** the goal statement; the rule that the output may not claim a result it has not shown.
- **L1:** acceptance criteria; the list of what counts as "done".
- **L2:** adding a new hypothesis, method or tool to the standard workflow.
- **L3:** a working assumption the output depends on. It may be revised at a genuine dead end, but the output must say so.
- **L4:** formatting, file layout, routine docs, merging work that respects every item above.

[`examples/physics.md`](examples/physics.md) places the rules of a real project on this scale.

## 4. Who re-rates, and the asymmetry rule

Placements are not permanent. The Rung Manager $A^i_j$ periodically re-evaluates the levels of the items in $H^i_{j-1}$. Some items turn out to matter more than expected, and some turn out to be over-protected and slow the work down.

Re-rating is **asymmetric**:

- **Moving an item toward more strongly held** (toward L0) is always allowed. It is logged, with a reason.
- **Moving an item toward less strongly held** (toward L4) needs approval from the level above the one proposing it. That is the next rung up, or **the human for anything at L0–L1 or anything that touches the goal**.

The asymmetry follows the direction of the risk. Over-holding costs speed, and that cost is visible and recoverable. Under-holding costs the goal, and the rung doing the eroding is the one least able to see it. A demotion is also exactly what mechanism (c) looks for in a diff.

**The re-rating rule is itself held at L0.** Otherwise the cheapest demotion would be to demote the rule about demotions.

## 5. Convergence: rung 2 and up tend to be shared

Rung 1 is project-specific: improving a physics pipeline and improving an app build look different. Upper rungs look similar across projects. "Improve the improver" means asking whether harness changes worked, whether the score is honest, and whether a demotion was justified, and those questions barely depend on the project. So rung 2 and above tend to be shared across projects. In effect they become project 0, $P^0$, the Infinite Ladder itself.

That puts the CoS in the position of improving its own harness, $H^0$. No rung sits above the CoS to audit it, so this is exactly where **the human must be the check**. At minimum, the list of L0 items, the re-rating rule and the CoS's own scoring stay L0 or L1.

## 6. Versioning

Every harness change is a reviewable, reversible change: a git commit or pull request that states the reason and the evidence. The hold level of each item is recorded next to the item, so that a change of level shows up in the diff. Mechanisms (a)–(d) all depend on this. You cannot audit a diff that was never written down, and you cannot revert a change nobody can find.
