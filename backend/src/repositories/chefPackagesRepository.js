import { db } from '../db.js';

export function listPackagesByChefId(chefId) {
  return db
    .prepare('SELECT * FROM chef_packages WHERE chef_id = ? ORDER BY display_order ASC, created_at ASC')
    .all(chefId);
}

export function replacePackagesByChefId(chefId, packages) {
  const deleteQuery = db.prepare('DELETE FROM chef_packages WHERE chef_id = ?');
  const insertQuery = db.prepare(`
    INSERT INTO chef_packages (
      id, chef_id, name, details, price, is_active, display_order, created_at, updated_at
    ) VALUES (
      @id, @chefId, @name, @details, @price, @isActive, @displayOrder, @createdAt, @updatedAt
    )
  `);

  const transaction = db.transaction((items) => {
    deleteQuery.run(chefId);

    for (const item of items) {
      insertQuery.run(item);
    }
  });

  transaction(packages);
}
