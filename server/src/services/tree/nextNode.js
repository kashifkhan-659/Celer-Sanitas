// Pure tree traversal — NO AI, no I/O, no side effects (Rules.md §4; Architecture.md §4 invariant).
//
// Deterministic: the same (tree, nodeId, optionId) always yields the same result. This file has
// ZERO imports and touches no Node built-ins, so it runs unchanged in the browser AND on the
// server — client and server share ONE branching engine, with no duplicated logic. That shared
// purity is what makes the claim "code decides branching, not AI" provably true for guided mode.

export function getNode(tree, nodeId) {
  return tree?.nodes?.[nodeId] ?? null;
}

export function startNode(tree) {
  return getNode(tree, tree?.start);
}

// A node is a leaf (end of intake) when it has no onward branches.
export function isLeaf(tree, nodeId) {
  const node = getNode(tree, nodeId);
  return !node || !node.next || Object.keys(node.next).length === 0;
}

// The next node for a chosen option, or null at the end of intake (leaf, or an option with no branch).
export function nextNode(tree, currentNodeId, optionId) {
  const node = getNode(tree, currentNodeId);
  if (!node || !node.next) return null;
  const nextId = node.next[optionId];
  return nextId ? getNode(tree, nextId) : null;
}
