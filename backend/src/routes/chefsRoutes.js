import { Router } from 'express';

import { handleHttpError } from '../lib/http.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getChefById, getChefReviews, getChefVideos, getChefs, saveChefVideos } from '../services/chefsService.js';

export const chefsRoutes = Router();

chefsRoutes.get('/', (_req, res) => {
  try {
    const chefs = getChefs();
    res.json({ chefs });
  } catch (error) {
    handleHttpError(res, error);
  }
});

chefsRoutes.get('/:chefId', (req, res) => {
  try {
    const chef = getChefById(req.params.chefId);
    res.json({ chef });
  } catch (error) {
    handleHttpError(res, error);
  }
});

chefsRoutes.get('/:chefId/reviews', (req, res) => {
  try {
    const reviews = getChefReviews(req.params.chefId);
    res.json({ reviews });
  } catch (error) {
    handleHttpError(res, error);
  }
});

chefsRoutes.get('/:chefId/videos', (req, res) => {
  try {
    const videos = getChefVideos(req.params.chefId);
    res.json({ videos });
  } catch (error) {
    handleHttpError(res, error);
  }
});

chefsRoutes.put('/:chefId/videos', requireAuth, (req, res) => {
  try {
    const videos = saveChefVideos({
      authUserId: req.auth.user.id,
      chefId: req.params.chefId,
      videos: req.body?.videos
    });

    res.json({ videos });
  } catch (error) {
    handleHttpError(res, error);
  }
});
