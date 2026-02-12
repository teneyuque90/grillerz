import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import 'dotenv/config';

import {
  db,
  getDatabasePath,
  initializeDatabase,
  mapBookingRow,
  mapChefRow,
  nextBookingId,
  toPublicUser
} from './db.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ALLOW_ANY_VERIFICATION_CODE = process.env.ALLOW_ANY_VERIFICATION_CODE
  ? process.env.ALLOW_ANY_VERIFICATION_CODE === 'true'
  : process.env.NODE_ENV !== 'production';

app.use(cors());
app.use(express.json());

initializeDatabase();

function sanitizeEmail(value) {
  return String(value).trim().toLowerCase();
}

function stringOrFallback(value, fallbackValue) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallbackValue;
}

function numberOrFallback(value, fallbackValue) {
  if (value === null || value === undefined || value === '') {
    return fallbackValue;
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  return fallbackValue;
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    db: 'sqlite',
    dbPath: getDatabasePath()
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contrasena son requeridos.' });
  }

  const normalizedEmail = sanitizeEmail(email);
  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(normalizedEmail);

  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ message: 'Credenciales invalidas.' });
  }

  return res.json({ user: toPublicUser(user) });
});

app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nombre, email y contrasena son requeridos.' });
  }

  const normalizedEmail = sanitizeEmail(email);
  const existingUser = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(normalizedEmail);

  if (existingUser) {
    return res.status(409).json({ message: 'Ese email ya esta registrado.' });
  }

  const verificationCode = String(randomInt(1000, 10000));
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  const passwordHash = bcrypt.hashSync(String(password), 10);

  db.prepare(`
    INSERT INTO pending_signups (email, name, password_hash, code, expires_at, created_at)
    VALUES (@email, @name, @passwordHash, @code, @expiresAt, @createdAt)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      password_hash = excluded.password_hash,
      code = excluded.code,
      expires_at = excluded.expires_at,
      created_at = excluded.created_at
  `).run({
    email: normalizedEmail,
    name: String(name).trim(),
    passwordHash,
    code: verificationCode,
    expiresAt,
    createdAt: now.toISOString()
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[signup] verification code for ${normalizedEmail}: ${verificationCode}`);
  }

  return res.json({
    ok: true,
    ...(process.env.NODE_ENV !== 'production' ? { debugCode: verificationCode } : {})
  });
});

app.post('/auth/verify', (req, res) => {
  const { email, code } = req.body ?? {};

  if (!email || !code) {
    return res.status(400).json({ message: 'Email y codigo son requeridos.' });
  }

  const normalizedEmail = sanitizeEmail(email);
  const pending = db
    .prepare('SELECT * FROM pending_signups WHERE email = ?')
    .get(normalizedEmail);

  if (!pending) {
    return res.status(404).json({ message: 'No existe registro pendiente.' });
  }

  if (String(code).trim().length < 4) {
    return res.status(400).json({ message: 'Codigo invalido.' });
  }

  const now = new Date();
  if (new Date(pending.expires_at).getTime() < now.getTime()) {
    db.prepare('DELETE FROM pending_signups WHERE email = ?').run(normalizedEmail);
    return res.status(400).json({ message: 'El codigo expiro. Solicita uno nuevo.' });
  }

  if (!ALLOW_ANY_VERIFICATION_CODE && String(code).trim() !== pending.code) {
    return res.status(400).json({ message: 'Codigo invalido.' });
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

  if (existingUser) {
    db.prepare('DELETE FROM pending_signups WHERE email = ?').run(normalizedEmail);
    return res.json({ user: toPublicUser(existingUser) });
  }

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, phone, city, created_at)
    VALUES (@id, @name, @email, @passwordHash, @phone, @city, @createdAt)
  `).run({
    id: normalizedEmail,
    name: pending.name,
    email: normalizedEmail,
    passwordHash: pending.password_hash,
    phone: '+52 867 000 0000',
    city: 'Nuevo Laredo',
    createdAt: now.toISOString()
  });

  db.prepare('DELETE FROM pending_signups WHERE email = ?').run(normalizedEmail);

  const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(normalizedEmail);

  return res.json({ user: toPublicUser(newUser) });
});

app.get('/chefs', (_req, res) => {
  const chefRows = db
    .prepare('SELECT * FROM chefs ORDER BY rating DESC, reviews DESC, name ASC')
    .all();

  res.json({ chefs: chefRows.map(mapChefRow) });
});

app.get('/chefs/:chefId', (req, res) => {
  const chefRow = db
    .prepare('SELECT * FROM chefs WHERE id = ?')
    .get(req.params.chefId);

  if (!chefRow) {
    return res.status(404).json({ message: 'Chef no encontrado.' });
  }

  return res.json({ chef: mapChefRow(chefRow) });
});

app.get('/bookings', (req, res) => {
  const userId = req.query.userId ? String(req.query.userId) : null;

  if (!userId) {
    const bookingRows = db
      .prepare('SELECT * FROM bookings ORDER BY created_at DESC')
      .all();

    return res.json({ bookings: bookingRows.map(mapBookingRow) });
  }

  const bookingRows = db
    .prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId);

  return res.json({ bookings: bookingRows.map(mapBookingRow) });
});

app.get('/bookings/:bookingId', (req, res) => {
  const bookingRow = db
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .get(req.params.bookingId);

  if (!bookingRow) {
    return res.status(404).json({ message: 'Reserva no encontrada.' });
  }

  return res.json({ booking: mapBookingRow(bookingRow) });
});

app.post('/bookings', (req, res) => {
  const payload = req.body ?? {};

  if (!payload.userId || !payload.chefId || !payload.dateLabel || !payload.timeLabel) {
    return res.status(400).json({ message: 'Faltan datos de reserva.' });
  }

  const chefRow = db
    .prepare('SELECT * FROM chefs WHERE id = ?')
    .get(payload.chefId);

  if (!chefRow) {
    return res.status(404).json({ message: 'Chef no encontrado.' });
  }

  const chef = mapChefRow(chefRow);
  const serviceFee = numberOrFallback(payload.serviceFee, chef.basePrice);
  const transferFee = numberOrFallback(payload.transferFee, 300);
  const total = numberOrFallback(payload.total, serviceFee + transferFee);

  const booking = {
    id: nextBookingId(),
    userId: payload.userId,
    chefId: payload.chefId,
    chefName: chef.name,
    status: stringOrFallback(payload.status, 'Confirmada'),
    dateLabel: String(payload.dateLabel),
    timeLabel: String(payload.timeLabel),
    mode: stringOrFallback(payload.mode, 'A domicilio'),
    address: stringOrFallback(payload.address, 'Sin direccion'),
    packageName: stringOrFallback(payload.packageName, 'Basico'),
    guests: numberOrFallback(payload.guests, 10),
    durationHours: numberOrFallback(payload.durationHours, 4),
    serviceFee,
    transferFee,
    total,
    paymentMethod: stringOrFallback(payload.paymentMethod, 'Tarjeta'),
    createdAt: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO bookings (
      id, user_id, chef_id, chef_name, status, date_label, time_label, mode, address,
      package_name, guests, duration_hours, service_fee, transfer_fee, total, payment_method, created_at
    ) VALUES (
      @id, @userId, @chefId, @chefName, @status, @dateLabel, @timeLabel, @mode, @address,
      @packageName, @guests, @durationHours, @serviceFee, @transferFee, @total, @paymentMethod, @createdAt
    )
  `).run(booking);

  return res.status(201).json({ booking });
});

app.listen(PORT, () => {
  console.log(`Grillerz backend running on http://localhost:${PORT}`);
  console.log(`SQLite database: ${getDatabasePath()}`);
});
