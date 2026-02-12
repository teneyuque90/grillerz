import { handleHttpError } from '../lib/http.js';
import { authenticateToken } from '../services/authService.js';

function extractBearerToken(req) {
  const header = req.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim() || null;
}

export function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    const auth = authenticateToken(token);
    req.auth = auth;
    next();
  } catch (error) {
    handleHttpError(res, error);
  }
}
