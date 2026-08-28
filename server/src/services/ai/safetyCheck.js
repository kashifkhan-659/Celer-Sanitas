// Deterministic drift screen for AI-generated text (Rules.md §1, §3).
//
// NO model call: a check that can itself time out, hallucinate, or be talked out of its instructions
// is not a check. This is pure string matching, so it ALWAYS runs and it fails CLOSED — anything it
// cannot read is unsafe.
//
// The bias is deliberately toward over-blocking. A false positive costs the doctor a synthesized
// summary and shows the raw transcript instead (they lose nothing but convenience); a false negative
// puts a diagnosis in front of a patient. Where a term was a coin-flip, it is banned.
//
// Calibrated against the real trees, so legitimate intake vocabulary is NOT banned:
//   • "severe/moderate/mild" are severity option labels in all three trees.
//   • "took medication for it" is the headache `meds` node — the nouns stay legal; only
//     PRESCRIPTIVE language ("recommend", "prescribe", "should take") is banned.
//   • "tension" is the headache `neck_tension` node — only the phrase "tension headache" is banned.
import { strict as assert } from 'node:assert';
import { pathToFileURL } from 'node:url';

// Cause, likelihood, clinical judgement, urgency, advice (Rules.md §1.1-1.3, §1.5).
const DIAGNOSTIC_LANGUAGE = [
  'likely', 'unlikely', 'probable', 'probably', 'possibly', 'presumably', 'chances are',
  'suggest', 'suggests', 'suggesting', 'suggestive', 'consistent with', 'in keeping with',
  'indicate', 'indicates', 'indicating', 'indicative', 'points to', 'typical of', 'classic for',
  'rule out', 'ruling out', 'ruled out', 'differential', 'work up', 'workup',
  'diagnose', 'diagnosed', 'diagnosis', 'diagnostic',
  'could be', 'may be', 'might be', 'appears to be', 'seems to be', 'looks like', 'sounds like',
  'cause', 'causes', 'caused', 'causing', 'etiology', 'aetiology', 'pathology', 'underlying',
  'concerning for', 'worrying', 'worrisome', 'alarming', 'red flag', 'reassuring',
  'urgent', 'urgently', 'emergency', 'immediately', 'right away', 'straight away', 'seek',
  'ambulance', 'triage', 'risk of', 'at risk', 'serious', 'dangerous', 'benign', 'harmless',
  'recommend', 'recommends', 'recommended', 'recommendation', 'advise', 'advised', 'advice',
  'prescribe', 'prescribed', 'prescription', 'treatment', 'you should', 'should take',
  'should see', 'should go', 'should call', 'needs to see', 'refer', 'referral',
];

// Condition names reachable from the three symptom categories (Rules.md §1.1).
const CONDITIONS = [
  'condition', 'disease', 'syndrome', 'disorder', 'infection', 'inflammation', 'inflamed',
  'viral', 'bacterial', 'virus',
  // chest
  'heart attack', 'myocardial infarction', 'angina', 'cardiac', 'arrhythmia', 'pericarditis',
  'pleurisy', 'pulmonary embolism', 'pneumonia', 'pneumothorax', 'aortic dissection',
  'costochondritis', 'gerd', 'reflux', 'heartburn', 'oesophagitis', 'esophagitis',
  'asthma', 'copd', 'panic attack', 'anxiety attack',
  // headache
  'migraine', 'tension headache', 'cluster headache', 'meningitis', 'aneurysm', 'stroke',
  'subarachnoid', 'haemorrhage', 'hemorrhage', 'sinusitis', 'sinus infection', 'concussion',
  'glaucoma', 'temporal arteritis', 'hypertension', 'high blood pressure', 'dehydration',
  // abdominal
  'appendicitis', 'appendix', 'gallstone', 'gallstones', 'gallbladder', 'cholecystitis',
  'ulcer', 'gastritis', 'gastroenteritis', 'food poisoning', 'pancreatitis', 'diverticulitis',
  'ibs', 'irritable bowel', 'obstruction', 'hernia', 'kidney stone', 'kidney stones',
  'urinary tract infection', 'uti', 'constipation',
];

const BANNED = [...DIAGNOSTIC_LANGUAGE, ...CONDITIONS];

// \s+ between words so a line break inside a phrase still matches; \b so "tension" alone is fine
// while "tension headache" is not, and "gas" never matches inside "gastritis".
const BANNED_RE = new RegExp(
  '\\b(?:' + BANNED.map((t) => t.split(' ').join('\\s+')).join('|') + ')\\b',
  'i',
);

// The ONE narrow exception, and the only way a banned term may ever pass. "might be" is banned to
// catch "might be appendicitis"; Job C also writes "...exposures that might be relevant", which is
// a procedural intake note carrying no clinical claim, and blocking it costs the doctor an entire
// summary. So the three hedges pass ONLY when followed by an explicitly benign, non-clinical word —
// never before a noun, which is exactly where a diagnosis would sit.
//
// This NARROWS the rule; it does not loosen it. Every entry here is paired in the self-check below
// with a must-block sample proving the SAME hedge is still caught in its dangerous form. Never add
// a phrase here without its pair.
// Each alternative is a SHAPE observed in real Job C output, never a bare term. Both were caught
// by measuring: 2 of 40 clean summaries were rejected on these two phrasings.
const ALLOWED_RE = new RegExp([
  // A hedge before an explicitly benign, non-clinical word. Never before a noun, so
  // "might be appendicitis" is untouched while "might be related" passes.
  String.raw`\b(?:might|may|could)\s+be\s+(?:relevant|helpful|useful|related|worth\s+noting)\b`,
  // "immediately" used TEMPORALLY. The banned sense is urgency - "see a doctor immediately",
  // "seek help immediately" - where the word ends the clause. Requiring before/after/preceding/
  // following right behind it cannot match that sense, only "events immediately before the pain".
  String.raw`\bimmediately\s+(?:before|after|preceding|following)\b`,
].join('|'), 'gi');

// Screen one piece of AI-generated text. Returns { safe, matched } — `matched` is the banned term
// from the fixed list above (never patient text), so it is safe to log.
export function safetyCheck(text) {
  if (typeof text !== 'string' || !text.trim()) return { safe: false, matched: 'empty or non-text output' };
  // Blank the allowed phrases out first, then screen what is left. Replacing with a space keeps the
  // \b boundaries around neighbouring words intact, so nothing new can hide in the seam.
  const hit = BANNED_RE.exec(text.replace(ALLOWED_RE, ' '));
  return hit ? { safe: false, matched: hit[0].toLowerCase().replace(/\s+/g, ' ') } : { safe: true, matched: null };
}

// Self-check: `node safetyCheck.js` — same convention as services/tree/loadTree.js.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Every term must be regex-safe, or one stray metacharacter silently breaks the whole screen.
  for (const t of BANNED) assert.match(t, /^[a-z ]+$/, `unsafe term in list: ${t}`);

  const MUST_BLOCK = [
    'The patient symptoms are consistent with angina.',
    'This most likely reflects acid reflux rather than a cardiac problem.',
    'Findings suggest a tension headache; consider migraine if it recurs.',
    'Sudden severe headache - rule out subarachnoid haemorrhage.',
    'Right-sided pain with nausea indicates possible appendicitis.',
    'Probable gastritis given the burning after meals.',
    'The patient should see a doctor immediately; this may be an emergency.',
    'Recommend an ECG and consider treatment for suspected pericarditis.',
    'Pain could be caused by gallstones.',
    'This appears to be a benign, self-limiting condition.',
    'Differential includes pulmonary embolism and pneumonia.',
    'Symptoms are worrying and suggestive of an urgent cardiac problem.',
    // "pattern of" is deliberately NOT a banned term: it is ordinary intake vocabulary (the
    // headache tree has a `pattern` node, and "any pattern of the pain, constant vs intermittent"
    // is a legitimate thing to ask a doctor to clarify). This sample proves that leaving it out
    // opens no gap - a real diagnostic claim wrapped around it is still caught by the terms that
    // carry the actual clinical meaning. Its clean counterpart sits in MUST_PASS below.
    'This pattern of chest pain is consistent with unstable angina.',
    '',
    null,
  ];

  const MUST_PASS = [
    'Patient reported chest pain starting two hours ago.',
    'The patient described the discomfort as pressure or tightness, moderate in strength, spreading into the left arm.',
    'Onset was sudden, within the last hour. The patient rated it severe and reported shortness of breath alongside it.',
    'The patient reported tightness in the neck and shoulders, and said light and sound both make it worse.',
    'The patient reported taking medication earlier today, which did not help.',
    'Answers conflicted: the patient first said the pain was constant, then that it comes in waves.',
    'Verify with the patient how long each episode lasts, and whether it has ever woken them at night.',
    'The patient has had this kind of pain before and described it as ongoing, returning over the past few weeks.',
    'Pain is in the upper belly below the ribs, worse after eating, with looser bowel habits.',
    // The benign half of the pair above: real Job C output, and exactly why "pattern of" stays out.
    'Clarify the exact onset time and any pattern of the pain (e.g., constant vs intermittent).',
  ];

  // Paired allowlist cases. Each benign phrase must PASS while the SAME hedge in front of a
  // condition must still BLOCK. The pairing is what stops the allowlist becoming a loophole:
  // if a future edit widens ALLOWED_RE far enough to let a diagnosis through, the right-hand
  // sample fails immediately.
  const PAIRS = [
    ['Inquire about any recent activities, foods, or exposures that might be relevant', 'The right-sided pain might be appendicitis'],
    ['The medication history may be relevant and is worth confirming directly', 'The burning after meals may be reflux'],
    ['A fuller description of how long each episode lasts could be helpful', 'The chest tightness could be angina'],
    ['Confirming the exact onset time might be useful', 'This might be a migraine'],
    ['The conflicting onset answers may be worth noting', 'Sudden onset may be a subarachnoid haemorrhage'],
    // Both halves of these two are REAL text: the benign side is verbatim Job C output that the
    // gate rejected during a 40-call measurement run, the dangerous side is the same phrasing
    // turned into an actual clinical claim.
    ['Ask about recent activities, meals, travel, or injuries that might be related', 'The chest pain might be related to a cardiac problem'],
    ['Clarify the exact time of onset and any events immediately before the pain started', 'The patient should see a doctor immediately'],
    ['Note anything that happened immediately after the pain began', 'Symptoms are severe and the patient needs to be seen immediately'],
  ];

  let failures = 0;
  const row = (ok, text, matched) => {
    if (!ok) failures++;
    const shown = text === null ? '<null>' : text === '' ? '<empty string>' : text;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${(matched ? `[${matched}]` : '').padEnd(26)}  ${shown}`);
  };

  console.log('\n--- must be BLOCKED ---');
  for (const t of MUST_BLOCK) {
    const r = safetyCheck(t);
    row(!r.safe, t, r.matched);
  }

  console.log('\n--- must PASS (legitimate intake phrasing) ---');
  for (const t of MUST_PASS) {
    const r = safetyCheck(t);
    row(r.safe, t, r.matched);
  }

  console.log('\n--- allowlist pairs (benign must PASS / same hedge before a condition must BLOCK) ---');
  for (const [benign, dangerous] of PAIRS) {
    const a = safetyCheck(benign);
    row(a.safe, benign, a.matched);
    const b = safetyCheck(dangerous);
    row(!b.safe, dangerous, b.matched);
  }

  assert.equal(failures, 0, `${failures} safetyCheck case(s) failed`);
  console.log(`\nsafetyCheck self-check passed — ${MUST_BLOCK.length} blocked, ${MUST_PASS.length} allowed, ${PAIRS.length} allowlist pairs, ${BANNED.length} banned terms.`);
}
