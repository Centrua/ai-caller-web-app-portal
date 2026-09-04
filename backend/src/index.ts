import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dashboardRouter from './routes/dashboard.route';
import authRouter from './routes/auth.routes';
import conversationsRouter from './routes/conversations.route';
import actionItemsRouter from './routes/action-items.route';
import knowledgeBaseRouter from './routes/knowledge-base.route';
import venueRouter from './routes/venue.route';
import elevenLabsWebhookRouter from './routes/elevenlabs-webhook.route';
import nylasWebhookRouter from './routes/nylas-webhook.route';

const app = express();
const PORT = process.env.PORT || 3001;

app.use('/api/webhooks/elevenlabs', express.raw({ type: 'application/json', limit: '256kb' }));
app.use('/api/webhooks/nylas', express.raw({ type: 'application/json', limit: '1mb' }));
app.use(express.json({ limit: '256kb' }));

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
}));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auth', authRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/conversations', actionItemsRouter);
app.use('/api/knowledge-base', knowledgeBaseRouter);
app.use('/api/venue', venueRouter);
app.use('/api/webhooks/elevenlabs', elevenLabsWebhookRouter);
app.use('/api/webhooks/nylas', nylasWebhookRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
