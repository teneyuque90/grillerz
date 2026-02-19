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
const localChefMediaDir = path.resolve(__dirname, '../public/media/chefs');
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];

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
    avatarUrl: 'https://i.pravatar.cc/300?img=11',
    coverUrl: 'https://loremflickr.com/1200/800/grill,steak?lock=201',
    gallery: [
      'https://loremflickr.com/1200/800/bbq,ribs?lock=202',
      'https://loremflickr.com/1200/800/tomahawk,steak?lock=203',
      'https://loremflickr.com/1200/800/meat,smoke?lock=204'
    ],
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
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
    coverUrl: 'https://loremflickr.com/1200/800/bbq,brisket?lock=205',
    gallery: [
      'https://loremflickr.com/1200/800/grill,fire?lock=206',
      'https://loremflickr.com/1200/800/costillas,bbq?lock=207',
      'https://loremflickr.com/1200/800/barbecue,table?lock=208'
    ],
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
    avatarUrl: 'https://i.pravatar.cc/300?img=15',
    coverUrl: 'https://loremflickr.com/1200/800/smoked,meat?lock=209',
    gallery: [
      'https://loremflickr.com/1200/800/brisket,knife?lock=210',
      'https://loremflickr.com/1200/800/parrilla,carbon?lock=211',
      'https://loremflickr.com/1200/800/bbq,slowcook?lock=212'
    ],
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
    avatarUrl: 'https://i.pravatar.cc/300?img=16',
    coverUrl: 'https://loremflickr.com/1200/800/asado,regio?lock=213',
    gallery: [
      'https://loremflickr.com/1200/800/steak,grill?lock=214',
      'https://loremflickr.com/1200/800/arrachera,bbq?lock=215',
      'https://loremflickr.com/1200/800/grilling,party?lock=216'
    ],
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
    avatarUrl: 'https://i.pravatar.cc/300?img=17',
    coverUrl: 'https://loremflickr.com/1200/800/ribeye,grill?lock=217',
    gallery: [
      'https://loremflickr.com/1200/800/ribeye,meat?lock=218',
      'https://loremflickr.com/1200/800/carne,asada?lock=219',
      'https://loremflickr.com/1200/800/flame,barbecue?lock=220'
    ],
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
    city: 'Nuevo Laredo',
    role: 'admin',
    managedChefId: null
  },
  {
    id: 'admin@grillerz.app',
    name: 'Admin Grillerz',
    email: 'admin@grillerz.app',
    password: 'Admin123!',
    phone: '+52 867 222 2222',
    city: 'Nuevo Laredo',
    role: 'admin',
    managedChefId: null
  },
  {
    id: 'erick@grillerz.app',
    name: 'Erick Martinez',
    email: 'erick@grillerz.app',
    password: 'Griller123!',
    phone: '+52 867 333 3333',
    city: 'Nuevo Laredo',
    role: 'griller',
    managedChefId: 'erick-martinez'
  },
  {
    id: 'cliente@grillerz.app',
    name: 'Cliente Grillerz',
    email: 'cliente@grillerz.app',
    password: 'Cliente123!',
    phone: '+52 867 444 4444',
    city: 'Nuevo Laredo',
    role: 'client',
    managedChefId: null
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
  },
  {
    id: 'GRZ-4730',
    userId: 'cliente@grillerz.app',
    chefId: 'erick-martinez',
    chefName: 'Erick Martinez',
    status: 'Pendiente',
    dateLabel: '22 Abril 2026',
    timeLabel: '7:30 PM',
    mode: 'A domicilio',
    address: 'Lago de Chapala 804, Nuevo Laredo',
    packageName: 'Parrilla Mixta',
    guests: 10,
    durationHours: 4,
    serviceFee: 2800,
    transferFee: 300,
    total: 3100,
    paymentMethod: 'Transferencia'
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
      id, name, title, city, rating, reviews, base_price, specialties_json, avatar_url, cover_url, gallery_json,
      bio, services, clients, years, created_at
    ) VALUES (
      @id, @name, @title, @city, @rating, @reviews, @basePrice, @specialtiesJson, @avatarUrl, @coverUrl, @galleryJson,
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
        avatarUrl: chef.avatarUrl,
        coverUrl: chef.coverUrl,
        galleryJson: JSON.stringify(chef.gallery),
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
    INSERT INTO users (id, name, email, password_hash, phone, city, role, managed_chef_id, created_at)
    VALUES (@id, @name, @email, @passwordHash, @phone, @city, @role, @managedChefId, @createdAt)
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
        role: user.role ?? 'client',
        managedChefId: user.managedChefId ?? null,
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

function findChefImageRelativePath(chefId, baseFileName) {
  for (const extension of imageExtensions) {
    const absolutePath = path.join(localChefMediaDir, chefId, `${baseFileName}.${extension}`);
    if (fs.existsSync(absolutePath)) {
      return `/media/chefs/${chefId}/${baseFileName}.${extension}`;
    }
  }

  return null;
}

function buildChefGalleryFromDisk(chefId) {
  const gallery = [];

  for (let index = 1; index <= 6; index += 1) {
    const relativePath = findChefImageRelativePath(chefId, `gallery-${index}`);
    if (relativePath) {
      gallery.push(relativePath);
    }
  }

  return gallery;
}

export function toPublicUser(userRow) {
  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    phone: userRow.phone,
    city: userRow.city,
    role: userRow.role ?? 'client',
    managedChefId: userRow.managed_chef_id ?? null
  };
}

export function mapChefRow(row) {
  const avatarFromDisk = findChefImageRelativePath(row.id, 'avatar');
  const coverFromDisk = findChefImageRelativePath(row.id, 'cover');
  const galleryFromDisk = buildChefGalleryFromDisk(row.id);
  const galleryFromDb = safeJsonParse(row.gallery_json ?? '[]', []);

  return {
    id: row.id,
    name: row.name,
    title: row.title,
    city: row.city,
    rating: row.rating,
    reviews: row.reviews,
    basePrice: row.base_price,
    specialties: safeJsonParse(row.specialties_json, []),
    avatarUrl: avatarFromDisk ?? row.avatar_url ?? '',
    coverUrl: coverFromDisk ?? row.cover_url ?? '',
    gallery: galleryFromDisk.length > 0 ? galleryFromDisk : galleryFromDb,
    bio: row.bio,
    availability: {
      weekdays: safeJsonParse(row.availability_weekdays_json ?? '[1,2,3,4,5,6,0]', [1, 2, 3, 4, 5, 6, 0]),
      times: safeJsonParse(row.availability_times_json ?? '["6:00 PM","7:00 PM","8:00 PM"]', ['6:00 PM', '7:00 PM', '8:00 PM'])
    },
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

export function mapChefReviewRow(row) {
  return {
    id: row.id,
    chefId: row.chef_id,
    authorName: row.author_name,
    rating: row.rating,
    comment: row.comment,
    dateLabel: row.date_label,
    createdAt: row.created_at
  };
}

export function mapChefVideoRow(row) {
  return {
    id: row.id,
    chefId: row.chef_id,
    title: row.title,
    subtitle: row.subtitle,
    youtubeUrl: row.youtube_url,
    videoId: row.video_id,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
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
