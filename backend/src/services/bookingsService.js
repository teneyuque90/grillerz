import { mapBookingRow, mapChefRow, nextBookingId } from '../db.js';
import { AppError } from '../lib/AppError.js';
import { insertBooking, listBookingsByUserId, findBookingById, listBookingsByChefId, updateBookingStatusById, listAllBookings } from '../repositories/bookingsRepository.js';
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

function getRole(authUser) {
  return String(authUser?.role ?? 'client');
}

function getManagedChefId(authUser) {
  return String(authUser?.managed_chef_id ?? '');
}

export function getBookingsForGriller({ authUser, requestedChefId }) {
  const role = getRole(authUser);
  if (role !== 'griller' && role !== 'admin') {
    throw new AppError('Solo cuentas Griller o Admin pueden ver solicitudes de grillers.', 403);
  }

  if (role === 'admin') {
    if (requestedChefId) {
      return listBookingsByChefId(requestedChefId).map(mapBookingRow);
    }
    return listAllBookings().map(mapBookingRow);
  }

  const managedChefId = getManagedChefId(authUser);
  if (!managedChefId) {
    throw new AppError('Tu cuenta Griller no tiene perfil asignado.', 403);
  }

  return listBookingsByChefId(managedChefId).map(mapBookingRow);
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
    status: 'Pendiente',
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

export function updateBookingStatusForGriller({
  authUser,
  bookingId,
  status
}) {
  const role = getRole(authUser);
  if (role !== 'griller' && role !== 'admin') {
    throw new AppError('Solo cuentas Griller o Admin pueden actualizar solicitudes.', 403);
  }

  const normalizedStatus = String(status ?? '').trim();
  const allowedStatuses = new Set(['Confirmada', 'Cancelada']);
  if (!allowedStatuses.has(normalizedStatus)) {
    throw new AppError('Status invalido. Usa Confirmada o Cancelada.', 400);
  }

  const row = findBookingById(bookingId);
  if (!row) {
    throw new AppError('Reserva no encontrada.', 404);
  }

  if (role === 'griller') {
    const managedChefId = getManagedChefId(authUser);
    if (!managedChefId || row.chef_id !== managedChefId) {
      throw new AppError('No puedes modificar reservas de otro griller.', 403);
    }
  }

  updateBookingStatusById({
    bookingId,
    status: normalizedStatus
  });

  const updatedRow = findBookingById(bookingId);
  return mapBookingRow(updatedRow);
}
