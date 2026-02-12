import 'dotenv/config';

import { getDatabasePath } from './db.js';
import { createApp } from './app.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Grillerz backend running on http://localhost:${PORT}`);
  console.log(`SQLite database: ${getDatabasePath()}`);
});
