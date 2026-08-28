import { FAST_MODEL } from '../../config/models.js';
import { MUST_NEVER, JOB_B_PROMPT } from '../../prompts/index.js';
import { chat } from './groqClient.js';

// Job B — free-text classification (handoff §4). Maps what the patient typed onto ONE of the
// node's own fixed options. It never invents an option and it never branches: the caller feeds the
// returned ID back into the pure tree engine (Architecture.md §4 invariant).
//
// The model's answer is UNTRUSTED INPUT. It is checked against the real option list on every call,
// so anything the model returns that is not a genuine ID of THIS node degrades to UNCLEAR. On
// UNCLEAR — or any error — the caller shows the fixed buttons and the patient picks (Rules.md §3);
// a wrong guess here silently corrupts Job C's summary later, so guessing is never the fallback.
export const UNCLEAR = 'UNCLEAR';

export async function classifyAnswer(freeText, options) {
  const validIds = new Set((options ?? []).map((o) => o?.id));
  if (!validIds.size || typeof freeText !== 'string' || !freeText.trim()) return UNCLEAR;

  try {
    const { content: raw } = await chat({
      model: FAST_MODEL,
      system: MUST_NEVER,
      user: JOB_B_PROMPT
        .replace('{option_list}', () => options.map((o) => `${o.id} (${o.label})`).join(', '))
        .replace('{free_text}', () => freeText),
      maxTokens: 20,
      temperature: 0, // a classification, not a composition — no room for variety
      timeoutMs: 5000,
    });
    // Tolerate the usual wrappers (quotes, a trailing period, stray whitespace) but nothing more:
    // the result still has to BE one of this node's IDs or it is UNCLEAR.
    const id = raw.trim().replace(/^["'`]+|["'`.\s]+$/g, '');
    return validIds.has(id) ? id : UNCLEAR;
  } catch (err) {
    console.warn(`jobB: fallback to fixed options (${err.message})`);
    return UNCLEAR;
  }
}
