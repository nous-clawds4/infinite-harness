# `graph/`: JSON export of the IH concept graph

**Status: L3 (disclosed).** The CoS maintains this folder and records each change in the changelog at the bottom. It implements decision D of [`docs/tapestry-concept-model.md`](../docs/tapestry-concept-model.md) §7: git keeps an audit trail of the graph's structure as well as its text.

## What is here

- **`ih-graph.json`** is an export of every IH concept on David's local Tapestry instance (http://localhost:7778, owned by Nous, an R&D instance): each concept's address, description and JSON Schema, and each element's address and JSON. It also lists the reused second-brain concepts by address and records the commits that the pointers are pinned to.
- **`runs/2026-09-27.json`** records the runs that created the graph: the dry run, the write run (log and digest) and the export run, including the relay-privacy check.
- **`tools/ih-seed.js`** is the script that did the work. It runs inside the `tapestry` container, so its calls are loopback calls that Tapestry treats as the Owner, and every record is signed with the instance's Tapestry Assistant key. It has three modes: `dry-run` (the default; checks and plan, no writes), `write`, and `export` (read-only; prints the read-back used for `ih-graph.json`).

## What was created on 2026-09-27

The write run started at about 7:03 PM ET, and every step succeeded.

- **13 concepts, each with a JSON Schema:** `ih project`, `ih harness`, `ih rung`, `ih agent`, `ih skill`, `ih harness change`, `ih change outcome`, `ih hold level`, `ih item`, `ih hold rating`, `ih ruling`, `ih score` and `ih evaluation`. Each schema has one top-level section named by the concept's primary-property key (for example `ihProject`), which is the shape Tapestry's second-brain concepts use.
- **9 seed elements:**
  - the five hold levels, `L0 Locked` to `L4 Free`, each pointing at `docs/hold-axis.md` §3;
  - two projects, `P1 physics` and `P2 tapestry`;
  - their base harnesses, `H1_0 physics base harness` (4 folder pointers into the physics repo) and `H2_0 tapestry base harness` (one pointer per line of Tapestry's `scripts/harness-def-paths.txt`, 25 in all).
- Each project links to its base harness, and each harness links back to its project, by address. No goal, rung or agent records exist yet, so those links are absent rather than guessed.

Nothing was written to any other concept. The four July concepts (`tapestry team`, `tapestry executive action`, `tapestry privacy level`, `maturational state of a concept`) were left untouched.

## Relay privacy

Decision C requires the writer to confirm, before writing, that no IH event can leave the machine. The script checks both the router state (`GET /api/strfry/router-status`) and the running router config (`/etc/strfry-router-tapestry.config`), and it also looks for any `strfry sync` with direction `up` or `both` in cron or in the running processes. Both runs on 2026-09-27 found the following:

- The `dcosl` preset is **disabled**.
- Seven enabled streams send events outward, and none of them can carry an IH event.
  - Five `both` streams to `wss://dcosl.brainstorm.world` (`tag`, `nostrUserTag`, `tagPinning`, `taggingWithSpecificTag`, `nostrEventTag`) are limited by `#z` to five firmware tag concepts. strfry's router applies a stream's filter before uploading (strfry `docs/router.md`, "filter").
  - `WoT` (both; kinds 3, 1984, 10000) and `trustedAssertions` (up; kind 30382) are limited by kind.
- No outbound `strfry sync` was scheduled or running.

These streams were already enabled before this work, and the CoS did not change them. If someone ever enables `dcosl`, or adds an unfiltered `up` or `both` stream, the script will refuse to write.

## Regenerating

After any batch of IH writes, run `ih-seed.js` in `export` mode on the Mac, replace `ih-graph.json` with the new read-back, and add a file under `runs/`. The export is what the instance holds, not what the script intended to write.

## Changelog

- 2026-09-27: created by the CoS (L3). First export after the initial write run.
