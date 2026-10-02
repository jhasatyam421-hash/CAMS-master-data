import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { login, requireProcurement } from './auth.js';
import { prisma } from './db.js';
import apiRouter from './routes.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '16kb' }));

app.post('/api/auth/login', ...login);

app.get('/api/health', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: 'ok', database: 'connected' });
  } catch {
    response.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/api', requireProcurement, apiRouter);

app.use((error, _request, response, _next) => {
  if (error.type === 'entity.parse.failed') return response.status(400).json({ error: 'Invalid JSON request body' });
  if (error.type === 'entity.too.large') return response.status(413).json({ error: 'Request body too large' });
  if (error.code === 'P2002') return response.status(409).json({ error: 'A record with that unique value already exists' });
  if (error.code === 'P2025') return response.status(404).json({ error: 'Record not found' });
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`CAMS API listening on http://localhost:${port}`);
});