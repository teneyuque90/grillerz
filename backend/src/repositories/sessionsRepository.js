import { db } from '../db.js';

export function createSessionRecord({
  id,
  userId,
  tokenId,
  userAgent,
  expiresAt
}) {
  db.prepare(`
    INSERT INTO sessions (id, user_id, token_id, user_agent, created_at, expires_at, revoked_at)
    VALUES (@id, @userId, @tokenId, @userAgent, @createdAt, @expiresAt, NULL)
  `).run({
    id,
    userId,
    tokenId,
    userAgent: userAgent ?? null,
    createdAt: new Date().toISOString(),
    expiresAt
  });
}

export function findActiveSessionByTokenId(tokenId) {
  return db.prepare(`
    SELECT *
    FROM sessions
    WHERE token_id = ?
      AND revoked_at IS NULL
      AND datetime(expires_at) > datetime('now')
    LIMIT 1
  `).get(tokenId);
}

export function revokeSessionByTokenId(tokenId) {
  db.prepare(`
    UPDATE sessions
    SET revoked_at = ?
    WHERE token_id = ? AND revoked_at IS NULL
  `).run(new Date().toISOString(), tokenId);
}
