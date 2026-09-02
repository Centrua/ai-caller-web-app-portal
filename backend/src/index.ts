import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dashboardRouter from './routes/dashboard.route';
import authRouter from './routes/auth.routes';
import conversationsRouter from './routes/conversations.route';
import actionItemsRouter from './routes/action-items.route';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auth', authRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/conversations', actionItemsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
