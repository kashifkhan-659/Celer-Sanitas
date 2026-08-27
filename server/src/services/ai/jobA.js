import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API_KEY } from '../../config/env.js';
import { HAIKU_MODEL } from '../../config/models.js';
import { MUST_NEVER, JOB_A_PROMPT } from '../../prompts/index.js';

// Job A — natural phrasing (handoff §4). Rewords ONE fixed tree question so it reads like a person
// asked it. It never decides anything: the question, the options and the branching are all fixed
// code (Architecture.md §4 invariant).
//
// A patient is waiting on this call, so the budget is tight and EVERY failure mode — API error,
// timeout, empty or non-text response — returns the fixed question unchanged. The flow never stalls
// on Job A. Timeout is in milliseconds (TS SDK); one SDK retry, so the worst case is ~10s.
const client = new Anthropic({ apiKey: CLAUDE_API_KEY, timeout: 5000, maxRetries: 1 });

export async function rephraseQuestion(question) {
  try {
    const res = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 150,
      temperature: 0.2, // consistency matters more than creativity here (handoff §4)
      system: MUST_NEVER,
      // Function form of .replace so a `$&` in the question text can't be interpreted as a
      // replacement pattern. The tree text is trusted, but this costs nothing.
      messages: [{ role: 'user', content: JOB_A_PROMPT.replace('{fixed_question_text}', () => question) }],
    });
    // Models like to wrap a one-line answer in quotes; strip them, then fall back if nothing is left.
    const text = res.content.find((b) => b.type === 'text')?.text.trim().replace(/^["']|["']$/g, '');
    return text || question;
  } catch (err) {
    // Outcome only — never the question, never patient text (handoff §1). `err.name` is a useless
    // "Error" on SDK errors; the class name + HTTP status are what actually identify the failure.
    console.warn(`jobA: fallback to fixed question (${err.constructor?.name ?? 'error'}${err.status ? ` ${err.status}` : ''})`);
    return question;
  }
}
