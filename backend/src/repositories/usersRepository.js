import { db } from '../db.js';

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function findUserById(userId) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

export function createUser({
  id,
  name,
  email,
  passwordHash,
  phone,
  city,
  createdAt
}) {
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, phone, city, created_at)
    VALUES (@id, @name, @email, @passwordHash, @phone, @city, @createdAt)
  `).run({
    id,
    name,
    email,
    passwordHash,
    phone,
    city,
    createdAt
  });
}
