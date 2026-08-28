// The ONLY place a model ID string lives (Rules.md §4) — jobs import these, never hardcode.
// Both IDs were confirmed live against Groq's /openai/v1/models on this account, not taken from
// docs: the account carries no Llama or Mixtral chat models, so the public model list does not
// apply here. Re-verify with the checkModels script before changing either.
//
// qwen3.8-27b is the ONLY model on the account that can serve Jobs A and B: both gpt-oss models
// spend Job B's entire 20-token budget on reasoning tokens and return empty content, and allam-2-7b
// misclassifies (it answered "sound" to "bright light kills me but noise is fine").
export const FAST_MODEL = 'qwen/qwen3.8-27b';   // Jobs A + B — no reasoning tokens, ~3 tok/classify
export const SMART_MODEL = 'openai/gpt-oss-120b'; // Job C — strongest here; response_format json_object confirmed
