# `graph/`: JSON export of the IH concept graph

**Status: L3 (disclosed).** The CoS maintains this folder and records each change in the changelog at the bottom. It implements decision D of [`docs/tapestry-concept-model.md`](../docs/tapestry-concept-model.md) §7: git keeps an audit trail of the graph's structure as well as its text.

## What is here

- **`ih-graph.json`** is an export of every IH concept on David's local Tapestry instance (http://localhost:7778, owned by Nous, an R&D instance): each concept's address, description and JSON Schema, and each element's address and JSON. It also lists the reused second-brain concepts by address and records the commits that the pointers are pinned to.
- **`runs/2026-09-27.json`** records the runs that created the graph: the dry run, the write run (log and digest) and the export run, including the relay-privacy check.
- **`tools/ih-seed.js`** is the script that did the work. It runs inside the `tapestry` container, so its calls are loopback calls that pass Tapestry's privileged write gate, the same tier an Owner session passes. Passing the gate does not make the script the Owner: every record is signed with the instance key, which is Nous' Tapestry Assistant's key, an identity distinct from the Owner, Nous ([`docs/tapestry-concept-model.md`](../docs/tapestry-concept-model.md) §1). It has four modes: `dry-run` (the default; checks and plan, no writes), `write`, `update` (re-pins IH pointers in existing records; see below) and `export` (read-only; prints the read-back used for `ih-graph.json`).

## What was created on 2026-09-27

The write run started at about 7:03 PM ET, and every step succeeded.

- **13 concepts, each with a JSON Schema:** `ih project`, `ih harness`, `ih rung`, `ih agent`, `ih skill`, `ih harness change`, `ih change outcome`, `ih hold level`, `ih item`, `ih hold rating`, `ih ruling`, `ih score` and `ih evaluation`. Each schema has one top-level section named by the concept's primary-property key (for example `ihProject`), which is the shape Tapestry's second-brain concepts use.
- **9 seed elements:**
  - the five hold levels, `L0 Locked` to `L4 Free`, each pointing at `docs/hold-axis.md` §3;
  - two projects, `P1 physics` and `P2 tapestry`;
  - their base harnesses, `H1_0 physics base harness` (5 locators: 4 folder pointers into the physics repo plus 1 pointer to `docs/examples/physics.md` in this repo) and `H2_0 tapestry base harness` (26 locators: one per line of Tapestry's `scripts/harness-def-paths.txt`, 25 in all, plus 1 pointer to `docs/examples/tapestry.md` in this repo).
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

## Pinned commits after the public re-initialization

The export pins IH pointers to commit `5d603359` of `nous-clawds4/infinite-harness`. That commit belongs to the history before this repo was re-initialized publicly on 2026-09-27, so it now resolves only in the private archive repo `nous-clawds4/infinite-harness-archive` (see [`docs/HISTORY.md`](../docs/HISTORY.md)). The export is left as the instance holds it.

The seed script now pins IH pointers to `84e245d078e1603ac8b1ff9022b936f83372652d`, the public `main` HEAD when the pin was set. The three IH paths the seed elements point at exist there under the same names: `docs/examples/tapestry.md` is byte-identical to its `5d603359` version; in `docs/hold-axis.md`, §3 (the pointers' anchor) is byte-identical, and the file has since gained a §4 cross-reference and a changelog; `docs/examples/physics.md` differs by one word ("private" became "public"). Nine pointers change, one in each seed element: `definedIn` of the five hold levels, the last locator of `H1_0` and of `H2_0`, and the first entry of `pointers` of `P1` and of `P2`. Element addresses do not change, so no link field changes. The Tapestry pin (`1e518034`) and the physics pin (`953db3b5`) are unchanged.

## Update mode

`IH_MODE=update` changes records that already exist; it creates nothing and aborts if any IH concept or seed element is absent (run `write` first).

1. It runs the same checks as every other mode first, including the relay-privacy check of decision C: if the `dcosl` preset is enabled, or any outbound stream or `strfry sync` could carry an IH event, or anything cannot be read, it writes nothing.
2. For each of the nine seed elements it reads the stored JSON and rewrites only the IH pointers (`repo` `nous-clawds4/infinite-harness`) to `IH_SHA`, keeping every other field exactly as stored. A pointer to a path outside the list checked at `IH_SHA` (`docs/hold-axis.md`, `docs/examples/physics.md`, `docs/examples/tapestry.md`) makes it refuse before any write. Each changed element is saved with `POST /api/normalize/save-element-json {uuid, json}`, which re-signs it with the Tapestry Assistant's key and republishes it to the local relay under the same address.
3. With `IH_FORCE_SCHEMA=1` it also re-saves, with `POST /api/normalize/save-schema`, every IH schema whose stored copy differs from the script. Today that is two: `ih project` gains `authority`, and `ih ruling` gains `project` and `level` and a schema description stating the §8.3 rule ([`docs/tapestry-concept-model.md`](../docs/tapestry-concept-model.md) §8.4). The `authority` field is added to the schema only. No authority value is written. The authorities are recorded in [`docs/authority.md`](../docs/authority.md), the L0 git anchor, and writing the graph mirror of that value is a separate, later change.
4. It finishes with the same read-back as `export`.

`dry-run` shows the plan without writing: `plan.update` lists each element with the pointer changes, and `plan.schemas` lists each schema as `same` or `differs` with any missing fields. The concept header of `ih ruling` on an existing instance keeps its old description: the normalize API has no endpoint that rewrites a header's description in place. New instances get the corrected text from `create-concept`, and existing ones get it through the schema description.

Tapestry's harness paths are no longer hard-coded. The script reads Tapestry's `scripts/harness-def-paths.txt` from `IH_TAP_DEF_PATHS` if that is set (with no fallback), otherwise from GitHub at the pinned Tapestry commit, otherwise from the copy in the running image, which it records as possibly not matching the pin. If none can be read, `write` refuses to create `H2_0`, and the other modes warn. `update` does not change Tapestry locators; it reports any drift between the stored `H2_0` locators and the file as `checks.h2LocatorDrift`.

After a real update run on the Mac, regenerate `ih-graph.json` and add a file under `runs/`, as for any batch of writes.

## Changelog

- 2026-09-27: created by the CoS (L3). First export after the initial write run.
- 2026-09-27 (public release): the CoS (L3) corrected the description of `ih-seed.js` to match `docs/tapestry-concept-model.md` §1 (loopback calls pass the gate but do not make the caller the Owner; records are signed with Nous' Tapestry Assistant's key, not the Owner's), and added the note on pinned commits above.
- 2026-09-27 (night): the CoS (L3) added `update` mode to `ih-seed.js` (relay check first, then re-pin of the nine IH pointers through `save-element-json`, optional forced `save-schema`), re-pinned the script to public commit `84e245d0`, added the §8.4 fields (`ih project.authority`, `ih ruling.project`, `ih ruling.level`), corrected the `ih ruling` description to the §8.3 rule, and made the script read Tapestry's `harness-def-paths.txt` instead of a hard-coded list. It also corrected the locator counts above (5 and 26, counting the IH pointer). `ih-graph.json` and `runs/` are unchanged, because no run has happened yet.
- 2026-09-27 (late night): the CoS (L3) pointed the update-mode note on the `authority` field to the new L0 file [`docs/authority.md`](../docs/authority.md).
