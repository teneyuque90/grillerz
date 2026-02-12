import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'grillerz-dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export function signUserToken({ userId, email, tokenId }) {
  return jwt.sign(
    { sub: userId, email, jti: tokenId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyUserToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function extractTokenExpiration(token) {
  const decoded = jwt.decode(token);

  if (typeof decoded !== 'object' || !decoded?.exp) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  return new Date(Number(decoded.exp) * 1000).toISOString();
}
