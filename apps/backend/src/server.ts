import 'dotenv/config';
import { app } from './app.js';
import { logger } from './lib/logger.js';
import { seedDefaultCategories } from './modules/categories/index.js';
import { registerEventListeners } from './lib/event-listeners.js';
import { startBackgroundJobs } from './jobs/index.js';
import { initializeAutomationEngine } from './modules/automation/index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  logger.info(`LifeOS backend running on http://localhost:${PORT}`);
  await seedDefaultCategories().catch((err) =>
    logger.error('Failed to seed default categories:', err),
  );
  registerEventListeners();
  startBackgroundJobs();
  await initializeAutomationEngine().catch((err) =>
    logger.error('Failed to initialize automation engine:', err),
  );
});
