import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runMigrations } from './migrations/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultDbPath = path.resolve(__dirname, '../data/grillerz.sqlite');
const resolvedDbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : defaultDbPath;

fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });

export const db = new Database(resolvedDbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const seedChefs = [
  {
    id: 'erick-martinez',
    name: 'Erick Martinez',
    title: 'Griller Master',
    city: 'Nuevo Laredo',
    rating: 4.9,
    reviews: 126,
    basePrice: 2800,
    specialties: ['Costillas a la Parrilla', 'Tomahawk al Carbon', 'Parrilla Mixta'],
    bio: 'Especialista en eventos familiares y corporativos. Manejo cortes premium y menu personalizado.',
    stats: { services: 85, clients: 240, years: 5 }
  },
  {
    id: 'carlos-bbq',
    name: 'Carlos BBQ',
    title: 'Pitmaster',
    city: 'Monterrey',
    rating: 4.8,
    reviews: 102,
    basePrice: 3200,
    specialties: ['Parrilla Mixta', 'Costillas Ahumadas', 'Asado Norte'],
    bio: 'Griller de parrilla para grupos grandes con enfoque en sabor ahumado y servicio premium.',
    stats: { services: 70, clients: 190, years: 6 }
  },
  {
    id: 'martin-asador',
    name: 'Martin Asador',
    title: 'Smoke Expert',
    city: 'Saltillo',
    rating: 4.7,
    reviews: 94,
    basePrice: 3600,
    specialties: ['Brisket', 'Costillas', 'Tomahawk'],
    bio: 'Especializado en cocciones lentas y parrilla de alto volumen para eventos sociales.',
    stats: { services: 65, clients: 168, years: 5 }
  },
  {
    id: 'luis-bbq',
    name: 'Luis BBQ',
    title: 'Asador Pro',
    city: 'Nuevo Laredo',
    rating: 4.6,
    reviews: 80,
    basePrice: 3000,
    specialties: ['Asado Regio', 'Arrachera', 'Parrilla Mixta'],
    bio: 'Servicio rapido y menu flexible para reuniones de tamano medio.',
    stats: { services: 52, clients: 140, years: 4 }
  },
  {
    id: 'cories-bbq',
    name: 'Cories BBQ',
    title: 'Grill Specialist',
    city: 'Nuevo Laredo',
    rating: 4.8,
    reviews: 112,
    basePrice: 2500,
    specialties: ['Ribeye', 'Costillas', 'Tomahawk'],
    bio: 'Enfoque en cortes jugosos y presentacion profesional para eventos en casa.',
    stats: { services: 76, clients: 210, years: 5 }
  }
];

const seedUsers = [
  {
    id: 'gabriel@email.com',
    name: 'Gabriel Teneyuque',
    email: 'gabriel@email.com',
    password: '123456',
    phone: '+52 867 000 0000',
    city: 'Nuevo Laredo'
  }
];

const seedBookings = [
  {
    id: 'GRZ-4729',
    userId: 'gabriel@email.com',
    chefId: 'carlos-bbq',
    chefName: 'Carlos BBQ',
    status: 'Pendiente',
    dateLabel: '19 Abril 2026',
    timeLabel: '8:00 PM',
    mode: 'A domicilio',
    address: 'Centro 405, Monterrey',
    packageName: 'Familiar',
    guests: 12,
    durationHours: 4,
    serviceFee: 3200,
    transferFee: 300,
    total: 3500,
    paymentMethod: 'Tarjeta'
  }
];

function nowIso() {
  return new Date().toISOString();
}

function seedChefsIfNeeded() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM chefs').get().total;
  if (count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO chefs (
      id, name, title, city, rating, reviews, base_price, specialties_json,
      bio, services, clients, years, created_at
    ) VALUES (
      @id, @name, @title, @city, @rating, @reviews, @basePrice, @specialtiesJson,
      @bio, @services, @clients, @years, @createdAt
    )
  `);

  const transaction = db.transaction((items) => {
    for (const chef of items) {
      insert.run({
        id: chef.id,
        name: chef.name,
        title: chef.title,
        city: chef.city,
        rating: chef.rating,
        reviews: chef.reviews,
        basePrice: chef.basePrice,
        specialtiesJson: JSON.stringify(chef.specialties),
        bio: chef.bio,
        services: chef.stats.services,
        clients: chef.stats.clients,
        years: chef.stats.years,
        createdAt: nowIso()
      });
    }
  });

  transaction(seedChefs);
}

function seedUsersIfNeeded() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
  if (count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, phone, city, created_at)
    VALUES (@id, @name, @email, @passwordHash, @phone, @city, @createdAt)
  `);

  const transaction = db.transaction((items) => {
    for (const user of items) {
      insert.run({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: bcrypt.hashSync(user.password, 10),
        phone: user.phone,
        city: user.city,
        createdAt: nowIso()
      });
    }
  });

  transaction(seedUsers);
}

function seedBookingsIfNeeded() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM bookings').get().total;
  if (count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO bookings (
      id, user_id, chef_id, chef_name, status, date_label, time_label, mode, address,
      package_name, guests, duration_hours, service_fee, transfer_fee, total, payment_method, created_at
    ) VALUES (
      @id, @userId, @chefId, @chefName, @status, @dateLabel, @timeLabel, @mode, @address,
      @packageName, @guests, @durationHours, @serviceFee, @transferFee, @total, @paymentMethod, @createdAt
    )
  `);

  const transaction = db.transaction((items) => {
    for (const booking of items) {
      insert.run({
        ...booking,
        createdAt: nowIso()
      });
    }
  });

  transaction(seedBookings);
}

export function runDatabaseMigrations() {
  return runMigrations(db);
}

export function initializeDatabase() {
  runDatabaseMigrations();
  db.prepare(`
    UPDATE sessions
    SET revoked_at = ?
    WHERE revoked_at IS NULL AND datetime(expires_at) <= datetime('now')
  `).run(nowIso());
  seedChefsIfNeeded();
  seedUsersIfNeeded();
  seedBookingsIfNeeded();
}

function safeJsonParse(rawValue, fallbackValue) {
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

export function toPublicUser(userRow) {
  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    phone: userRow.phone,
    city: userRow.city
  };
}

export function mapChefRow(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    city: row.city,
    rating: row.rating,
    reviews: row.reviews,
    basePrice: row.base_price,
    specialties: safeJsonParse(row.specialties_json, []),
    bio: row.bio,
    stats: {
      services: row.services,
      clients: row.clients,
      years: row.years
    }
  };
}

export function mapBookingRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    chefId: row.chef_id,
    chefName: row.chef_name,
    status: row.status,
    dateLabel: row.date_label,
    timeLabel: row.time_label,
    mode: row.mode,
    address: row.address,
    packageName: row.package_name,
    guests: row.guests,
    durationHours: row.duration_hours,
    serviceFee: row.service_fee,
    transferFee: row.transfer_fee,
    total: row.total,
    paymentMethod: row.payment_method,
    createdAt: row.created_at
  };
}

export function nextBookingId() {
  const rows = db.prepare('SELECT id FROM bookings').all();
  let max = 4829;

  for (const row of rows) {
    const match = /^GRZ-(\d+)$/.exec(row.id);
    if (!match) {
      continue;
    }

    const numericValue = Number(match[1]);
    if (!Number.isNaN(numericValue) && numericValue > max) {
      max = numericValue;
    }
  }

  return `GRZ-${max + 1}`;
}

export function getDatabasePath() {
  return resolvedDbPath;
}

export function closeDatabase() {
  if (db.open) {
    db.close();
  }
}
