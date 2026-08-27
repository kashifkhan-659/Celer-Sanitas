// The ONLY place a model ID string lives (Rules.md §4) — jobs import these, never hardcode.
export const HAIKU_MODEL = 'claude-haiku-4-5-20251001'; // Jobs A + B — tiny phrasing/classification calls
export const SONNET_MODEL = 'claude-sonnet-5';          // Job C — the one call where synthesis quality matters
