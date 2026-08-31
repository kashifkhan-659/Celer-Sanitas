import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/session.routes.js';
import summaryRoutes from './routes/summary.routes.js';

// Express entry. Hosts the pure tree engine behind HTTP so the client fetches trees rather than
// importing server files (keeps the Vercel/Railway split clean). AI runs behind the controllers.
const app = express();

app.use(cors()); // dev-open. ponytail: restrict to the Vercel origin via env when deploying.
app.use(express.json());

// Under /api because that is the only prefix routed to the function — a bare /health would be
// answered by the static client build instead of reaching Express at all.
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', sessionRoutes);
app.use('/api', summaryRoutes);

export default app;

// Local dev only. Under Vercel the app is imported by api/[...path].js and driven per request, so
// binding a port there is both pointless and wrong — VERCEL is set in that environment.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Celer Sanitas server listening on :${PORT}`));
}
