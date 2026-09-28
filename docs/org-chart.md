# Organizational chart

**Status: L3 (disclosed).** This note records the current organization of the Infinite Harness and the division of work between the CoS and the project leads. It is maintained by the CoS.

## Organization on 2026-09-27

At about 8:10 PM ET, following the harness protocol, the Chief of Staff (the rung above the projects) delegated day-to-day project work to two project-lead agents that report to it:

- **Physics Lead** runs project $P^1$, the physics program in [`nous-clawds4/physics`](https://github.com/nous-clawds4/physics). This includes the paper review loop and the Geometry, Ontology and Literature agents.
- **Tapestry** is the project-lead agent for project $P^2$, the management of the Tapestry repo [`nous-clawds4/tapestry`](https://github.com/nous-clawds4/tapestry), described in [`examples/tapestry.md`](examples/tapestry.md). Here "Tapestry" is the agent's name. It does not mean the Tapestry software or any Tapestry instance.

The project leads work at the hold levels already defined in [`hold-axis.md`](hold-axis.md). L0 and L1 items still require sign-off from the recorded authority for the project, given as a nostr ruling signed with that authority's key ([`tapestry-concept-model.md`](tapestry-concept-model.md) §8.3). For physics, the proposed authority is David (as straycat). The value is proposed and waits for David's confirmation; because the authority is an L0 item, it is recorded only when David records or confirms it himself ([`tapestry-concept-model.md`](tapestry-concept-model.md) §8.2). No authority is recorded yet for $P^0$ or $P^2$. A project lead may propose a change by pull request; proposing it does not replace the required sign-off.

The CoS keeps its own duties. It maintains this repository, adds ladders and rungs, allocates resources such as Claude review quota and agent time, and audits both project leads. The audit follows the harness rule that each rung audits the rung below it.

## Authorized overnight physics iteration

David authorized an unattended physics iteration to continue until the weekly Claude quota resets on Monday 2026-09-28 at 8:00 PM ET. The Mac-side review runner takes requests only from a queue folder on the `main` branch of the physics repository and logs its work to [physics issue #146](https://github.com/nous-clawds4/physics/issues/146).

This authorization concerns the overnight iteration and does not change the project's hold levels or its sign-off requirements.

## Changelog

- 2026-09-27: added by the CoS (L3) to record the organization and the authorized overnight physics iteration.
- 2026-09-27 (night): the CoS (L3) aligned the physics authority wording with `tapestry-concept-model.md` §8.2 (a proposed value awaiting David's confirmation), noted that no authority is recorded yet for $P^0$ or $P^2$, and made clear that "Tapestry" here names the $P^2$ project-lead agent, not the product.
