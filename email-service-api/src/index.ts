import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import nylasWebhookRouter from './routes/nylas-webhook.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Register Nylas webhook route before global JSON parser so route-level
// `express.raw` middleware receives the original raw request body buffer.
app.use('/nylas-webhook', nylasWebhookRouter)

app.use(express.json());

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]:', err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'email-service-api', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Email Service API running on http://localhost:${PORT}`);
});
