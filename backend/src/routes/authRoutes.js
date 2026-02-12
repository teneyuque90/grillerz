import { Router } from 'express';

import { handleHttpError } from '../lib/http.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { loginUser, logoutByTokenId, signupUser, verifySignup } from '../services/authService.js';
import { toPublicUser } from '../db.js';

export const authRoutes = Router();

authRoutes.post('/login', (req, res) => {
  try {
    const result = loginUser({
      email: req.body?.email,
      password: req.body?.password,
      userAgent: req.get('user-agent') ?? null
    });

    res.json(result);
  } catch (error) {
    handleHttpError(res, error);
  }
});

authRoutes.post('/signup', (req, res) => {
  try {
    const result = signupUser({
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password
    });

    res.json(result);
  } catch (error) {
    handleHttpError(res, error);
  }
});

authRoutes.post('/verify', (req, res) => {
  try {
    const result = verifySignup({
      email: req.body?.email,
      code: req.body?.code,
      userAgent: req.get('user-agent') ?? null
    });

    res.json(result);
  } catch (error) {
    handleHttpError(res, error);
  }
});

authRoutes.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.auth.user) });
});

authRoutes.post('/logout', requireAuth, (req, res) => {
  try {
    const result = logoutByTokenId(req.auth.tokenId);
    res.json(result);
  } catch (error) {
    handleHttpError(res, error);
  }
});
