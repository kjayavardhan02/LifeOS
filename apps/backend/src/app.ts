import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error-handler.js';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './modules/auth/index.js';
import { profileRouter } from './modules/profile/index.js';
import { taskRouter } from './modules/tasks/index.js';
import { eventRouter } from './modules/calendar/index.js';
import { reminderRouter } from './modules/reminders/index.js';
import { transactionRouter, budgetRouter } from './modules/finance/index.js';
import { subscriptionRouter } from './modules/subscriptions/index.js';
import { categoryRouter, seedDefaultCategories } from './modules/categories/index.js';
import { projectRouter } from './modules/projects/index.js';
import { knowledgeRouter } from './modules/knowledge/index.js';
import { documentRouter } from './modules/documents/index.js';
import { quickCaptureRouter } from './modules/quick-capture/index.js';
import { searchRouter } from './modules/search/index.js';
import { goalRouter, habitRouter } from './modules/goals/index.js';
import { analyticsRouter } from './modules/analytics/index.js';
import { readingRouter } from './modules/reading/index.js';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);

app.use('/api', requireAuth);

app.use('/api/profile', profileRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/events', eventRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/finance/transactions', transactionRouter);
app.use('/api/finance/budgets', budgetRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/projects', projectRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/documents', documentRouter);
app.use('/api/quick-capture', quickCaptureRouter);
app.use('/api/search', searchRouter);
app.use('/api/goals', goalRouter);
app.use('/api/habits', habitRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/reading', readingRouter);

app.use(errorHandler);

export { app };
