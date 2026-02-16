import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import supertest from 'supertest';

const SEED_EMAIL = 'gabriel@email.com';
const SEED_PASSWORD = '123456';

function logStep(message) {
  console.log(`[api-test] ${message}`);
}

async function cleanupSqliteFiles(dbPath, closeDatabase) {
  if (globalThis.__grillerzTestServer) {
    await new Promise((resolve) => {
      globalThis.__grillerzTestServer.close(() => resolve());
    });
  }

  if (closeDatabase) {
    closeDatabase();
  }

  const files = [dbPath, `${dbPath}-shm`, `${dbPath}-wal`];
  for (const filePath of files) {
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore
    }
  }

  try {
    await fs.rmdir(path.dirname(dbPath));
  } catch {
    // ignore
  }
}

async function run() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'grillerz-api-test-'));
  const testDbPath = path.join(tempDir, 'db.sqlite');

  process.env.DATABASE_PATH = testDbPath;
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '2h';
  process.env.ALLOW_ANY_VERIFICATION_CODE = 'true';

  const { createApp } = await import('../src/app.js');
  const dbModule = await import('../src/db.js');
  const app = createApp();

  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    instance.on('error', reject);
  });

  globalThis.__grillerzTestServer = server;
  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('No se pudo obtener puerto para pruebas de API.');
  }

  const request = supertest(`http://127.0.0.1:${address.port}`);

  try {
    logStep('GET /health');
    const health = await request.get('/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.ok, true);
    assert.equal(health.body.db, 'sqlite');

    logStep('POST /auth/login');
    const login = await request
      .post('/auth/login')
      .send({ email: SEED_EMAIL, password: SEED_PASSWORD });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.email, SEED_EMAIL);
    assert.ok(login.body.token);
    const token = login.body.token;

    logStep('GET /auth/me');
    const me = await request
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, SEED_EMAIL);

    logStep('GET /chefs/:chefId/reviews');
    const reviews = await request.get('/chefs/erick-martinez/reviews');
    assert.equal(reviews.status, 200);
    assert.ok(Array.isArray(reviews.body.reviews));
    assert.ok(reviews.body.reviews.length > 0);
    assert.equal(reviews.body.reviews[0].chefId, 'erick-martinez');

    logStep('GET /bookings sin token');
    const bookingsNoToken = await request.get('/bookings');
    assert.equal(bookingsNoToken.status, 401);

    logStep('POST /bookings autenticado');
    const createBooking = await request
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        chefId: 'carlos-bbq',
        dateLabel: '20 Abril 2026',
        timeLabel: '7:00 PM',
        mode: 'A domicilio',
        address: 'Guanajuato 254, Nuevo Laredo'
      });
    assert.equal(createBooking.status, 201);
    assert.ok(createBooking.body.booking.id);
    assert.equal(createBooking.body.booking.userId, SEED_EMAIL);

    logStep('GET /bookings con token');
    const listBookings = await request
      .get('/bookings')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(listBookings.status, 200);
    assert.ok(Array.isArray(listBookings.body.bookings));
    assert.ok(listBookings.body.bookings.some((item) => item.id === createBooking.body.booking.id));

    logStep('signup+verify y regla 403 por userId ajeno');
    const uniqueEmail = `tester-${Date.now()}@grillerz.app`;
    const signup = await request
      .post('/auth/signup')
      .send({ name: 'Usuario Test', email: uniqueEmail, password: '123456' });
    assert.equal(signup.status, 200);

    const verify = await request
      .post('/auth/verify')
      .send({ email: uniqueEmail, code: '1234' });
    assert.equal(verify.status, 200);
    assert.ok(verify.body.token);

    const forbidden = await request
      .get(`/bookings?userId=${encodeURIComponent(SEED_EMAIL)}`)
      .set('Authorization', `Bearer ${verify.body.token}`);
    assert.equal(forbidden.status, 403);

    logStep('OK - todas las validaciones pasaron');
  } finally {
    await cleanupSqliteFiles(testDbPath, dbModule.closeDatabase);
  }
}

run().catch((error) => {
  if (error instanceof Error) {
    console.error('[api-test] fallo:', error.message);
    console.error(error.stack);
  } else {
    console.error('[api-test] fallo:', String(error));
  }
  process.exit(1);
});
