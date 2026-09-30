# History of this repository

**Status: L4 (free).** A record of how this repository came to be. The CoS keeps it up to date.

## Public re-initialization, 2026-09-27

This repository was re-initialized as a **public** repository on 2026-09-27. Its first commit is a snapshot of the files in the private repository at commit `28f934c7d7c7da53d8b252bdce01652fda6ccd8b` ("docs: Owner vs Tapestry Assistant, project authority, authority-signed L0/L1 rulings (L3) (#8)"). No earlier git history was carried over.

The earlier repository was renamed to `nous-clawds4/infinite-harness-archive` and kept **private**. Its history, including PRs #1 to #8, is there. Links to those PRs, such as `https://github.com/nous-clawds4/infinite-harness-archive/pull/2`, work only for people with access to the archive.

Changes made to the snapshot before the first public commit:

- `docs/assessments/brainstorm-harness.md` was **rewritten**. It had assessed a colleague's private harness experiment in detail. It now keeps only the design ideas IH might borrow, described generically, with credit to be added once that project's author agrees.
- `docs/tapestry-concept-model.md`: two passages that cited internals of that private project were reworded; the points they make are unchanged.
- `docs/examples/physics.md`: the physics repo `nous-clawds4/physics` is described as public (it is).
- `graph/README.md`: the description of `ih-seed.js` now matches `docs/tapestry-concept-model.md` §1 (loopback calls pass Tapestry's privileged gate but do not make the caller the Owner; records are signed with Nous' Tapestry Assistant's key). A note explains that IH pointers in the graph export are pinned to commit `5d603359`, which now resolves only in the private archive.
- `docs/hold-axis.md`: the changelog pointer to PR #2 now names the private archive. The rest of the note, including the L0 re-rating rule, is unchanged.
- This file was added.

`README.md` is unchanged.

## Goal protection, 2026-09-27

Once the repository was public, GitHub rulesets became available. `.github/CODEOWNERS` assigns `@wds4` (David) as code owner of `README.md` (the goal, L0), `docs/hold-axis.md` (holds the L0 re-rating rule) and `.github/CODEOWNERS` itself. A ruleset on `main` requires a pull request, requires review from Code Owners (with zero general approvals), blocks force pushes and deletion, and has no bypass actors. So changes to the goal or the L0 rule need David's approval, while ordinary L3 docs can still be merged by the CoS. This only strengthens holds, so under `docs/hold-axis.md` §4 it needs no approval from above.

## Organization chart, 2026-09-27

Added [`docs/org-chart.md`](org-chart.md) to record the CoS's delegation of day-to-day work to the Physics Lead and Tapestry, the CoS's continuing duties, and the authorized overnight physics iteration. `README.md`, `docs/hold-axis.md` and `.github/CODEOWNERS` were not changed; README could later link to the new note.

## Project authorities, 2026-09-27

David confirmed on 2026-09-27 at 9:59 PM ET that he is the authority for every project: $P^0$ (the Infinite Harness ladder), $P^1$ (physics) and $P^2$ (Tapestry). His identities are nostr straycat (`npub1u5njm6g5h5cpw4wy8xugu62e5s7f6fnysv0sj0z3a8rengt2zqhsxrldq3`, hex `e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f`) and GitHub `@wds4`. [`docs/authority.md`](authority.md) records this as the L0 git anchor that `docs/tapestry-concept-model.md` §8.2 describes, and `.github/CODEOWNERS` now assigns it to `@wds4`. The change touches a code-owned file, so it takes effect only with David's approval. `docs/examples/tapestry.md`, `docs/org-chart.md`, `docs/tapestry-concept-model.md` and `graph/README.md` now point to it instead of saying the authority is proposed or not recorded. `README.md` and `docs/hold-axis.md` were not changed.

## The Path of 42 (proposal), 2026-09-29

Added [`docs/path-of-42.md`](path-of-42.md), a write-up of David's proposed IH method, the Path of 42: a graph of question and answer nodes, mapped onto the hold axis. It is a proposal awaiting his review. `README.md`, `docs/hold-axis.md`, `docs/authority.md` and `.github/CODEOWNERS` were not changed; README could later link to the new note.

## The Path 42 Project (planning), 2026-09-29

Registered $P^3$, the Path 42 Project, with David Strayhorn (`@wds4`) as its authority and Path 42 as its project-lead agent and Product Manager reporting to the Chief of Staff. Added the planning-only project note at [`docs/projects/path-42.md`](projects/path-42.md). No build work is authorized: phase 1 is planning and a Brainstorm WoT readiness assessment, phase 2 is a pitch to David, and implementation waits for his go. `README.md`, `docs/hold-axis.md` and `.github/CODEOWNERS` were not changed.
