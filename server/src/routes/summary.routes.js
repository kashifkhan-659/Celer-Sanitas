import { Router } from 'express';
import { getSummary, rebuildSummary } from '../controllers/summary.controller.js';

// The route the doctor dashboard calls for a session's summary (handoff §5). Routes stay dumb:
// path -> controller, nothing else (Rules.md §4).
const router = Router();

// GET  /api/sessions/:id/summary — the dashboard's read. Generates on first call, then serves the
//      stored summary. Returns the raw transcript with a note when Job C or the safety gate failed.
// POST /api/sessions/:id/summary — regenerate. The only way past a recorded failure, so a one-off
//      API error doesn't strand a session on the raw-transcript view forever.
router.get('/sessions/:id/summary', getSummary);
router.post('/sessions/:id/summary', rebuildSummary);

export default router;
