import { db } from '../db.js';

export function findPendingSignupByEmail(email) {
  return db.prepare('SELECT * FROM pending_signups WHERE email = ?').get(email);
}

export function upsertPendingSignup({
  email,
  name,
  passwordHash,
  code,
  expiresAt,
  createdAt
}) {
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
    email,
    name,
    passwordHash,
    code,
    expiresAt,
    createdAt
  });
}

export function deletePendingSignupByEmail(email) {
  db.prepare('DELETE FROM pending_signups WHERE email = ?').run(email);
}
