import { randomUUID } from 'node:crypto';

import { mapChefReviewRow, mapChefRow, mapChefVideoRow } from '../db.js';
import { AppError } from '../lib/AppError.js';
import { listReviewsByChefId } from '../repositories/chefReviewsRepository.js';
import { listVideosByChefId, replaceVideosByChefId } from '../repositories/chefVideosRepository.js';
import { findChefById, listChefs, updateChefAvailabilityById, updateChefProfileById } from '../repositories/chefsRepository.js';

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

function canManageChef(authUser, chefId) {
  return canManageChefVideos(authUser, chefId);
}

function normalizeSpecialties(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  return [];
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

export function updateChefProfile({ authUser, chefId, payload }) {
  if (!canManageChef(authUser, chefId)) {
    throw new AppError('No tienes permisos para actualizar este perfil de griller.', 403);
  }

  const chefRow = findChefById(chefId);
  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const nextName = typeof payload?.name === 'string' && payload.name.trim() ? payload.name.trim() : chefRow.name;
  const nextTitle = typeof payload?.title === 'string' && payload.title.trim() ? payload.title.trim() : chefRow.title;
  const nextCity = typeof payload?.city === 'string' && payload.city.trim() ? payload.city.trim() : chefRow.city;
  const nextBio = typeof payload?.bio === 'string' && payload.bio.trim() ? payload.bio.trim() : chefRow.bio;
  const nextBasePrice = Number.isFinite(Number(payload?.basePrice)) ? Math.max(500, Number(payload.basePrice)) : chefRow.base_price;
  const normalizedSpecialties = normalizeSpecialties(payload?.specialties);
  const nextSpecialties = normalizedSpecialties.length > 0 ? normalizedSpecialties : JSON.parse(chefRow.specialties_json ?? '[]');

  updateChefProfileById({
    chefId,
    name: nextName,
    title: nextTitle,
    city: nextCity,
    basePrice: Math.round(nextBasePrice),
    specialtiesJson: JSON.stringify(nextSpecialties),
    bio: nextBio
  });

  return getChefById(chefId);
}

export function updateChefAvailability({ authUser, chefId, payload }) {
  if (!canManageChef(authUser, chefId)) {
    throw new AppError('No tienes permisos para actualizar la agenda del griller.', 403);
  }

  const chefRow = findChefById(chefId);
  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const incomingWeekdays = Array.isArray(payload?.weekdays) ? payload.weekdays : [];
  const incomingTimes = Array.isArray(payload?.times) ? payload.times : [];

  const weekdays = incomingWeekdays
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6)
    .slice(0, 7);
  const uniqueWeekdays = Array.from(new Set(weekdays)).sort((a, b) => a - b);

  const times = incomingTimes
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 16);
  const uniqueTimes = Array.from(new Set(times));

  if (uniqueWeekdays.length === 0 || uniqueTimes.length === 0) {
    throw new AppError('Debes enviar al menos un dia y un horario valido.', 400);
  }

  updateChefAvailabilityById({
    chefId,
    weekdaysJson: JSON.stringify(uniqueWeekdays),
    timesJson: JSON.stringify(uniqueTimes)
  });

  return getChefById(chefId);
}
