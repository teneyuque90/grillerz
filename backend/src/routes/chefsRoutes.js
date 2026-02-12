import { Router } from 'express';

import { handleHttpError } from '../lib/http.js';
import { getChefById, getChefs } from '../services/chefsService.js';

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
