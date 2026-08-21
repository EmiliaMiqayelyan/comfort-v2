import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/config';
import { apiRouter } from './routes/index';
import { errorHandler } from './middleware/error.middleware';

export function createApp(): express.Express {
  const app = express();

  const origins = config.CLIENT_ORIGIN.split(',').map(o => o.trim());
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.resolve(__dirname, '..', '..', 'uploads')));

  app.use('/api', apiRouter);

  app.use(errorHandler);

  return app;
}
