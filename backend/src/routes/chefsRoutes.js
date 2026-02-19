import { Router } from 'express';

import { handleHttpError } from '../lib/http.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getChefById, getChefPackages, getChefReviews, getChefVideos, getChefs, saveChefPackages, saveChefVideos, updateChefAvailability, updateChefProfile } from '../services/chefsService.js';

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

chefsRoutes.get('/:chefId/packages', (req, res) => {
  try {
    const packages = getChefPackages(req.params.chefId);
    res.json({ packages });
  } catch (error) {
    handleHttpError(res, error);
  }
});

chefsRoutes.put('/:chefId/videos', requireAuth, (req, res) => {
  try {
    const videos = saveChefVideos({
      authUser: req.auth.user,
      chefId: req.params.chefId,
      videos: req.body?.videos
    });

    res.json({ videos });
  } catch (error) {
    handleHttpError(res, error);
  }
});

chefsRoutes.put('/:chefId/packages', requireAuth, (req, res) => {
  try {
    const packages = saveChefPackages({
      authUser: req.auth.user,
      chefId: req.params.chefId,
      packages: req.body?.packages
    });

    res.json({ packages });
  } catch (error) {
    handleHttpError(res, error);
  }
});

chefsRoutes.put('/:chefId/profile', requireAuth, (req, res) => {
  try {
    const chef = updateChefProfile({
      authUser: req.auth.user,
      chefId: req.params.chefId,
      payload: req.body ?? {}
    });

    res.json({ chef });
  } catch (error) {
    handleHttpError(res, error);
  }
});

chefsRoutes.put('/:chefId/availability', requireAuth, (req, res) => {
  try {
    const chef = updateChefAvailability({
      authUser: req.auth.user,
      chefId: req.params.chefId,
      payload: req.body ?? {}
    });

    res.json({ chef });
  } catch (error) {
    handleHttpError(res, error);
  }
});
