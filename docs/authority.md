# Project authorities

**Status: L0 (locked).** Only the human changes this file. It is the **git anchor** for each project's authority described in [`tapestry-concept-model.md`](tapestry-concept-model.md) §8.2. The key recorded here is the one whose signature the harness requires on the project's L0 and L1 rulings. Whoever can change this file can forge every ruling, so it is held at L0 and owned by `@wds4` in [`.github/CODEOWNERS`](../.github/CODEOWNERS).

## Authorities

David Strayhorn is the authority for every project. He confirmed this on 2026-09-27 at 9:59 PM ET. The record takes effect when he approves, as code owner, the pull request that adds this file.

| Project | Authority | Hex pubkey | npub | GitHub |
|---|---|---|---|---|
| $P^0$: the Infinite Harness ladder (this repo, [`nous-clawds4/infinite-harness`](https://github.com/nous-clawds4/infinite-harness)) | David Strayhorn (straycat) | `e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f` | `npub1u5njm6g5h5cpw4wy8xugu62e5s7f6fnysv0sj0z3a8rengt2zqhsxrldq3` | [`@wds4`](https://github.com/wds4) |
| $P^1$: physics ([`nous-clawds4/physics`](https://github.com/nous-clawds4/physics)) | David Strayhorn (straycat) | `e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f` | `npub1u5njm6g5h5cpw4wy8xugu62e5s7f6fnysv0sj0z3a8rengt2zqhsxrldq3` | [`@wds4`](https://github.com/wds4) |
| $P^2$: Tapestry ([`nous-clawds4/tapestry`](https://github.com/nous-clawds4/tapestry)) | David Strayhorn (straycat) | `e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f` | `npub1u5njm6g5h5cpw4wy8xugu62e5s7f6fnysv0sj0z3a8rengt2zqhsxrldq3` | [`@wds4`](https://github.com/wds4) |
| $P^3$: the Path 42 Project ([`docs/projects/path-42.md`](projects/path-42.md)) | David Strayhorn (straycat) | `e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f` | `npub1u5njm6g5h5cpw4wy8xugu62e5s7f6fnysv0sj0z3a8rengt2zqhsxrldq3` | [`@wds4`](https://github.com/wds4) |

The npub is the one listed for David in Tapestry's `BIBLE.md` §20. The hex pubkey is its NIP-19 decoding, and it re-encodes to the same npub (checked with nostr-tools `nip19` and with an independent bech32 decoder).

The two identities do different jobs:

- **The nostr key (hex pubkey above)** signs L0 and L1 rulings. Only this key makes a ruling valid (§8.3).
- **The GitHub account `@wds4`** approves, as code owner, pull requests that change L0 files in this repo (`README.md`, `docs/hold-axis.md`, `.github/CODEOWNERS` and this file). A GitHub approval changes a file in git. It is not a nostr ruling and does not replace one where a ruling is required.

## What the authority does, and what it does not

- **The authority signs L0 and L1 rulings.** Under [`hold-axis.md`](hold-axis.md) §4, a change to an L0 or L1 item, or a demotion from those levels, needs "the human". For each project, that human is the authority recorded here.
- **The authority is not the instance Owner.** Owning the Tapestry instance where a project's records live does not make you that project's authority, and being the authority does not make you the Owner ([`tapestry-concept-model.md`](tapestry-concept-model.md) §8.2). On the local R&D instance on David's Mac, the Owner is Nous and the Tapestry Assistant is Nous' Assistant, while the authority for all three projects is David. David's personal nsec is deliberately not on that Mac.
- **The graph copy is only a mirror.** The `authority` field of an `ih project` record on a Tapestry instance mirrors this file, and any mismatch is a failure. The graph record is written with the Tapestry Assistant's key, so it cannot be the anchor.

## How a ruling is verified against this file

A ruling on an L0 or L1 item of project $P^i$ is a kind-39999 nostr event whose `z` tag is the `ih ruling` concept on the instance. It counts only if the harness itself checks all of the following, in this order, before acting on it ([`tapestry-concept-model.md`](tapestry-concept-model.md) §8.3):

1. **Signature.** The event's `id` is the hash of its serialized content, and `sig` is a valid signature by its `pubkey`, checked on a JSON round-trip of the event (for example nostr-tools `verifyEvent`).
2. **Author.** The event's `pubkey` equals the hex pubkey recorded **in this file** for $P^i$, read at a pinned commit of this repo. It is not read from the graph.
3. **Scope.** The ruling names this project (`project`, the `ih project` record's address) and the exact target it decides (`decides`: the rating's or harness change's address, or the commit SHA of the change). Its `level` matches the item's current level. A ruling for one target does not authorise another.
4. **Decision.** For a demotion (hold-axis §4), `decision` is `approve`.

A ruling that fails any check is ignored and flagged. It is not repaired, and the Tapestry Assistant does not record a substitute. A TA-signed record, a git commit by an agent account or a chat message can report a ruling, but none of them is one. The ruling's `evidence` pointer names the commit or PR that carries the change out, so a reader can check both halves: the signature says who decided, and git shows what changed.

Rulings signed by an external key land in the instance's strfry relay but are not imported into Neo4j. The harness reads them from the relay with a filter such as `{"kinds":[39999], "authors":["e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f"], "#z":["39998:<TA pubkey>:ih-ruling"]}`.

## Changing an authority

Changing any row of this table is itself an L0 change. Each change needs:

1. a ruling signed by the **current** authority key for that project, approving the change and naming the new key; and
2. David's approval of the pull request, as code owner of this file.

The harness checks this file's **history** as well as its current value: every change to a recorded authority after the first must be covered by such a ruling. An edit without one is visible and ineffective.

## Changelog

- 2026-09-27: created by the CoS at David's direction, recording David Strayhorn (straycat, `@wds4`) as the authority for $P^0$, $P^1$ and $P^2$. David confirmed this at 9:59 PM ET. This is the first recorded value for each project, so no prior ruling was needed. It takes effect on merge with his code-owner approval.
- 2026-09-29: added $P^3$, the Path 42 Project, with David Strayhorn (straycat, `@wds4`) as its authority. This is the first recorded value for the project, so no prior ruling was needed. It takes effect on merge with his code-owner approval.
