/// <reference path="./shared/types/express.d.ts" />
import { config } from './app/config/config';
import { createApp } from './app/app';
import { sequelize } from './shared/database/sequelize';
import './shared/database/models';

async function bootstrap() {
  await sequelize.authenticate();
  console.log('Database connected');

  const app = createApp();
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT} [${config.NODE_ENV}]`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
