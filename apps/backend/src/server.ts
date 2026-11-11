import 'dotenv/config';
import { app } from './app.js';
import { logger } from './lib/logger.js';
import { seedDefaultCategories } from './modules/categories/index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  logger.info(`LifeOS backend running on http://localhost:${PORT}`);
  await seedDefaultCategories().catch((err) =>
    logger.error('Failed to seed default categories:', err),
  );
});
