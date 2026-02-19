import { randomUUID } from 'node:crypto';

import { mapChefReviewRow, mapChefRow, mapChefVideoRow } from '../db.js';
import { AppError } from '../lib/AppError.js';
import { listReviewsByChefId } from '../repositories/chefReviewsRepository.js';
import { listVideosByChefId, replaceVideosByChefId } from '../repositories/chefVideosRepository.js';
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

function parseYouTubeVideoId(youtubeUrl) {
  try {
    const url = new URL(youtubeUrl);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace(/\//g, '').trim();
    }

    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('v')?.trim() ?? '';
    }
  } catch {
    return '';
  }

  return '';
}

function normalizeVideosPayload(videos) {
  if (!Array.isArray(videos)) {
    throw new AppError('El campo videos debe ser un arreglo.', 400);
  }

  const trimmedVideos = videos
    .map((item) => ({
      title: typeof item?.title === 'string' ? item.title.trim() : '',
      subtitle: typeof item?.subtitle === 'string' ? item.subtitle.trim() : '',
      youtubeUrl: typeof item?.youtubeUrl === 'string' ? item.youtubeUrl.trim() : ''
    }))
    .filter((item) => item.title && item.youtubeUrl);

  if (trimmedVideos.length > 12) {
    throw new AppError('Maximo 12 videos por griller.', 400);
  }

  return trimmedVideos.map((item, index) => {
    const videoId = parseYouTubeVideoId(item.youtubeUrl);
    if (!videoId) {
      throw new AppError('Incluye links validos de YouTube.', 400);
    }

    return {
      id: randomUUID(),
      title: item.title,
      subtitle: item.subtitle || 'Video destacado del griller',
      youtubeUrl: item.youtubeUrl,
      videoId,
      displayOrder: index
    };
  });
}

function canManageChefVideos(authUser, chefId) {
  if (!authUser) {
    return false;
  }

  const role = String(authUser.role ?? 'client');
  if (role === 'admin') {
    return true;
  }

  if (role === 'griller') {
    return String(authUser.managed_chef_id ?? '') === chefId;
  }

  return false;
}

export function getChefVideos(chefId) {
  const chefRow = findChefById(chefId);

  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const rows = listVideosByChefId(chefId);
  return rows.map(mapChefVideoRow);
}

export function saveChefVideos({ authUser, chefId, videos }) {
  if (!canManageChefVideos(authUser, chefId)) {
    throw new AppError('No tienes permisos para actualizar videos de grillers.', 403);
  }

  const chefRow = findChefById(chefId);

  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const normalized = normalizeVideosPayload(videos).map((item) => {
    const now = new Date().toISOString();
    return {
      ...item,
      chefId,
      createdAt: now,
      updatedAt: now
    };
  });

  replaceVideosByChefId(chefId, normalized);
  return getChefVideos(chefId);
}
