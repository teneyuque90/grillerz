import { randomUUID } from 'node:crypto';

import { mapChefPackageRow, mapChefReviewRow, mapChefRow, mapChefVideoRow } from '../db.js';
import { AppError } from '../lib/AppError.js';
import { listPackagesByChefId, replacePackagesByChefId } from '../repositories/chefPackagesRepository.js';
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

function safeParseJson(rawValue, fallbackValue) {
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

function normalizeImageUrl(value, fallbackValue) {
  if (typeof value !== 'string') {
    return fallbackValue;
  }

  const candidate = value.trim();
  if (!candidate) {
    return fallbackValue;
  }

  if (candidate.startsWith('/media/')) {
    return candidate;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return candidate;
    }
  } catch {
    return fallbackValue;
  }

  return fallbackValue;
}

function normalizeGallery(value, fallbackValue) {
  let sourceList = [];

  if (Array.isArray(value)) {
    sourceList = value;
  } else if (typeof value === 'string') {
    sourceList = value.split(/[\n,]/);
  } else {
    return fallbackValue;
  }

  const normalized = sourceList
    .map((item) => normalizeImageUrl(String(item), '').trim())
    .filter(Boolean)
    .slice(0, 12);

  if (normalized.length === 0) {
    return fallbackValue;
  }

  return normalized;
}

export function getChefVideos(chefId) {
  const chefRow = findChefById(chefId);

  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const rows = listVideosByChefId(chefId);
  return rows.map(mapChefVideoRow);
}

export function getChefPackages(chefId) {
  const chefRow = findChefById(chefId);

  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const rows = listPackagesByChefId(chefId);
  return rows.map(mapChefPackageRow);
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

function normalizePackagesPayload(packages) {
  if (!Array.isArray(packages)) {
    throw new AppError('El campo packages debe ser un arreglo.', 400);
  }

  const normalized = packages
    .map((item) => ({
      name: typeof item?.name === 'string' ? item.name.trim() : '',
      details: typeof item?.details === 'string' ? item.details.trim() : '',
      price: Number(item?.price),
      isActive: item?.isActive === false ? 0 : 1
    }))
    .filter((item) => item.name && Number.isFinite(item.price) && item.price >= 500)
    .slice(0, 20);

  if (normalized.length === 0) {
    throw new AppError('Debes enviar al menos un paquete valido.', 400);
  }

  return normalized.map((item, index) => ({
    id: randomUUID(),
    ...item,
    price: Math.round(item.price),
    details: item.details || 'Paquete del griller',
    displayOrder: index
  }));
}

export function saveChefPackages({ authUser, chefId, packages }) {
  if (!canManageChef(authUser, chefId)) {
    throw new AppError('No tienes permisos para actualizar paquetes de grillers.', 403);
  }

  const chefRow = findChefById(chefId);
  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const normalized = normalizePackagesPayload(packages).map((item) => {
    const now = new Date().toISOString();
    return {
      ...item,
      chefId,
      createdAt: now,
      updatedAt: now
    };
  });

  replacePackagesByChefId(chefId, normalized);
  return getChefPackages(chefId);
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
  const currentGallery = safeParseJson(chefRow.gallery_json ?? '[]', []);
  const nextAvatarUrl = normalizeImageUrl(payload?.avatarUrl, chefRow.avatar_url ?? '');
  const nextCoverUrl = normalizeImageUrl(payload?.coverUrl, chefRow.cover_url ?? '');
  const nextGallery = normalizeGallery(payload?.gallery, currentGallery);

  updateChefProfileById({
    chefId,
    name: nextName,
    title: nextTitle,
    city: nextCity,
    basePrice: Math.round(nextBasePrice),
    specialtiesJson: JSON.stringify(nextSpecialties),
    bio: nextBio,
    avatarUrl: nextAvatarUrl,
    coverUrl: nextCoverUrl,
    galleryJson: JSON.stringify(nextGallery)
  });

  return getChefById(chefId);
}

function isValidDateKey(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return false;
  }

  const [yearRaw, monthRaw, dayRaw] = trimmed.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day;
}

function normalizeBlockedDates(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const dates = value
    .map((item) => String(item).trim())
    .filter((item) => isValidDateKey(item))
    .slice(0, 40);

  return Array.from(new Set(dates)).sort();
}

function normalizeSpecialDates(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value
    .map((item) => {
      const date = typeof item?.date === 'string' ? item.date.trim() : '';
      const times = Array.isArray(item?.times)
        ? item.times.map((time) => String(time).trim()).filter(Boolean).slice(0, 16)
        : [];

      return {
        date,
        times: Array.from(new Set(times))
      };
    })
    .filter((item) => isValidDateKey(item.date) && item.times.length > 0)
    .slice(0, 24)
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDate = new Map();
  for (const item of normalized) {
    byDate.set(item.date, item);
  }

  return Array.from(byDate.values());
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
  const currentBlockedDates = safeParseJson(chefRow.availability_blocked_dates_json ?? '[]', []);
  const currentSpecialDates = safeParseJson(chefRow.availability_special_dates_json ?? '[]', []);
  const blockedDates = Array.isArray(payload?.blockedDates)
    ? normalizeBlockedDates(payload?.blockedDates)
    : normalizeBlockedDates(currentBlockedDates);
  const specialDates = Array.isArray(payload?.specialDates)
    ? normalizeSpecialDates(payload?.specialDates)
    : normalizeSpecialDates(currentSpecialDates);

  const specialDateKeys = new Set(specialDates.map((item) => item.date));
  const cleanBlockedDates = blockedDates.filter((item) => !specialDateKeys.has(item));

  if (uniqueWeekdays.length === 0 || uniqueTimes.length === 0) {
    throw new AppError('Debes enviar al menos un dia y un horario valido.', 400);
  }

  updateChefAvailabilityById({
    chefId,
    weekdaysJson: JSON.stringify(uniqueWeekdays),
    timesJson: JSON.stringify(uniqueTimes),
    blockedDatesJson: JSON.stringify(cleanBlockedDates),
    specialDatesJson: JSON.stringify(specialDates)
  });

  return getChefById(chefId);
}
