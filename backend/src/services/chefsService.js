import { mapChefRow } from '../db.js';
import { AppError } from '../lib/AppError.js';
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
