// Loads a symptom-tree JSON by category. Server-only (uses fs) — the client imports the tree JSON
// directly, so this file is never bundled into the frontend. Deterministic given the file on disk.
// NO AI (Rules.md §4).
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { strict as assert } from 'node:assert';
import { startNode, nextNode, isLeaf } from './nextNode.js';

const TREES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'trees');

// `category` is a trust-boundary input (it will arrive from a request). Never interpolate it into a
// path unchecked — whitelist the shape so it cannot escape the trees directory.
function assertCategory(category) {
  if (typeof category !== 'string' || !/^[a-z][a-z_]*$/.test(category)) {
    throw new Error(`invalid category: ${JSON.stringify(category)}`);
  }
}

// Catch authoring mistakes at load time, not mid-intake: every branch target must resolve.
function assertValidTree(tree) {
  if (!tree || typeof tree !== 'object' || !tree.nodes || !tree.start) throw new Error('tree missing nodes/start');
  if (!tree.nodes[tree.start]) throw new Error(`start node "${tree.start}" not found in nodes`);
  for (const [id, node] of Object.entries(tree.nodes)) {
    if (!node.question) throw new Error(`node "${id}" missing question`);
    for (const target of Object.values(node.next ?? {})) {
      if (!tree.nodes[target]) throw new Error(`node "${id}" points to missing node "${target}"`);
    }
  }
  return tree;
}

export function loadTree(category) {
  assertCategory(category);
  const tree = JSON.parse(readFileSync(join(TREES_DIR, `${category}.json`), 'utf8'));
  return assertValidTree(tree);
}

// Self-check: `node loadTree.js` — walks real paths and fails loudly if traversal breaks. Lives
// here (not in nextNode.js) so nextNode.js stays free of Node built-ins and browser-safe.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tree = loadTree('chest_pain');

  assert.equal(startNode(tree).id, 'onset', 'start is onset');
  assert.equal(nextNode(tree, 'character', 'sharp').id, 'breathing', 'sharp branches to breathing');
  assert.equal(nextNode(tree, 'character', 'burning').id, 'meals', 'burning branches to meals');
  assert.equal(nextNode(tree, 'character', 'pressure').id, 'radiation', 'pressure branches to radiation');
  assert.ok(isLeaf(tree, 'history'), 'history is a leaf');
  assert.equal(nextNode(tree, 'history', 'before'), null, 'leaf has no next node');
  assert.equal(nextNode(tree, 'onset', 'not_a_real_option'), null, 'unknown option ends intake, not crash');

  // Walk one full path start→leaf, proving every step resolves (no dangling next targets).
  let node = startNode(tree);
  let steps = 0;
  while (!isLeaf(tree, node.id) && steps < 50) {
    node = nextNode(tree, node.id, node.options[0].id);
    assert.ok(node, `step ${steps} resolved to a node`);
    steps++;
  }
  assert.ok(isLeaf(tree, node.id), 'walk ended on a leaf');
  console.log(`loadTree self-check passed — walked ${steps} steps to leaf "${node.id}"`);
}
