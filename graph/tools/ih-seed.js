#!/usr/bin/env node
// ih-seed.js — create the Infinite Harness (IH) concepts and a small seed set of
// elements on a local Tapestry instance. Written by the CoS for David Strayhorn,
// 2026-09-27. Model: nous-clawds4/infinite-harness docs/tapestry-concept-model.md
// at 5d603359 (decisions A-E in section 7).
//
// Run INSIDE the tapestry container so calls are genuinely loopback (auth.js
// isDirectLocal -> req.localTrusted), e.g. from the Mac host:
//   docker exec -i -e IH_MODE=dry-run tapestry node - < ~/cos-ih/ih-seed.js
//   docker exec -i -e IH_MODE=write   tapestry node - < ~/cos-ih/ih-seed.js
// Default mode is dry-run. Stdout is one JSON summary; progress goes to stderr.
//
// Steps: (a) instance up; (b) relay privacy confirmed (dcosl preset disabled, no
// enabled up/both stream or strfry sync that could carry an IH event) -- any doubt
// aborts before writing; (c) list existing concepts/elements and skip them;
// (d) create ih concepts + schemas; (e) seed elements; (f) print JSON summary
// (with a read-back export of every ih concept and element).
'use strict';
const fs = require('fs');
const crypto = require('crypto');

const MODE = process.env.IH_MODE || (process.argv.includes('--write') ? 'write' : 'dry-run');
const BASE = process.env.IH_BASE || 'http://127.0.0.1:7778';
const ROUTER_CONFIG_PATH = process.env.IH_ROUTER_CONFIG || '/etc/strfry-router-tapestry.config';
const CRON_PATHS = ['/etc/crontab', '/etc/cron.d', '/var/spool/cron/crontabs', '/var/spool/cron'];
const IH_REPO = 'nous-clawds4/infinite-harness';
const IH_SHA = '5d603359db3239aae890dbf2e9c5888e6d39a146';
const TAP_REPO = 'nous-clawds4/tapestry';
const TAP_SHA = '1e518034a9e0277a79d27747bb26ece59c55023d';
const PHY_REPO = 'nous-clawds4/physics';
const PHY_SHA = '953db3b59cf420c297a2dba18ce5b19f0d81469a';
const IH_KINDS = [39998, 39999];
// Firmware concepts that create-concept stamps as z tags on the core nodes it mints.
const FIRMWARE_Z_SLUGS = ['superset', 'set', 'word', 'json-schema', 'primary-property', 'property',
  'properties-set', 'property-tree-graph', 'graph', 'concept-graph', 'core-nodes-graph'];
const CORE_SUFFIXES = ['superset', 'schema', 'primary-property', 'properties', 'property-tree-graph', 'concept-graph', 'core-nodes-graph'];

const log = (...a) => console.error('[ih-seed]', ...a);
const summary = { tool: 'ih-seed.js', mode: MODE, startedAt: new Date().toISOString(), base: BASE,
  model: `${IH_REPO}@${IH_SHA}:docs/tapestry-concept-model.md`, checks: {}, plan: {}, created: { concepts: [], schemas: [], elements: [] },
  skipped: { concepts: [], elements: [] }, failures: [], aborted: null };

// ── helpers ───────────────────────────────────────────────────
function slug(name) { // == src/lib/dtag.js slug()
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function hash8(s) { return crypto.createHash('sha256').update(s).digest('hex').slice(0, 8); }
function keyName(name) { // == toKeyName in normalize/index.js
  return name.split(/\s+/).map((w, i) => { const l = w.toLowerCase(); return i === 0 ? l : l.charAt(0).toUpperCase() + l.slice(1); }).join('');
}
async function api(method, path, body) {
  const res = await fetch(BASE + path, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  let json = null; const text = await res.text();
  try { json = JSON.parse(text); } catch { json = { _raw: text.slice(0, 300) }; }
  return { status: res.status, json };
}
async function cypherRead(cypher, params) {
  if (/\b(CREATE|MERGE|DELETE|SET|REMOVE|DETACH|DROP|CALL)\b/i.test(cypher)) throw new Error('refusing non-read cypher');
  const r = await api('POST', '/api/neo4j/query', { cypher, params });
  if (r.status !== 200 || !r.json || r.json.success !== true) throw new Error(`neo4j query failed: HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
  return r.json.data || [];
}
function abort(reason) { summary.aborted = reason; finish(2); }
function finish(code) {
  summary.finishedAt = new Date().toISOString();
  const rp = summary.checks.relayPrivacy;
  log('DIGEST ' + JSON.stringify({ mode: MODE, aborted: summary.aborted, instance: summary.checks.instance, endpointsOk: summary.checks.endpoints && Object.values(summary.checks.endpoints).every((p) => p.ok),
    relay: rp && { ok: rp.ok, dcosl: rp.dcoslPreset, problems: rp.problems, outbound: (rp.outboundStreams || []).map((s) => `${s.source}:${s.name}:${s.dir}:${s.couldCarryIH ? 'COULD-CARRY' : 'excluded'}(${s.why})`), notes: rp.notes },
    plan: summary.plan && summary.plan.counts, created: { concepts: summary.created.concepts.length, schemas: summary.created.schemas.length, elements: summary.created.elements.length },
    skipped: { concepts: summary.skipped.concepts.length, elements: summary.skipped.elements.length }, failures: summary.failures,
    reused: summary.checks.reusedConcepts, notReusedPresent: summary.checks.notReused, exportConcepts: summary.export ? summary.export.map((c) => `${c.name}:${c.elements.length}`) : null }));
  // Exit only after stdout has flushed: a piped stdout is asynchronous, and exiting
  // straight after write() truncated the first write-mode summary at 64 KB.
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n', () => process.exit(code));
}
const repoPtr = (repo, sha, path, branch = 'main', anchor) => ({ locatorKind: 'repository',
  locator: `github.com/${repo}@${sha}:${path}${anchor ? '#' + anchor : ''}`, repo, branch, commit: sha, path, ...(anchor ? { anchor } : {}) });

// ── the model: concepts (decision A: links hold addresses; B: pinned pointers) ──
const ADDR = { type: 'string', description: 'address of the linked record (39999:<pubkey>:<d-tag>)' };
const ADDRS = { type: 'array', items: { type: 'string' }, description: 'addresses of the linked records' };
const POINTER = { type: 'object', description: 'pointer out of the graph: locatorKind + locator, pinned to a commit for git (repo, branch, commit, path)',
  properties: { locatorKind: { type: 'string', enum: ['file', 'vault-note', 'nostr-event', 'repository', 'web-address'] }, locator: { type: 'string' },
    repo: { type: 'string' }, branch: { type: 'string' }, commit: { type: 'string' }, path: { type: 'string' }, anchor: { type: 'string' } } };
const POINTERS = { type: 'array', items: POINTER, description: 'pointers out of the graph' };
const S = (d) => ({ type: 'string', description: d });
const CONCEPTS = [
  { name: 'ih project', plural: 'ih projects',
    description: 'An Infinite Harness project P^i: one body of work, usually a repo, whose harness is improved by a ladder of rungs. The record holds the project index and status and links to its goal, base harness and agent. The project files stay in git and are reached by pointers.',
    fields: { index: { type: 'integer', description: 'the project index i (0 is the ladder itself)' }, status: S('active, paused or closed'), openedOn: S('date the project joined IH'),
      goal: ADDR, baseHarness: ADDR, agent: ADDR, repository: POINTER, pointers: POINTERS }, required: ['index'] },
  { name: 'ih harness', plural: 'ih harnesses',
    description: 'One version of a harness H^i_j: the agents, rules, workflows and checks that do a project\'s work (j = 0) or improve the harness below (j > 0). The harness text stays in git; the record pins it to a commit and points at each harness-definition path.',
    fields: { project: ADDR, j: { type: 'integer', description: 'the rung index; 0 is the base harness' }, version: S('commit SHA of this version'), branch: S('branch the version was read from'),
      status: S('current or superseded'), rung: ADDR, supersedes: ADDR, locators: POINTERS }, required: ['project', 'j', 'version'] },
  { name: 'ih rung', plural: 'ih rungs',
    description: 'Rung j of a project\'s ladder: the level whose job is to improve H^i_{j-1}. Holds its scores, the minimum history the rung below needs before this rung may act, and whether it runs separately or merged into the rung below.',
    fields: { project: ADDR, j: { type: 'integer' }, goal: ADDR, improves: ADDR, agent: ADDR, scoreDefinitions: ADDRS, minHistory: S('the measurement gate of hold-axis section 1'),
      mode: { type: 'string', enum: ['separate', 'merged-into-lower'] } }, required: ['project', 'j'] },
  { name: 'ih agent', plural: 'ih agents',
    description: 'An agent A^i_j that runs a harness or a rung: a role such as PM, Rung Manager or reviewer, the model behind it and the account it acts as. Its definition lives elsewhere (an agent file in git, or an external model) and is reached by a pointer.',
    fields: { role: S('PM, Rung Manager, reviewer ...'), model: S('the model behind the agent'), account: S('the account it acts as'), runs: ADDR, rung: ADDR, definition: POINTER } },
  { name: 'ih skill', plural: 'ih skills',
    description: 'A reusable skill used by one or more harnesses, such as a literature-review method or a deploy-chain script. Its hold level is the strictest level of any harness that uses it. The skill text stays in git.',
    fields: { holdLevel: ADDR, provenIn: S('where the skill has proven itself'), usedBy: ADDRS, definition: POINTER } },
  { name: 'ih harness change', plural: 'ih harness changes',
    description: 'An append-only record of one change to a harness: what changed, why, where the idea came from, a prediction of what should happen next, and an audit of any weakened definitions, removed checks or demotions. Never edited; corrections are new records.',
    fields: { summary: S('what changed'), why: S('the reason'), origin: S('where the change came from'), recordedOn: S('date'),
      prediction: { type: 'object', properties: { expect: { type: 'string' }, atRisk: { type: 'string' }, metric: { type: 'string' }, horizon: { type: 'string' }, retrofitted: { type: 'boolean' } } },
      diffAudit: { type: 'object', properties: { weakenedDefinitions: { type: 'array', items: { type: 'string' } }, removedChecks: { type: 'array', items: { type: 'string' } }, demotions: { type: 'array', items: { type: 'string' } } } },
      modifies: ADDR, madeBy: ADDR, touches: ADDRS, evidence: POINTERS }, required: ['summary', 'why', 'modifies'] },
  { name: 'ih change outcome', plural: 'ih change outcomes',
    description: 'An append-only verdict on a harness change: confirmed, refuted, reverted or inconclusive, with the before and after values and the evaluations it rests on. A harness change with an outcome is one data point for the rung above.',
    fields: { verdict: { type: 'string', enum: ['confirmed', 'refuted', 'reverted', 'inconclusive'] }, before: S('value before'), after: S('value after'), observedOn: S('date'),
      change: ADDR, evaluations: ADDRS, evidence: POINTERS }, required: ['verdict', 'change'] },
  { name: 'ih hold level', plural: 'ih hold levels',
    description: 'One level of the how-strongly-held axis, L0 (Locked) to L4 (Free): who may change an item at this level and what a change requires. Five fixed records, defined by hold-axis.md in the IH repo.',
    fields: { rank: { type: 'integer', description: '0 (Locked) to 4 (Free)' }, label: S('Locked, Sign-off, Reviewed, Disclosed or Free'), whoMayChange: S('who may change an item at this level'),
      requires: S('what a change requires'), definedIn: POINTER }, required: ['rank', 'label'] },
  { name: 'ih item', plural: 'ih items',
    description: 'A rule, check, definition or file of a harness, placed on the hold axis. The text stays in git and is reached by a pointer; the current hold level is derived from the item\'s latest valid rating.',
    fields: { itemType: S('rule, check, definition or file'), summary: S('short summary; the text stays in git'), harness: ADDR, holdLevel: ADDR, locator: POINTER } },
  { name: 'ih hold rating', plural: 'ih hold ratings',
    description: 'An append-only re-rating of an item on the hold axis, from one level to another. A promotion (toward L0) is always allowed; a demotion (toward L4) is valid only with a ruling from the level above.',
    fields: { item: ADDR, from: ADDR, to: ADDR, direction: { type: 'string', enum: ['promote', 'demote'] }, reason: S('why'), proposedBy: S('who proposed it'), ruling: ADDR, ratedOn: S('date') },
    required: ['item', 'to', 'direction'] },
  { name: 'ih ruling', plural: 'ih rulings',
    description: 'A decision, approve or refuse, on a hold rating or a harness change, by the level above the proposer (the human for anything at L0-L1 or touching a goal). The ruling points at the git commit or PR where it was made; git, not the graph signature, is the proof.',
    fields: { decision: { type: 'string', enum: ['approve', 'refuse'] }, reason: S('why'), ruledBy: S('who ruled'), ruledOn: S('date'), decides: ADDR, evidence: POINTERS }, required: ['decision', 'decides'] },
  { name: 'ih score', plural: 'ih scores',
    description: 'A score S^i_j that rung j uses to tell a better harness below it from a worse one: how it is computed, whether it is held out from the rung being scored, and which direction is better.',
    fields: { method: S('how it is computed'), heldOut: { type: 'boolean' }, direction: { type: 'string', enum: ['higher', 'lower'] }, rung: ADDR, computedBy: POINTER } },
  { name: 'ih evaluation', plural: 'ih evaluations',
    description: 'An append-only measurement of a score: a value over a sample and a time window, for a harness version or a harness change, with pointers to the evidence (a CI run, a PR, an output file).',
    fields: { value: { type: 'number' }, n: { type: 'integer' }, measuredOn: S('date'), window: S('time window'), score: ADDR, harness: ADDR, change: ADDR, evidence: POINTERS }, required: ['score'] },
];
for (const c of CONCEPTS) {
  c.slug = slug(c.name); c.key = keyName(c.name);
  c.schema = { type: 'object', properties: { [c.key]: { type: 'object', title: c.name.replace(/\b\w/g, (m) => m.toUpperCase()),
    required: ['name', 'slug', 'description', ...(c.required || [])],
    properties: { name: S('the record name'), slug: S('stable identity derived from the name'), description: S('a short description'), ...c.fields },
    'x-tapestry': { unique: ['slug'] } } }, required: [c.key] };
}
const REUSED = ['tapestry owner goal', 'tapestry external resource', 'tapestry proposal', 'tapestry work record'];
const NOT_REUSED = ['tapestry team', 'tapestry executive action', 'tapestry privacy level', 'maturational state of a concept'];

// ── seed elements (built once the TA pubkey is known) ─────────
const HOLD = [
  ['L0', 'Locked', 'Only the human', 'The human makes or authors the change'],
  ['L1', 'Sign-off', 'An agent may propose', 'Explicit human sign-off before it takes effect'],
  ['L2', 'Reviewed', 'An agent may propose', 'Peer or panel review before it takes effect'],
  ['L3', 'Disclosed', 'An agent may change it', 'Open disclosure, with reasons, where readers will see it (for example, in the artifact\'s own changelog); reviewable after the fact'],
  ['L4', 'Free', 'An agent may change it', 'Nothing beyond the log (commit or PR history)'],
];
const TAP_HARNESS_PATHS = ['CLAUDE.md', 'AGENTS.md', 'engineering-team/README.md', 'engineering-team/roles', 'engineering-team/workflows', 'engineering-team/templates',
  'engineering-team/CHANGELOG.md', 'product-team/README.md', 'product-team/roles', 'product-team/workflows', 'product-team/templates', 'product-team/guardrails',
  '.claude/agents', '.claude/commands', '.claude/skills', '.claude/settings.json', 'scripts/whats-open.sh', 'scripts/session-start.sh', 'scripts/harness-lint.sh',
  'scripts/harness-stats.sh', 'scripts/lib', 'scripts/harness-lint-waivers.txt', 'scripts/harness-budgets.txt', 'scripts/harness-def-paths.txt', 'scripts/long-lived-branches.txt'];
const PHY_HARNESS_PATHS = ['papers', 'public-papers/observer-space-framework', 'public-papers/observer-space-framework/versions', 'public-papers/observer-space-framework/reviews'];

function conceptAddr(ta, c) { return `39998:${ta}:${c.slug}`; }
function buildElements(ta) {
  const C = Object.fromEntries(CONCEPTS.map((c) => [c.name, c]));
  const el = (conceptName, name, fields) => {
    const c = C[conceptName]; const cAddr = conceptAddr(ta, c); const dTag = `${slug(name)}-${hash8(cAddr)}`;
    return { concept: conceptName, name, dTag, address: `39999:${ta}:${dTag}`, json: { [c.key]: { name, slug: slug(name), ...fields } } };
  };
  const out = [];
  for (const [code, label, who, req] of HOLD) {
    out.push(el('ih hold level', `${code} ${label}`, { description: `Hold level ${code}, ${label}: ${who.toLowerCase()}; a change requires: ${req.charAt(0).toLowerCase() + req.slice(1)}.`,
      rank: Number(code.slice(1)), label, whoMayChange: who, requires: req, definedIn: repoPtr(IH_REPO, IH_SHA, 'docs/hold-axis.md', 'main', '3-the-axis-how-strongly-held') }));
  }
  const addrOf = (concept, name) => el(concept, name, {}).address;
  const P1 = 'P1 physics', P2 = 'P2 tapestry', H1 = 'H1_0 physics base harness', H2 = 'H2_0 tapestry base harness';
  out.push(el('ih harness', H1, { description: 'The base harness of the physics program as of 2026-09-27: the CoS and the Geometry, Literature and Ontology panel, the outline-panel-prose-cold-review pipeline, version and review folders, and the merge gate.',
    project: addrOf('ih project', P1), j: 0, version: PHY_SHA, branch: 'main', status: 'current',
    locators: [...PHY_HARNESS_PATHS.map((p) => repoPtr(PHY_REPO, PHY_SHA, p)), repoPtr(IH_REPO, IH_SHA, 'docs/examples/physics.md')] }));
  out.push(el('ih harness', H2, { description: 'The base harness of the Tapestry repo as of 2026-09-27: Engineering Team Mode, the Product Team flow, CI and the main-source guard, the release flow, the ledger, and the self-improvement machinery. The harness is defined by scripts/harness-def-paths.txt; one locator per path.',
    project: addrOf('ih project', P2), j: 0, version: TAP_SHA, branch: 'main', status: 'current',
    locators: [...TAP_HARNESS_PATHS.map((p) => repoPtr(TAP_REPO, TAP_SHA, p)), repoPtr(IH_REPO, IH_SHA, 'docs/examples/tapestry.md')] }));
  out.push(el('ih project', P1, { description: 'Project P^1: David Strayhorn\'s physics program, a precise theory of the observer from which the Born rule is derived, not assumed.',
    index: 1, status: 'active', baseHarness: addrOf('ih harness', H1), repository: repoPtr(PHY_REPO, PHY_SHA, ''),
    pointers: [repoPtr(IH_REPO, IH_SHA, 'docs/examples/physics.md')] }));
  out.push(el('ih project', P2, { description: 'Project P^2: the Tapestry repo, managed so that Tapestry advances toward its README and ROADMAP goals for every kind of instance (personal, community, enterprise search service) without violating its architecture invariants.',
    index: 2, status: 'active', baseHarness: addrOf('ih harness', H2), repository: repoPtr(TAP_REPO, TAP_SHA, ''),
    pointers: [repoPtr(IH_REPO, IH_SHA, 'docs/examples/tapestry.md'), repoPtr(TAP_REPO, TAP_SHA, 'README.md'), repoPtr(TAP_REPO, TAP_SHA, 'ROADMAP.md')] }));
  return out;
}

// ── (b) relay privacy ─────────────────────────────────────────
function parseRouterConfig(text) {
  const streams = []; let cur = null; let inUrls = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    let m;
    if (!cur && (m = line.match(/^([A-Za-z0-9_-]+)\s*\{$/)) && m[1] !== 'streams') { cur = { name: m[1], urls: [] }; continue; }
    if (!cur) continue;
    if (inUrls) { if (line.startsWith(']')) { inUrls = false; continue; } const u = line.match(/^"([^"]+)"/); if (u) cur.urls.push(u[1]); continue; }
    if ((m = line.match(/^dir\s*=\s*"([^"]*)"/))) cur.dir = m[1];
    else if ((m = line.match(/^filter\s*=\s*(.+)$/))) { try { cur.filter = JSON.parse(m[1]); } catch { cur.filterUnparseable = m[1]; } }
    else if (/^urls\s*=\s*\[\s*\]$/.test(line)) { /* none */ }
    else if (/^urls\s*=\s*\[$/.test(line)) inUrls = true;
    else if (line === '}') { streams.push(cur); cur = null; }
  }
  return streams;
}
function zValueCouldBeOurs(v, ta) {
  const parts = String(v).split(':');
  if (parts.length < 3) return true; // unknown shape: conservative
  const [kind, pk, ...rest] = parts; const d = rest.join(':');
  if (pk === ta) return true; // anything under the TA (our new concept headers)
  if (kind === '39998' && FIRMWARE_Z_SLUGS.includes(d)) return true;
  return false;
}
// Could this filter match any event an IH write produces? (kinds 39998/39999, author = TA,
// z tags = our ih headers or the firmware core-node concepts; other tags: d, name, names,
// slug, json, description, concept-graph). Conservative: unknown => true.
function filterCouldMatchIH(filter, ta) {
  if (!filter || typeof filter !== 'object') return { match: true, why: 'no filter' };
  if (Array.isArray(filter.kinds) && filter.kinds.length > 0 && !filter.kinds.some((k) => IH_KINDS.includes(k))) return { match: false, why: 'kinds exclude 39998/39999' };
  if (Array.isArray(filter.authors) && filter.authors.length > 0 && !filter.authors.includes(ta)) return { match: false, why: 'authors exclude the TA' };
  if (Array.isArray(filter.ids) && filter.ids.length > 0) return { match: false, why: 'fixed ids' };
  if (Array.isArray(filter['#z']) && filter['#z'].length > 0 && !filter['#z'].some((v) => zValueCouldBeOurs(v, ta))) return { match: false, why: '#z limited to non-IH concepts' };
  return { match: true, why: 'filter admits IH kinds/authors/tags' };
}
function listCron() {
  let text = '';
  for (const p of CRON_PATHS) {
    try { const st = fs.statSync(p);
      if (st.isDirectory()) for (const f of fs.readdirSync(p)) { try { text += fs.readFileSync(`${p}/${f}`, 'utf8') + '\n'; } catch {} }
      else text += fs.readFileSync(p, 'utf8') + '\n';
    } catch {}
  }
  return text;
}
function listProcs() {
  const out = [];
  for (const pid of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(pid)) continue;
    try { const c = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').join(' ').trim(); if (c) out.push(c); } catch {}
  }
  return out;
}
function syncLineIsOutbound(line) {
  if (/syncDCoSL/.test(line)) return true;
  if (!/strfry\s+sync\b/.test(line)) return false;
  const m = line.match(/--dir[ =]+(\w+)/);
  return !m || m[1] !== 'down'; // strfry sync defaults to both
}
async function checkRelayPrivacy(ta) {
  const r = { ok: false, problems: [], notes: [] };
  const rs = await api('GET', '/api/strfry/router-status');
  const streams = rs.json && rs.json.router && rs.json.router.streams;
  if (rs.status !== 200 || !Array.isArray(streams) || streams.length === 0) { r.problems.push(`router-status unreadable (HTTP ${rs.status})`); return r; }
  r.routerProcess = rs.json.router.process;
  const dcosl = streams.find((s) => s.name === 'dcosl');
  if (!dcosl) r.problems.push('dcosl preset missing from router state (cannot confirm)');
  else if (dcosl.enabled !== false) r.problems.push('dcosl preset is ENABLED');
  r.dcoslPreset = dcosl ? { enabled: dcosl.enabled, dir: dcosl.dir, urls: dcosl.urls } : null;
  let cfgText = null;
  try { cfgText = fs.readFileSync(ROUTER_CONFIG_PATH, 'utf8'); } catch (e) { r.problems.push(`router config unreadable: ${e.message}`); }
  const enabledState = streams.filter((s) => s.enabled !== false);
  let cfgStreams = [];
  if (cfgText != null) {
    cfgStreams = parseRouterConfig(cfgText);
    const a = enabledState.map((s) => s.name).sort().join(','), b = cfgStreams.map((s) => s.name).sort().join(',');
    if (a !== b) r.problems.push(`router config streams [${b}] differ from enabled state streams [${a}] (cannot confirm)`);
    if (cfgStreams.some((s) => s.name === 'dcosl')) r.problems.push('dcosl stream present in the running router config');
    for (const s of cfgStreams) if (s.filterUnparseable) r.problems.push(`router config stream ${s.name}: filter unparseable`);
  }
  r.outboundStreams = [];
  const seen = new Set();
  for (const [src, list] of [['state', enabledState], ['config', cfgStreams]]) {
    for (const s of list) {
      if (!['up', 'both'].includes(s.dir)) { if (!s.dir) r.problems.push(`${src} stream ${s.name}: no dir (cannot confirm)`); continue; }
      const verdict = filterCouldMatchIH(s.filter, ta);
      const k = `${src}:${s.name}`; if (seen.has(k)) continue; seen.add(k);
      r.outboundStreams.push({ source: src, name: s.name, dir: s.dir, urls: s.urls, filter: s.filter, couldCarryIH: verdict.match, why: verdict.why });
      if (verdict.match) r.problems.push(`${src} stream ${s.name} (${s.dir}) could carry IH events: ${verdict.why}`);
    }
  }
  let cron = '', procs = [];
  try { cron = listCron(); procs = listProcs(); } catch (e) { r.problems.push(`cannot inspect cron/processes: ${e.message}`); }
  if (procs.length === 0) r.problems.push('no processes visible in /proc (cannot confirm)');
  const badCron = cron.split('\n').filter((l) => !l.trim().startsWith('#') && syncLineIsOutbound(l));
  const badProcs = procs.filter(syncLineIsOutbound);
  if (badCron.length) r.problems.push(`outbound strfry sync scheduled in cron: ${badCron.join(' | ')}`);
  if (badProcs.length) r.problems.push(`outbound strfry sync running: ${badProcs.join(' | ')}`);
  r.notes.push(`cron lines inspected: ${cron.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).length}; processes inspected: ${procs.length}; strfry router running: ${procs.some((p) => /strfry router/.test(p))}`);
  r.ok = r.problems.length === 0;
  return r;
}

// ── main ──────────────────────────────────────────────────────
(async () => {
  if (!['dry-run', 'write', 'export'].includes(MODE)) return abort(`unknown mode ${MODE}`);
  log(`mode=${MODE} base=${BASE}`);
  // (a) instance up
  const pk = await api('GET', '/api/assistant/pubkey').catch((e) => ({ status: 0, json: { error: e.message } }));
  const ta = pk.json && pk.json.pubkey;
  if (pk.status !== 200 || !/^[0-9a-f]{64}$/.test(ta || '')) return abort(`instance not up or TA pubkey unavailable: HTTP ${pk.status} ${JSON.stringify(pk.json)}`);
  const sm = await api('GET', '/api/concept-graph/summaries');
  if (sm.status !== 200 || !sm.json || sm.json.success !== true || !Array.isArray(sm.json.summaries)) return abort(`concept summaries unavailable: HTTP ${sm.status}`);
  summary.checks.instance = { ok: true, taPubkey: ta, conceptCount: sm.json.summaries.length };
  // Endpoint probes: validation-only calls that return 400 before any write.
  const probes = {};
  for (const [path, expect] of [['/api/normalize/create-concept', 'Concept name is required'], ['/api/normalize/save-schema', 'Missing concept name'], ['/api/normalize/create-element', 'Missing concept name']]) {
    const r = await api('POST', path, {});
    probes[path] = { status: r.status, error: r.json && r.json.error, ok: r.status === 400 && r.json && r.json.error === expect };
  }
  summary.checks.endpoints = probes;
  if (!Object.values(probes).every((p) => p.ok)) return abort('normalize endpoints did not answer as the source expects (auth or version differs)');
  // (b) relay privacy
  const relay = await checkRelayPrivacy(ta);
  summary.checks.relayPrivacy = relay;
  if (!relay.ok) return abort('relay privacy not confirmed: ' + relay.problems.join('; '));
  // (c) existing concepts / elements
  const byName = new Map(sm.json.summaries.map((s) => [s.name, s]));
  summary.checks.reusedConcepts = REUSED.map((n) => ({ name: n, present: byName.has(n), address: byName.get(n)?.handle || null, elements: byName.get(n)?.elementCount ?? null }));
  summary.checks.notReused = NOT_REUSED.map((n) => ({ name: n, present: byName.has(n) }));
  const coreAddrs = []; for (const c of CONCEPTS) { coreAddrs.push(conceptAddr(ta, c)); for (const s of CORE_SUFFIXES) coreAddrs.push(`39999:${ta}:${c.slug}-${s}`); }
  const elements = buildElements(ta);
  const existingRows = await cypherRead('MATCH (n:NostrEvent) WHERE n.uuid IN $u RETURN n.uuid AS uuid, n.name AS name', { u: [...coreAddrs, ...elements.map((e) => e.address)] });
  const existing = new Set(existingRows.map((r) => r.uuid));
  const planConcepts = [];
  for (const c of CONCEPTS) {
    const addr = conceptAddr(ta, c); const hit = byName.get(c.name);
    const coreHits = CORE_SUFFIXES.map((s) => `39999:${ta}:${c.slug}-${s}`).filter((a) => existing.has(a));
    if (hit) { planConcepts.push({ name: c.name, action: 'skip-exists', address: hit.handle, schema: hit.handle === addr ? 'check' : 'leave' }); continue; }
    if (existing.has(addr) || coreHits.length) return abort(`address collision for concept ${c.name}: ${[addr, ...coreHits].filter((a) => existing.has(a)).join(', ')} already exist under another name`);
    planConcepts.push({ name: c.name, plural: c.plural, action: 'create', address: addr, primaryPropertyKey: c.key, fields: Object.keys(c.schema.properties[c.key].properties) });
  }
  const planElements = elements.map((e) => ({ concept: e.concept, name: e.name, address: e.address, action: existing.has(e.address) ? 'skip-exists' : 'create' }));
  summary.plan = { concepts: planConcepts, elements: planElements,
    counts: { conceptsToCreate: planConcepts.filter((p) => p.action === 'create').length, conceptsExisting: planConcepts.filter((p) => p.action !== 'create').length,
      elementsToCreate: planElements.filter((p) => p.action === 'create').length, elementsExisting: planElements.filter((p) => p.action !== 'create').length } };
  summary.elementsPlanned = elements; // full json, for review and for the graph/ export
  if (MODE === 'dry-run') { log('dry run complete; no writes'); return finish(0); }
  if (MODE === 'export') { delete summary.elementsPlanned; await readBack(ta); log('export complete; no writes'); return finish(0); }

  // (d) concepts + schemas
  for (const p of planConcepts) {
    const c = CONCEPTS.find((x) => x.name === p.name);
    if (p.action === 'create') {
      log(`create-concept ${c.name}`);
      const r = await api('POST', '/api/normalize/create-concept', { name: c.name, plural: c.plural, description: c.description });
      const uuid = r.json && r.json.concept && r.json.concept.uuid;
      if (r.status !== 200 || !r.json.success || uuid !== p.address) { summary.failures.push({ step: 'create-concept', name: c.name, status: r.status, response: r.json }); return abort(`create-concept failed or returned an unexpected address for ${c.name}`); }
      summary.created.concepts.push({ name: c.name, plural: c.plural, address: uuid, schemaNode: r.json.concept.schema });
    } else {
      summary.skipped.concepts.push({ name: c.name, address: p.address, reason: 'already exists' });
    }
    let needSchema = p.action === 'create';
    if (p.schema === 'check') {
      const rows = await cypherRead("MATCH (n:NostrEvent {uuid: $u}) OPTIONAL MATCH (n)-[:HAS_TAG]->(t:NostrEventTag {type: 'json'}) RETURN head(collect(t.value)) AS json", { u: `39999:${ta}:${c.slug}-schema` });
      let props = null; try { props = JSON.parse(rows[0]?.json || 'null')?.jsonSchema?.properties; } catch {}
      needSchema = !(props && props[c.key]);
    }
    if (needSchema) {
      log(`save-schema ${c.name}`);
      const r = await api('POST', '/api/normalize/save-schema', { concept: c.name, schema: c.schema });
      if (r.status !== 200 || !r.json.success) { summary.failures.push({ step: 'save-schema', name: c.name, status: r.status, response: r.json }); return abort(`save-schema failed for ${c.name}`); }
      summary.created.schemas.push({ concept: c.name, schemaNode: r.json.schemaUuid, primaryProperty: r.json.primaryProperty });
    }
  }
  // (e) seed elements
  for (const e of elements) {
    if (existing.has(e.address)) { summary.skipped.elements.push({ concept: e.concept, name: e.name, address: e.address, reason: 'already exists' }); continue; }
    log(`create-element ${e.concept} / ${e.name}`);
    const r = await api('POST', '/api/normalize/create-element', { concept: e.concept, name: e.name, dTag: e.dTag, json: e.json });
    const uuid = r.json && r.json.element && r.json.element.uuid;
    if (r.status !== 200 || !r.json.success || uuid !== e.address) { summary.failures.push({ step: 'create-element', concept: e.concept, name: e.name, status: r.status, response: r.json }); return abort(`create-element failed or returned an unexpected address for ${e.name}`); }
    summary.created.elements.push({ concept: e.concept, name: e.name, address: uuid });
  }
  await readBack(ta);
  finish(summary.failures.length ? 1 : 0);
})().catch((e) => { summary.failures.push({ step: 'uncaught', error: e.message }); abort('uncaught error: ' + e.message); });

// (f) read back: every ih concept and its elements, for the graph/ export
async function readBack(ta) {
  const sm2 = await api('GET', '/api/concept-graph/summaries');
  const ihHeaders = (sm2.json.summaries || []).filter((s) => s.name && s.name.startsWith('ih '));
  const exp = [];
  for (const h of ihHeaders) {
    const c = CONCEPTS.find((x) => x.name === h.name);
    const schemaRows = c ? await cypherRead("MATCH (n:NostrEvent {uuid: $u}) OPTIONAL MATCH (n)-[:HAS_TAG]->(t:NostrEventTag {type: 'json'}) RETURN head(collect(t.value)) AS json", { u: `39999:${ta}:${c.slug}-schema` }) : [];
    let schema = null; try { schema = JSON.parse(schemaRows[0]?.json || 'null')?.jsonSchema || null; } catch {}
    const els = await cypherRead("MATCH (e:NostrEvent)-[:HAS_TAG]->(:NostrEventTag {type: 'z', value: $h}) WHERE e.kind = 39999 OPTIONAL MATCH (e)-[:HAS_TAG]->(j:NostrEventTag {type: 'json'}) WITH DISTINCT e, head(collect(j.value)) AS json RETURN e.uuid AS address, e.name AS name, e.created_at AS createdAt, json ORDER BY name", { h: h.handle });
    exp.push({ name: h.name, address: h.handle, elementCount: h.elementCount, description: h.description, schema,
      elements: els.map((x) => { let j = x.json; try { j = JSON.parse(x.json); } catch {} return { name: x.name, address: x.address, createdAt: x.createdAt, json: j }; }) });
  }
  summary.export = exp;
}
