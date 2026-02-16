import { db } from '../db.js';

export function listReviewsByChefId(chefId, limit = 30) {
  return db
    .prepare(`
      SELECT *
      FROM chef_reviews
      WHERE chef_id = ?
      ORDER BY datetime(created_at) DESC
      LIMIT ?
    `)
    .all(chefId, limit);
}
