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
