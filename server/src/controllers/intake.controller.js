import { loadTree } from '../services/tree/loadTree.js';
import { getNode } from '../services/tree/nextNode.js';
import { rephraseQuestion } from '../services/ai/jobA.js';
import { classifyAnswer, UNCLEAR } from '../services/ai/jobB.js';

// Intake controller — the ONLY place Jobs A and B touch a request (Rules.md §4: thin, validate ->
// call service -> respond).
//
// What this layer does NOT do is decide anything. The client walks the tree with the same pure
// nextNode.js this file imports, and these two endpoints only ever PHRASE a question that already
// exists or MAP free text onto an option that already exists. Branching stays in code
// (Architecture.md §4 invariant), which is what makes "AI never decides the path" literally true.

const MAX_FREE_TEXT = 500; // trust boundary: cap what reaches the model, in characters

// Resolve a (category, nodeId) pair against the real tree. Both are request input, so both are
// validated here rather than trusted: loadTree whitelists the category, and an unknown node id is
// rejected instead of being passed on to a model.
function resolveNode(category, nodeId) {
  const node = getNode(loadTree(category), nodeId);
  if (!node) throw new Error(`unknown node: ${nodeId}`);
  return node;
}

function fail(res, err) {
  const bad = /invalid category|unknown node|invalid text/i.test(err.message);
  res.status(bad ? 400 : 500).json({ error: bad ? 'invalid request' : 'internal error' });
}

// GET /api/intake/:category/:nodeId/question
// Returns the node's question in natural phrasing. Job A falls back to the fixed text on any
// failure, so this endpoint cannot stall the patient — it always returns a usable question.
export async function getPhrasedQuestion(req, res) {
  try {
    const { category, nodeId } = req.params;
    const node = resolveNode(category, nodeId);
    const question = await rephraseQuestion(node.question, node.options);
    // `fixedQuestion` is returned alongside so the client can tell phrasing from fallback without
    // a second request, and so the transcript can record what was actually asked.
    res.json({ nodeId: node.id, question, fixedQuestion: node.question, options: node.options });
  } catch (err) {
    fail(res, err);
  }
}

// POST /api/intake/:category/:nodeId/classify   body: { text }
// Maps free text onto one of THIS node's options. Returns { optionId } where optionId is either a
// real option id or "UNCLEAR" — Job B validates against the live option list, so nothing else can
// come back. On UNCLEAR the client shows the fixed buttons and the patient picks (Rules.md §3).
export async function classifyFreeText(req, res) {
  try {
    const { category, nodeId } = req.params;
    const { text } = req.body ?? {};
    if (typeof text !== 'string' || !text.trim() || text.length > MAX_FREE_TEXT) {
      throw new Error('invalid text');
    }
    const node = resolveNode(category, nodeId);
    const optionId = await classifyAnswer(text, node.options);
    res.json({ nodeId: node.id, optionId, unclear: optionId === UNCLEAR });
  } catch (err) {
    fail(res, err);
  }
}
