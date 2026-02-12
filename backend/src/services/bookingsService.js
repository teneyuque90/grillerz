import { mapBookingRow, mapChefRow, nextBookingId } from '../db.js';
import { AppError } from '../lib/AppError.js';
import { insertBooking, listBookingsByUserId, findBookingById } from '../repositories/bookingsRepository.js';
import { findChefById } from '../repositories/chefsRepository.js';

function stringOrFallback(value, fallbackValue) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallbackValue;
}

function numberOrFallback(value, fallbackValue) {
  if (value === null || value === undefined || value === '') {
    return fallbackValue;
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  return fallbackValue;
}

export function getBookingsForUser({ authUserId, requestedUserId }) {
  const targetUserId = requestedUserId ?? authUserId;

  if (targetUserId !== authUserId) {
    throw new AppError('No puedes consultar reservas de otro usuario.', 403);
  }

  const rows = listBookingsByUserId(targetUserId);
  return rows.map(mapBookingRow);
}

export function getBookingForUser({ authUserId, bookingId }) {
  const row = findBookingById(bookingId);

  if (!row || row.user_id !== authUserId) {
    throw new AppError('Reserva no encontrada.', 404);
  }

  return mapBookingRow(row);
}

export function createBookingForUser({ authUserId, payload }) {
  if (!payload?.chefId || !payload?.dateLabel || !payload?.timeLabel) {
    throw new AppError('Faltan datos de reserva.', 400);
  }

  const chefRow = findChefById(payload.chefId);

  if (!chefRow) {
    throw new AppError('Chef no encontrado.', 404);
  }

  const chef = mapChefRow(chefRow);
  const serviceFee = numberOrFallback(payload.serviceFee, chef.basePrice);
  const transferFee = numberOrFallback(payload.transferFee, 300);
  const total = numberOrFallback(payload.total, serviceFee + transferFee);

  const booking = {
    id: nextBookingId(),
    userId: authUserId,
    chefId: payload.chefId,
    chefName: chef.name,
    status: stringOrFallback(payload.status, 'Confirmada'),
    dateLabel: String(payload.dateLabel),
    timeLabel: String(payload.timeLabel),
    mode: stringOrFallback(payload.mode, 'A domicilio'),
    address: stringOrFallback(payload.address, 'Sin direccion'),
    packageName: stringOrFallback(payload.packageName, 'Basico'),
    guests: numberOrFallback(payload.guests, 10),
    durationHours: numberOrFallback(payload.durationHours, 4),
    serviceFee,
    transferFee,
    total,
    paymentMethod: stringOrFallback(payload.paymentMethod, 'Tarjeta'),
    createdAt: new Date().toISOString()
  };

  insertBooking(booking);
  return booking;
}
