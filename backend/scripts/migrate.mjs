import { getDatabasePath, runDatabaseMigrations } from '../src/db.js';

const result = runDatabaseMigrations();

console.log(`Database: ${getDatabasePath()}`);
console.log(`Migrations total: ${result.total}`);
console.log(`Applied now: ${result.applied}`);
console.log(`Already applied: ${result.skipped}`);
