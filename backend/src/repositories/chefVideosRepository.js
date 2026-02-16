import { db } from '../db.js';

export function listVideosByChefId(chefId) {
  return db
    .prepare(`
      SELECT *
      FROM chef_videos
      WHERE chef_id = ?
      ORDER BY display_order ASC, datetime(created_at) DESC
    `)
    .all(chefId);
}

export function replaceVideosByChefId(chefId, videos) {
  const remove = db.prepare('DELETE FROM chef_videos WHERE chef_id = ?');
  const insert = db.prepare(`
    INSERT INTO chef_videos (
      id, chef_id, title, subtitle, youtube_url, video_id, display_order, created_at, updated_at
    ) VALUES (
      @id, @chefId, @title, @subtitle, @youtubeUrl, @videoId, @displayOrder, @createdAt, @updatedAt
    )
  `);

  const transaction = db.transaction(() => {
    remove.run(chefId);
    for (const item of videos) {
      insert.run(item);
    }
  });

  transaction();
}
