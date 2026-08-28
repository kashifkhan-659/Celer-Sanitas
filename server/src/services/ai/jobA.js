import { FAST_MODEL } from '../../config/models.js';
import { MUST_NEVER, JOB_A_PROMPT } from '../../prompts/index.js';
import { chat } from './groqClient.js';

// Job A — natural phrasing (handoff §4). Rewords ONE fixed tree question so it reads like a person
// asked it. It never decides anything: the question, the options and the branching are all fixed
// code (Architecture.md §4 invariant).
//
// The node's OPTION LABELS go in alongside the question. Without them the model cannot see what
// shape of answer the patient can actually give, and invents one — qwen3.8-27b rewrote every
// severity node as "on a scale from 1 to 10" while the buttons said mild/moderate/severe. Passing
// the labels is a narrowing of the existing "add no information" rule, not a new freedom: the
// prompt shows them so the model can avoid contradicting them, and forbids repeating them.
//
// A patient is waiting on this call, so EVERY failure mode — API error, timeout, empty response —
// returns the fixed question unchanged. The flow never stalls on Job A.
export async function rephraseQuestion(question, options) {
  // No options means no way to know what answer format is legal, so don't risk inventing one.
  const labels = (options ?? []).map((o) => o?.label).filter(Boolean);
  if (!labels.length) return question;

  try {
    const { content } = await chat({
      model: FAST_MODEL,
      system: MUST_NEVER,
      // Function form of .replace so a `$&` in the tree text can't be read as a replacement
      // pattern. The tree text is trusted, but this costs nothing.
      user: JOB_A_PROMPT
        .replace('{option_list}', () => labels.join(', '))
        .replace('{fixed_question_text}', () => question),
      maxTokens: 150,
      temperature: 0.2, // consistency matters more than creativity here (handoff §4)
      timeoutMs: 5000,
    });
    // Models like to wrap a one-line answer in quotes; strip them, then fall back if nothing is left.
    return content.replace(/^["']|["']$/g, '').trim() || question;
  } catch (err) {
    // Outcome only — never the question, never patient text (handoff §1).
    console.warn(`jobA: fallback to fixed question (${err.message})`);
    return question;
  }
}
