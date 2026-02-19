import bcrypt from 'bcryptjs';

const chefMediaSeedById = {
  'erick-martinez': {
    avatarUrl: 'https://i.pravatar.cc/300?img=11',
    coverUrl: 'https://loremflickr.com/1200/800/grill,steak?lock=201',
    gallery: [
      'https://loremflickr.com/1200/800/bbq,ribs?lock=202',
      'https://loremflickr.com/1200/800/tomahawk,steak?lock=203',
      'https://loremflickr.com/1200/800/meat,smoke?lock=204'
    ]
  },
  'carlos-bbq': {
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
    coverUrl: 'https://loremflickr.com/1200/800/bbq,brisket?lock=205',
    gallery: [
      'https://loremflickr.com/1200/800/grill,fire?lock=206',
      'https://loremflickr.com/1200/800/costillas,bbq?lock=207',
      'https://loremflickr.com/1200/800/barbecue,table?lock=208'
    ]
  },
  'martin-asador': {
    avatarUrl: 'https://i.pravatar.cc/300?img=15',
    coverUrl: 'https://loremflickr.com/1200/800/smoked,meat?lock=209',
    gallery: [
      'https://loremflickr.com/1200/800/brisket,knife?lock=210',
      'https://loremflickr.com/1200/800/parrilla,carbon?lock=211',
      'https://loremflickr.com/1200/800/bbq,slowcook?lock=212'
    ]
  },
  'luis-bbq': {
    avatarUrl: 'https://i.pravatar.cc/300?img=16',
    coverUrl: 'https://loremflickr.com/1200/800/asado,regio?lock=213',
    gallery: [
      'https://loremflickr.com/1200/800/steak,grill?lock=214',
      'https://loremflickr.com/1200/800/arrachera,bbq?lock=215',
      'https://loremflickr.com/1200/800/grilling,party?lock=216'
    ]
  },
  'cories-bbq': {
    avatarUrl: 'https://i.pravatar.cc/300?img=17',
    coverUrl: 'https://loremflickr.com/1200/800/ribeye,grill?lock=217',
    gallery: [
      'https://loremflickr.com/1200/800/ribeye,meat?lock=218',
      'https://loremflickr.com/1200/800/carne,asada?lock=219',
      'https://loremflickr.com/1200/800/flame,barbecue?lock=220'
    ]
  }
};

const chefReviewsSeed = [
  {
    id: 'rv-erick-001',
    chefId: 'erick-martinez',
    authorName: 'Ana R.',
    rating: 5,
    comment: 'Excelente servicio y carne en su punto.',
    dateLabel: 'Hace 2 dias',
    createdAt: '2026-02-12T10:00:00.000Z'
  },
  {
    id: 'rv-erick-002',
    chefId: 'erick-martinez',
    authorName: 'Jorge M.',
    rating: 5,
    comment: 'Muy profesional, puntual y limpio.',
    dateLabel: 'Hace 1 semana',
    createdAt: '2026-02-07T13:00:00.000Z'
  },
  {
    id: 'rv-erick-003',
    chefId: 'erick-martinez',
    authorName: 'Paola G.',
    rating: 4,
    comment: 'Muy buen sabor, repetiremos.',
    dateLabel: 'Hace 2 semanas',
    createdAt: '2026-01-30T20:00:00.000Z'
  },
  {
    id: 'rv-carlos-001',
    chefId: 'carlos-bbq',
    authorName: 'Daniel T.',
    rating: 5,
    comment: 'Costillas y brisket de gran nivel.',
    dateLabel: 'Hace 3 dias',
    createdAt: '2026-02-11T11:00:00.000Z'
  },
  {
    id: 'rv-carlos-002',
    chefId: 'carlos-bbq',
    authorName: 'Monica L.',
    rating: 4,
    comment: 'Buena atencion y porciones generosas.',
    dateLabel: 'Hace 1 semana',
    createdAt: '2026-02-06T18:00:00.000Z'
  },
  {
    id: 'rv-carlos-003',
    chefId: 'carlos-bbq',
    authorName: 'Luis A.',
    rating: 5,
    comment: 'Todo salio perfecto para el evento.',
    dateLabel: 'Hace 2 semanas',
    createdAt: '2026-01-29T15:00:00.000Z'
  },
  {
    id: 'rv-martin-001',
    chefId: 'martin-asador',
    authorName: 'Karla V.',
    rating: 5,
    comment: 'Ahumado espectacular, gran presentacion.',
    dateLabel: 'Hace 2 dias',
    createdAt: '2026-02-12T09:00:00.000Z'
  },
  {
    id: 'rv-martin-002',
    chefId: 'martin-asador',
    authorName: 'Brenda C.',
    rating: 4,
    comment: 'Muy buen sabor y tiempos correctos.',
    dateLabel: 'Hace 9 dias',
    createdAt: '2026-02-05T16:00:00.000Z'
  },
  {
    id: 'rv-martin-003',
    chefId: 'martin-asador',
    authorName: 'Arturo N.',
    rating: 5,
    comment: 'Servicio premium en todo momento.',
    dateLabel: 'Hace 3 semanas',
    createdAt: '2026-01-26T21:00:00.000Z'
  },
  {
    id: 'rv-luis-001',
    chefId: 'luis-bbq',
    authorName: 'Jose P.',
    rating: 4,
    comment: 'Muy buen asado y buena actitud.',
    dateLabel: 'Hace 4 dias',
    createdAt: '2026-02-10T12:00:00.000Z'
  },
  {
    id: 'rv-luis-002',
    chefId: 'luis-bbq',
    authorName: 'Sofia I.',
    rating: 5,
    comment: 'Recomendado para reuniones familiares.',
    dateLabel: 'Hace 1 semana',
    createdAt: '2026-02-06T19:30:00.000Z'
  },
  {
    id: 'rv-luis-003',
    chefId: 'luis-bbq',
    authorName: 'Pedro E.',
    rating: 4,
    comment: 'Buen servicio y menu variado.',
    dateLabel: 'Hace 2 semanas',
    createdAt: '2026-01-28T17:20:00.000Z'
  },
  {
    id: 'rv-cories-001',
    chefId: 'cories-bbq',
    authorName: 'Majo F.',
    rating: 5,
    comment: 'Ribeye jugoso y atencion impecable.',
    dateLabel: 'Hace 3 dias',
    createdAt: '2026-02-11T08:40:00.000Z'
  },
  {
    id: 'rv-cories-002',
    chefId: 'cories-bbq',
    authorName: 'Ricardo B.',
    rating: 4,
    comment: 'Muy buen sazón y buena organizacion.',
    dateLabel: 'Hace 1 semana',
    createdAt: '2026-02-07T14:45:00.000Z'
  },
  {
    id: 'rv-cories-003',
    chefId: 'cories-bbq',
    authorName: 'Diana O.',
    rating: 5,
    comment: 'Experiencia completa, vale la pena.',
    dateLabel: 'Hace 2 semanas',
    createdAt: '2026-01-31T20:30:00.000Z'
  }
];

const chefVideosSeed = [
  {
    id: 'vd-erick-001',
    chefId: 'erick-martinez',
    title: 'Tomahawk al Carbon: punto perfecto',
    subtitle: 'Tecnica de sellado y reposo',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoId: 'dQw4w9WgXcQ',
    displayOrder: 0,
    createdAt: '2026-02-12T10:00:00.000Z',
    updatedAt: '2026-02-12T10:00:00.000Z'
  },
  {
    id: 'vd-erick-002',
    chefId: 'erick-martinez',
    title: 'Costillas ahumadas estilo norte',
    subtitle: 'Coccion lenta y glaseado',
    youtubeUrl: 'https://www.youtube.com/watch?v=M7FIvfx5J10',
    videoId: 'M7FIvfx5J10',
    displayOrder: 1,
    createdAt: '2026-02-12T11:00:00.000Z',
    updatedAt: '2026-02-12T11:00:00.000Z'
  },
  {
    id: 'vd-carlos-001',
    chefId: 'carlos-bbq',
    title: 'Parrilla mixta para 20 personas',
    subtitle: 'Orden y tiempos de servicio',
    youtubeUrl: 'https://www.youtube.com/watch?v=J---aiyznGQ',
    videoId: 'J---aiyznGQ',
    displayOrder: 0,
    createdAt: '2026-02-11T09:00:00.000Z',
    updatedAt: '2026-02-11T09:00:00.000Z'
  },
  {
    id: 'vd-carlos-002',
    chefId: 'carlos-bbq',
    title: 'Brisket jugoso: guia completa',
    subtitle: 'Temperatura y reposo',
    youtubeUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
    videoId: 'kXYiU_JCYtU',
    displayOrder: 1,
    createdAt: '2026-02-11T10:30:00.000Z',
    updatedAt: '2026-02-11T10:30:00.000Z'
  },
  {
    id: 'vd-martin-001',
    chefId: 'martin-asador',
    title: 'Cortes premium al fuego vivo',
    subtitle: 'Control de flama y sabor',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    videoId: 'fJ9rUzIMcZQ',
    displayOrder: 0,
    createdAt: '2026-02-10T08:00:00.000Z',
    updatedAt: '2026-02-10T08:00:00.000Z'
  },
  {
    id: 'vd-luis-001',
    chefId: 'luis-bbq',
    title: 'Asado regio para eventos',
    subtitle: 'Flujo para servicio rapido',
    youtubeUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
    videoId: 'hTWKbfoikeg',
    displayOrder: 0,
    createdAt: '2026-02-09T14:00:00.000Z',
    updatedAt: '2026-02-09T14:00:00.000Z'
  },
  {
    id: 'vd-cories-001',
    chefId: 'cories-bbq',
    title: 'Ribeye jugoso en parrilla',
    subtitle: 'Sellado, mantequilla y acabado',
    youtubeUrl: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
    videoId: 'Zi_XLOBDo_Y',
    displayOrder: 0,
    createdAt: '2026-02-08T18:00:00.000Z',
    updatedAt: '2026-02-08T18:00:00.000Z'
  }
];

function hasColumn(db, tableName, columnName) {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return rows.some((row) => row.name === columnName);
}

const migrations = [
  {
    id: '001_create_users',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          phone TEXT NOT NULL,
          city TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
    }
  },
  {
    id: '002_create_pending_signups',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS pending_signups (
          email TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
    }
  },
  {
    id: '003_create_chefs',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS chefs (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          title TEXT NOT NULL,
          city TEXT NOT NULL,
          rating REAL NOT NULL,
          reviews INTEGER NOT NULL,
          base_price INTEGER NOT NULL,
          specialties_json TEXT NOT NULL,
          avatar_url TEXT NOT NULL DEFAULT '',
          cover_url TEXT NOT NULL DEFAULT '',
          gallery_json TEXT NOT NULL DEFAULT '[]',
          bio TEXT NOT NULL,
          services INTEGER NOT NULL,
          clients INTEGER NOT NULL,
          years INTEGER NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
    }
  },
  {
    id: '004_create_bookings',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          chef_id TEXT NOT NULL,
          chef_name TEXT NOT NULL,
          status TEXT NOT NULL,
          date_label TEXT NOT NULL,
          time_label TEXT NOT NULL,
          mode TEXT NOT NULL,
          address TEXT NOT NULL,
          package_name TEXT NOT NULL,
          guests INTEGER NOT NULL,
          duration_hours INTEGER NOT NULL,
          service_fee INTEGER NOT NULL,
          transfer_fee INTEGER NOT NULL,
          total INTEGER NOT NULL,
          payment_method TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
    }
  },
  {
    id: '005_create_sessions',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token_id TEXT NOT NULL UNIQUE,
          user_agent TEXT,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          revoked_at TEXT
        );
      `);
    }
  },
  {
    id: '006_create_indexes',
    up(db) {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_chef_id ON bookings(chef_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_token_id ON sessions(token_id);
      `);
    }
  },
  {
    id: '007_add_chefs_media_columns',
    up(db) {
      if (!hasColumn(db, 'chefs', 'avatar_url')) {
        db.exec(`ALTER TABLE chefs ADD COLUMN avatar_url TEXT NOT NULL DEFAULT '';`);
      }

      if (!hasColumn(db, 'chefs', 'cover_url')) {
        db.exec(`ALTER TABLE chefs ADD COLUMN cover_url TEXT NOT NULL DEFAULT '';`);
      }

      if (!hasColumn(db, 'chefs', 'gallery_json')) {
        db.exec(`ALTER TABLE chefs ADD COLUMN gallery_json TEXT NOT NULL DEFAULT '[]';`);
      }

      const update = db.prepare(`
        UPDATE chefs
        SET avatar_url = @avatarUrl,
            cover_url = @coverUrl,
            gallery_json = @galleryJson
        WHERE id = @id
      `);

      for (const [id, media] of Object.entries(chefMediaSeedById)) {
        update.run({
          id,
          avatarUrl: media.avatarUrl,
          coverUrl: media.coverUrl,
          galleryJson: JSON.stringify(media.gallery)
        });
      }
    }
  },
  {
    id: '008_create_chef_reviews',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS chef_reviews (
          id TEXT PRIMARY KEY,
          chef_id TEXT NOT NULL,
          author_name TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          date_label TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_chef_reviews_chef_id ON chef_reviews(chef_id);
        CREATE INDEX IF NOT EXISTS idx_chef_reviews_created_at ON chef_reviews(created_at);
      `);

      const count = db.prepare('SELECT COUNT(*) AS total FROM chef_reviews').get().total;
      if (count > 0) {
        return;
      }

      const insert = db.prepare(`
        INSERT INTO chef_reviews (id, chef_id, author_name, rating, comment, date_label, created_at)
        VALUES (@id, @chefId, @authorName, @rating, @comment, @dateLabel, @createdAt)
      `);

      for (const item of chefReviewsSeed) {
        insert.run(item);
      }
    }
  },
  {
    id: '009_create_chef_videos',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS chef_videos (
          id TEXT PRIMARY KEY,
          chef_id TEXT NOT NULL,
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL,
          youtube_url TEXT NOT NULL,
          video_id TEXT NOT NULL,
          display_order INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_chef_videos_chef_id ON chef_videos(chef_id);
        CREATE INDEX IF NOT EXISTS idx_chef_videos_display_order ON chef_videos(display_order);
      `);

      const count = db.prepare('SELECT COUNT(*) AS total FROM chef_videos').get().total;
      if (count > 0) {
        return;
      }

      const insert = db.prepare(`
        INSERT INTO chef_videos (id, chef_id, title, subtitle, youtube_url, video_id, display_order, created_at, updated_at)
        VALUES (@id, @chefId, @title, @subtitle, @youtubeUrl, @videoId, @displayOrder, @createdAt, @updatedAt)
      `);

      for (const item of chefVideosSeed) {
        insert.run(item);
      }
    }
  },
  {
    id: '010_add_user_roles',
    up(db) {
      if (!hasColumn(db, 'users', 'role')) {
        db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'client';`);
      }

      if (!hasColumn(db, 'users', 'managed_chef_id')) {
        db.exec(`ALTER TABLE users ADD COLUMN managed_chef_id TEXT;`);
      }

      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_managed_chef_id ON users(managed_chef_id);
      `);

      db.prepare(`UPDATE users SET role = 'client' WHERE role IS NULL OR TRIM(role) = '';`).run();
      db.prepare(`UPDATE users SET managed_chef_id = NULL WHERE managed_chef_id IS NOT NULL AND TRIM(managed_chef_id) = '';`).run();
    }
  },
  {
    id: '011_seed_users_by_role',
    up(db) {
      const now = new Date().toISOString();
      const usersSeed = [
        {
          id: 'gabriel@email.com',
          name: 'Gabriel Teneyuque',
          email: 'gabriel@email.com',
          passwordHash: bcrypt.hashSync('123456', 10),
          phone: '+52 867 000 0000',
          city: 'Nuevo Laredo',
          role: 'admin',
          managedChefId: null
        },
        {
          id: 'admin@grillerz.app',
          name: 'Admin Grillerz',
          email: 'admin@grillerz.app',
          passwordHash: bcrypt.hashSync('Admin123!', 10),
          phone: '+52 867 222 2222',
          city: 'Nuevo Laredo',
          role: 'admin',
          managedChefId: null
        },
        {
          id: 'erick@grillerz.app',
          name: 'Erick Martinez',
          email: 'erick@grillerz.app',
          passwordHash: bcrypt.hashSync('Griller123!', 10),
          phone: '+52 867 333 3333',
          city: 'Nuevo Laredo',
          role: 'griller',
          managedChefId: 'erick-martinez'
        },
        {
          id: 'cliente@grillerz.app',
          name: 'Cliente Grillerz',
          email: 'cliente@grillerz.app',
          passwordHash: bcrypt.hashSync('Cliente123!', 10),
          phone: '+52 867 444 4444',
          city: 'Nuevo Laredo',
          role: 'client',
          managedChefId: null
        }
      ];

      const existingByEmail = db.prepare('SELECT id, email FROM users WHERE email = ?');
      const insert = db.prepare(`
        INSERT INTO users (id, name, email, password_hash, phone, city, role, managed_chef_id, created_at)
        VALUES (@id, @name, @email, @passwordHash, @phone, @city, @role, @managedChefId, @createdAt)
      `);
      const updateRole = db.prepare(`
        UPDATE users
        SET role = @role, managed_chef_id = @managedChefId
        WHERE email = @email
      `);

      for (const item of usersSeed) {
        const existing = existingByEmail.get(item.email);
        if (existing) {
          updateRole.run({
            email: item.email,
            role: item.role,
            managedChefId: item.managedChefId
          });
          continue;
        }

        insert.run({
          ...item,
          createdAt: now
        });
      }
    }
  }
];

function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);
}

function isApplied(db, migrationId) {
  const row = db
    .prepare('SELECT id FROM schema_migrations WHERE id = ?')
    .get(migrationId);

  return Boolean(row);
}

function markApplied(db, migrationId) {
  db.prepare(`
    INSERT INTO schema_migrations (id, applied_at)
    VALUES (?, ?)
  `).run(migrationId, new Date().toISOString());
}

export function runMigrations(db) {
  ensureMigrationsTable(db);

  let applied = 0;
  let skipped = 0;

  const transaction = db.transaction(() => {
    for (const migration of migrations) {
      if (isApplied(db, migration.id)) {
        skipped += 1;
        continue;
      }

      migration.up(db);
      markApplied(db, migration.id);
      applied += 1;
    }
  });

  transaction();

  return {
    total: migrations.length,
    applied,
    skipped
  };
}
