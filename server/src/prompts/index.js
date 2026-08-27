import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Prompts are data, not code (Rules.md §4): the text lives in the .txt files beside this file.
//
// Split: MUST_NEVER is the SYSTEM prompt for all three jobs — the boundary language (Rules.md §1)
// is written in exactly one place and cannot drift between jobs. Each JOB_*_PROMPT is the handoff
// §4 block verbatim and is sent as the USER message with its {placeholders} filled, which keeps
// patient free text out of the system prompt (it is data, never instructions).
const DIR = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(DIR, `${name}.txt`), 'utf8').trim();

export const MUST_NEVER = read('mustNever');

export const JOB_A_PROMPT = read('jobA'); // {fixed_question_text}
export const JOB_B_PROMPT = read('jobB'); // {option_list}, {free_text}
export const JOB_C_PROMPT = read('jobC'); // transcript is appended by the job
