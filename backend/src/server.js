import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { getDatabasePath, initializeDatabase } from './db.js';
import { authRoutes } from './routes/authRoutes.js';
import { bookingsRoutes } from './routes/bookingsRoutes.js';
import { chefsRoutes } from './routes/chefsRoutes.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

initializeDatabase();

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

app.listen(PORT, () => {
  console.log(`Grillerz backend running on http://localhost:${PORT}`);
  console.log(`SQLite database: ${getDatabasePath()}`);
});
