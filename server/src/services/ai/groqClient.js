import { GROQ_API_KEY } from '../../config/env.js';

// One place where the provider's wire format lives. Groq is OpenAI-compatible chat completions:
// POST /openai/v1/chat/completions, a messages array, the answer at choices[0].message.content.
// Jobs A/B/C call this; none of them know the endpoint shape (Rules.md §4, one job one file).
//
// MUST_NEVER goes in as the SYSTEM message and patient text only ever as the USER message, so the
// boundary rules are never mixed into data the patient controls.
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const BASE_BACKOFF_MS = 500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// How long to wait before the one retry. A 429 is a rate limit, so retrying instantly just spends
// the second attempt hitting the same wall — Groq's free tier returned 429 on gpt-oss-120b during
// Job C testing and an immediate retry would have failed too. Groq sends `retry-after` in seconds;
// honour it, capped, because the caller's fallback is cheap and a patient may be waiting.
function backoffMs(res, capMs) {
  const header = Number(res?.headers?.get('retry-after'));
  return Math.min(Number.isFinite(header) && header > 0 ? header * 1000 : BASE_BACKOFF_MS, capMs);
}

export async function chat({ model, system, user, maxTokens, temperature, json = false, timeoutMs = 8000, retryCapMs = 2000 }) {
  const body = JSON.stringify({
    model,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    max_completion_tokens: maxTokens,
    temperature,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  });

  // One retry, matching the previous SDK's maxRetries: 1. Only transient classes are retried —
  // a 400/401 is a bug or a bad key and retrying it just doubles the patient's wait.
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) await sleep(lastErr?.backoff ?? BASE_BACKOFF_MS);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { authorization: `Bearer ${GROQ_API_KEY}`, 'content-type': 'application/json' },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
      // Status only. The error body can echo the prompt back, and prompts carry patient text.
      if (!res.ok) {
        const err = new Error(`groq HTTP ${res.status}`);
        err.status = res.status;
        if (res.status < 500 && res.status !== 429) throw err;
        err.backoff = backoffMs(res, retryCapMs);
        lastErr = err;
        continue;
      }
      const data = await res.json();
      // `usage` comes back with every call. Job C logs it: gpt-oss-120b sits behind a 200K
      // tokens-per-day cap and spends hidden reasoning tokens, so the real per-summary cost has to
      // be measured, never estimated.
      return { content: data?.choices?.[0]?.message?.content?.trim() ?? '', usage: data?.usage ?? null };
    } catch (err) {
      if (err.status && err.status < 500 && err.status !== 429) throw err;
      lastErr = err; // network/timeout error: no response, so no retry-after — use the base delay
    }
  }
  throw lastErr;
}
