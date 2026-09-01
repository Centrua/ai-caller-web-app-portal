import express, { type Request, type Response } from 'express';
import dashboardRouter from './routes/dashboard.route';
import authRouter from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
