import { mapChefReviewRow, mapChefRow } from '../db.js';
import { AppError } from '../lib/AppError.js';
import { listReviewsByChefId } from '../repositories/chefReviewsRepository.js';
import { findChefById, listChefs } from '../repositories/chefsRepository.js';

export function getChefs() {
  const rows = listChefs();
  return rows.map(mapChefRow);
}

export function getChefById(chefId) {
  const row = findChefById(chefId);

  if (!row) {
    throw new AppError('Chef no encontrado.', 404);
  }

  return mapChefRow(row);
}

export function getChefReviews(chefId) {
  const chefRow = findChefById(chefId);

  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const rows = listReviewsByChefId(chefId);
  return rows.map(mapChefReviewRow);
}
