import { db } from '../db.js';

export function listChefs() {
  return db
    .prepare('SELECT * FROM chefs ORDER BY rating DESC, reviews DESC, name ASC')
    .all();
}

export function findChefById(chefId) {
  return db.prepare('SELECT * FROM chefs WHERE id = ?').get(chefId);
}
