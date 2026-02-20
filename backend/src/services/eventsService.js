import { randomUUID } from 'node:crypto';

import { mapGrillerEventReservationRow, mapGrillerEventRow } from '../db.js';
import { AppError } from '../lib/AppError.js';
import { findChefById } from '../repositories/chefsRepository.js';
import {
  findEventById,
  insertEvent,
  listAllEvents,
  listEvents,
  listEventsByChefId,
  listReservationsByEventId,
  reserveEventSeats,
  updateEventStatusById
} from '../repositories/eventsRepository.js';

const eventStatuses = new Set(['Publicado', 'Cerrado', 'Cancelado', 'Finalizado']);
const paymentStatuses = new Set(['Pagado', 'Pendiente']);

function getRole(authUser) {
  return String(authUser?.role ?? 'client');
}

function getManagedChefId(authUser) {
  return String(authUser?.managed_chef_id ?? '');
}

function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return false;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day;
}

function normalizeMenu(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  return [];
}

function normalizeStatus(value, fallbackValue = 'Publicado') {
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (eventStatuses.has(candidate)) {
    return candidate;
  }

  return fallbackValue;
}

function canManageChefEvents(authUser, chefId) {
  const role = getRole(authUser);
  if (role === 'admin') {
    return true;
  }

  if (role === 'griller') {
    return getManagedChefId(authUser) === chefId;
  }

  return false;
}

function normalizeInteger(value, fallbackValue) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.round(numeric);
  }

  return fallbackValue;
}

function ensureEventExists(eventId) {
  const eventRow = findEventById(eventId);
  if (!eventRow) {
    throw new AppError('Evento no encontrado.', 404);
  }

  return eventRow;
}

export function getPublishedEvents({ city, chefId, status }) {
  const normalizedCity = typeof city === 'string' && city.trim() ? city.trim() : null;
  const normalizedChefId = typeof chefId === 'string' && chefId.trim() ? chefId.trim() : null;
  const normalizedStatus = normalizeStatus(status, 'Publicado');
  const rows = listEvents({
    city: normalizedCity,
    chefId: normalizedChefId,
    status: normalizedStatus
  });

  return rows.map(mapGrillerEventRow);
}

export function getEventsForGriller({ authUser, requestedChefId }) {
  const role = getRole(authUser);
  if (role !== 'griller' && role !== 'admin') {
    throw new AppError('Solo cuentas Griller o Admin pueden gestionar eventos.', 403);
  }

  if (role === 'admin') {
    if (requestedChefId) {
      return listEventsByChefId(requestedChefId).map(mapGrillerEventRow);
    }
    return listAllEvents().map(mapGrillerEventRow);
  }

  const managedChefId = getManagedChefId(authUser);
  if (!managedChefId) {
    throw new AppError('Tu cuenta Griller no tiene perfil asignado.', 403);
  }

  return listEventsByChefId(managedChefId).map(mapGrillerEventRow);
}

export function getEventById(eventId) {
  const row = ensureEventExists(eventId);
  return mapGrillerEventRow(row);
}

export function createEventForGriller({ authUser, payload }) {
  const role = getRole(authUser);
  if (role !== 'griller' && role !== 'admin') {
    throw new AppError('Solo cuentas Griller o Admin pueden crear eventos.', 403);
  }

  const requestedChefId = typeof payload?.chefId === 'string' ? payload.chefId.trim() : '';
  const managedChefId = role === 'griller' ? getManagedChefId(authUser) : requestedChefId;
  const chefId = managedChefId || requestedChefId;

  if (!chefId) {
    throw new AppError('No se encontro chef para publicar el evento.', 400);
  }

  if (!canManageChefEvents(authUser, chefId)) {
    throw new AppError('No puedes crear eventos para otro griller.', 403);
  }

  const chefRow = findChefById(chefId);
  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
  const description = typeof payload?.description === 'string' ? payload.description.trim() : '';
  const venueName = typeof payload?.venueName === 'string' ? payload.venueName.trim() : '';
  const address = typeof payload?.address === 'string' ? payload.address.trim() : '';
  const dateKey = typeof payload?.dateKey === 'string' ? payload.dateKey.trim() : '';
  const timeLabel = typeof payload?.timeLabel === 'string' ? payload.timeLabel.trim() : '';
  const city = typeof payload?.city === 'string' && payload.city.trim() ? payload.city.trim() : chefRow.city;

  if (!title || !venueName || !address || !dateKey || !timeLabel) {
    throw new AppError('Completa titulo, lugar, direccion, fecha y hora del evento.', 400);
  }

  if (!isValidDateKey(dateKey)) {
    throw new AppError('La fecha del evento debe estar en formato YYYY-MM-DD.', 400);
  }

  const capacityTotal = Math.max(2, normalizeInteger(payload?.capacityTotal, 12));
  const pricePerPerson = Math.max(100, normalizeInteger(payload?.pricePerPerson, 600));
  const minSeatsPerReservation = Math.max(1, normalizeInteger(payload?.minSeatsPerReservation, 1));
  const maxSeatsPerReservation = Math.max(minSeatsPerReservation, normalizeInteger(payload?.maxSeatsPerReservation, 6));
  const menu = normalizeMenu(payload?.menu);
  const status = normalizeStatus(payload?.status, 'Publicado');
  const now = new Date().toISOString();

  if (maxSeatsPerReservation > capacityTotal) {
    throw new AppError('El maximo de lugares por reserva no puede exceder la capacidad.', 400);
  }

  if (menu.length === 0) {
    throw new AppError('Agrega al menos un platillo o corte al menu del evento.', 400);
  }

  const event = {
    id: randomUUID(),
    chefId,
    chefName: chefRow.name,
    createdByUserId: String(authUser.id),
    title,
    description: description || 'Evento especial del griller',
    city,
    venueName,
    address,
    dateKey,
    timeLabel,
    capacityTotal,
    seatsAvailable: capacityTotal,
    pricePerPerson,
    minSeatsPerReservation,
    maxSeatsPerReservation,
    menuJson: JSON.stringify(menu),
    status,
    createdAt: now,
    updatedAt: now
  };

  insertEvent(event);
  return getEventById(event.id);
}

export function reserveSeatsInEvent({ authUser, eventId, payload }) {
  ensureEventExists(eventId);

  const seats = Math.max(1, normalizeInteger(payload?.seats, 1));
  const paymentStatus = paymentStatuses.has(String(payload?.paymentStatus ?? '').trim())
    ? String(payload.paymentStatus).trim()
    : 'Pagado';

  const event = getEventById(eventId);
  if (event.status !== 'Publicado') {
    throw new AppError('Este evento no esta disponible para nuevas reservas.', 400);
  }

  if (seats < event.minSeatsPerReservation || seats > event.maxSeatsPerReservation) {
    throw new AppError(`Puedes reservar entre ${event.minSeatsPerReservation} y ${event.maxSeatsPerReservation} lugares.`, 400);
  }

  if (seats > event.seatsAvailable) {
    throw new AppError('No hay suficientes lugares disponibles.', 400);
  }

  const reservationId = randomUUID();
  const amountTotal = seats * event.pricePerPerson;
  const createdAt = new Date().toISOString();

  const result = reserveEventSeats({
    reservationId,
    eventId,
    userId: String(authUser.id),
    seats,
    amountTotal,
    paymentStatus,
    status: 'Confirmada',
    createdAt
  });

  if (result?.error === 'EVENT_NOT_FOUND') {
    throw new AppError('Evento no encontrado.', 404);
  }

  if (result?.error === 'EVENT_NOT_OPEN') {
    throw new AppError('Este evento ya no acepta reservas.', 400);
  }

  if (result?.error === 'NOT_ENOUGH_SEATS') {
    throw new AppError('No hay suficientes lugares disponibles.', 400);
  }

  return {
    event: mapGrillerEventRow(result.eventRow),
    reservation: mapGrillerEventReservationRow(result.reservationRow)
  };
}

export function getEventReservationsForGriller({ authUser, eventId }) {
  const role = getRole(authUser);
  if (role !== 'griller' && role !== 'admin') {
    throw new AppError('Solo cuentas Griller o Admin pueden ver reservas del evento.', 403);
  }

  const eventRow = ensureEventExists(eventId);

  if (role === 'griller') {
    const managedChefId = getManagedChefId(authUser);
    if (!managedChefId || eventRow.chef_id !== managedChefId) {
      throw new AppError('No puedes ver reservas de eventos de otro griller.', 403);
    }
  }

  const rows = listReservationsByEventId(eventId);
  return rows.map(mapGrillerEventReservationRow);
}

export function updateEventStatus({ authUser, eventId, status }) {
  const normalizedStatus = normalizeStatus(status, '');
  if (!eventStatuses.has(normalizedStatus)) {
    throw new AppError('Status invalido para evento.', 400);
  }

  const eventRow = ensureEventExists(eventId);
  if (!canManageChefEvents(authUser, eventRow.chef_id)) {
    throw new AppError('No tienes permisos para actualizar este evento.', 403);
  }

  updateEventStatusById({
    eventId,
    status: normalizedStatus,
    updatedAt: new Date().toISOString()
  });

  return getEventById(eventId);
}
