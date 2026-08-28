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

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', sessionRoutes);
app.use('/api', summaryRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Celer Sanitas server listening on :${PORT}`));
