import express from 'express';
import cors from 'cors';

import { getDatabasePath, initializeDatabase } from './db.js';
import { authRoutes } from './routes/authRoutes.js';
import { bookingsRoutes } from './routes/bookingsRoutes.js';
import { chefsRoutes } from './routes/chefsRoutes.js';

export function createApp() {
  initializeDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      db: 'sqlite',
      dbPath: getDatabasePath()
    });
  });

  app.use('/auth', authRoutes);
  app.use('/chefs', chefsRoutes);
  app.use('/bookings', bookingsRoutes);

  return app;
}
