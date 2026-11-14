import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.js';
import { workspacesRouter } from './routes/workspaces.js';
import { financialsRouter } from './routes/financials.js';
import { analystRouter } from './routes/analyst.js';
import { integrationsRouter } from './routes/integrations.js';

export const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'profitguard-api', timestamp: new Date().toISOString() });
});

// Modular Routes
app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/financials', financialsRouter);
app.use('/api/analyst', analystRouter);
app.use('/api/integrations', integrationsRouter);

// Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ProfitGuard API] Server running on http://localhost:${PORT}`);
  });
}
