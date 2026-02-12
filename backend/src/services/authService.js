import bcrypt from 'bcryptjs';
import { randomInt, randomUUID } from 'node:crypto';

import { toPublicUser } from '../db.js';
import { AppError } from '../lib/AppError.js';
import { extractTokenExpiration, signUserToken, verifyUserToken } from '../lib/authToken.js';
import { deletePendingSignupByEmail, findPendingSignupByEmail, upsertPendingSignup } from '../repositories/pendingSignupsRepository.js';
import { createSessionRecord, findActiveSessionByTokenId, revokeSessionByTokenId } from '../repositories/sessionsRepository.js';
import { createUser, findUserByEmail, findUserById } from '../repositories/usersRepository.js';

const ALLOW_ANY_VERIFICATION_CODE = process.env.ALLOW_ANY_VERIFICATION_CODE
  ? process.env.ALLOW_ANY_VERIFICATION_CODE === 'true'
  : process.env.NODE_ENV !== 'production';

function sanitizeEmail(value) {
  return String(value).trim().toLowerCase();
}

function issueSessionToken(user, userAgent) {
  const tokenId = randomUUID();
  const token = signUserToken({
    userId: user.id,
    email: user.email,
    tokenId
  });

  createSessionRecord({
    id: randomUUID(),
    userId: user.id,
    tokenId,
    userAgent,
    expiresAt: extractTokenExpiration(token)
  });

  return token;
}

export function loginUser({ email, password, userAgent }) {
  if (!email || !password) {
    throw new AppError('Email y contrasena son requeridos.', 400);
  }

  const normalizedEmail = sanitizeEmail(email);
  const user = findUserByEmail(normalizedEmail);

  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    throw new AppError('Credenciales invalidas.', 401);
  }

  const token = issueSessionToken(user, userAgent);

  return {
    user: toPublicUser(user),
    token
  };
}

export function signupUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new AppError('Nombre, email y contrasena son requeridos.', 400);
  }

  const normalizedEmail = sanitizeEmail(email);
  const existingUser = findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError('Ese email ya esta registrado.', 409);
  }

  const verificationCode = String(randomInt(1000, 10000));
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  const passwordHash = bcrypt.hashSync(String(password), 10);

  upsertPendingSignup({
    email: normalizedEmail,
    name: String(name).trim(),
    passwordHash,
    code: verificationCode,
    expiresAt,
    createdAt: now.toISOString()
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[signup] verification code for ${normalizedEmail}: ${verificationCode}`);
  }

  return {
    ok: true,
    ...(process.env.NODE_ENV !== 'production' ? { debugCode: verificationCode } : {})
  };
}

export function verifySignup({ email, code, userAgent }) {
  if (!email || !code) {
    throw new AppError('Email y codigo son requeridos.', 400);
  }

  const normalizedEmail = sanitizeEmail(email);
  const pending = findPendingSignupByEmail(normalizedEmail);

  if (!pending) {
    throw new AppError('No existe registro pendiente.', 404);
  }

  if (String(code).trim().length < 4) {
    throw new AppError('Codigo invalido.', 400);
  }

  if (new Date(pending.expires_at).getTime() < Date.now()) {
    deletePendingSignupByEmail(normalizedEmail);
    throw new AppError('El codigo expiro. Solicita uno nuevo.', 400);
  }

  if (!ALLOW_ANY_VERIFICATION_CODE && String(code).trim() !== pending.code) {
    throw new AppError('Codigo invalido.', 400);
  }

  const existingUser = findUserByEmail(normalizedEmail);

  if (existingUser) {
    deletePendingSignupByEmail(normalizedEmail);
    const token = issueSessionToken(existingUser, userAgent);
    return { user: toPublicUser(existingUser), token };
  }

  createUser({
    id: normalizedEmail,
    name: pending.name,
    email: normalizedEmail,
    passwordHash: pending.password_hash,
    phone: '+52 867 000 0000',
    city: 'Nuevo Laredo',
    createdAt: new Date().toISOString()
  });

  deletePendingSignupByEmail(normalizedEmail);
  const newUser = findUserById(normalizedEmail);
  const token = issueSessionToken(newUser, userAgent);

  return {
    user: toPublicUser(newUser),
    token
  };
}

export function authenticateToken(token) {
  if (!token) {
    throw new AppError('No autorizado.', 401);
  }

  let payload;

  try {
    payload = verifyUserToken(token);
  } catch {
    throw new AppError('Sesion invalida o expirada.', 401);
  }

  if (typeof payload !== 'object' || !payload?.sub || !payload?.jti) {
    throw new AppError('Token invalido.', 401);
  }

  const userId = String(payload.sub);
  const tokenId = String(payload.jti);
  const session = findActiveSessionByTokenId(tokenId);

  if (!session || session.user_id !== userId) {
    throw new AppError('Sesion no valida.', 401);
  }

  const user = findUserById(userId);
  if (!user) {
    revokeSessionByTokenId(tokenId);
    throw new AppError('Usuario no encontrado.', 401);
  }

  return {
    tokenId,
    user
  };
}

export function logoutByTokenId(tokenId) {
  revokeSessionByTokenId(tokenId);
  return { ok: true };
}
