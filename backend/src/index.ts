import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dashboardRouter from './routes/dashboard.route';
import authRouter from './routes/auth.routes';
import conversationsRouter from './routes/conversations.route';
import actionItemsRouter from './routes/action-items.route';
import knowledgeBaseRouter from './routes/knowledge-base.route';
import venueRouter from './routes/venue.route';
import nylasAuthRouter from './routes/nylas-auth.route';
import registerTokenRouter from './routes/register-token.route';
import agentsRouter from './routes/agent.route';
import procedureRouter from './routes/procedure.route';

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use('/api/agents', agentsRouter);
app.use('/api/nylas', nylasAuthRouter);
app.use('/api/register-token', registerTokenRouter);
app.use('/api/procedures', procedureRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
