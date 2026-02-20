import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDatabasePath, initializeDatabase } from './db.js';
import { authRoutes } from './routes/authRoutes.js';
import { bookingsRoutes } from './routes/bookingsRoutes.js';
import { chefsRoutes } from './routes/chefsRoutes.js';
import { eventsRoutes } from './routes/eventsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicMediaDir = path.resolve(__dirname, '../public/media');

function buildCorsOptions() {
  const rawOrigins = process.env.CORS_ORIGIN?.trim();

  if (!rawOrigins || rawOrigins === '*') {
    return {};
  }

  const allowedOrigins = rawOrigins
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    return {};
  }

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    }
  };
}

export function createApp() {
  initializeDatabase();

  const app = express();
  app.use(cors(buildCorsOptions()));
  app.use(express.json());
  app.use('/media', express.static(publicMediaDir));

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
  app.use('/events', eventsRoutes);

  return app;
}
