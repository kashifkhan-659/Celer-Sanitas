import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Prompts are data, not code (Rules.md §4): the text lives in the .txt files beside this file.
// Every job prompt is MUST_NEVER + its own instructions, so the boundary language (Rules.md §1) is
// written in exactly ONE place and cannot drift between jobs.
const DIR = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(DIR, `${name}.txt`), 'utf8').trim();

export const MUST_NEVER = read('mustNever');
const withRules = (name) => `${MUST_NEVER}\n\n${read(name)}`;

export const JOB_A_PROMPT = withRules('jobA');
export const JOB_B_PROMPT = withRules('jobB');
export const JOB_C_PROMPT = withRules('jobC');
