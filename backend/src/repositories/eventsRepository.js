import { db } from '../db.js';

export function listEvents({ city, chefId, status }) {
  let query = 'SELECT * FROM griller_events WHERE 1 = 1';
  const params = {};

  if (city) {
    query += ' AND LOWER(city) = LOWER(@city)';
    params.city = city;
  }

  if (chefId) {
    query += ' AND chef_id = @chefId';
    params.chefId = chefId;
  }

  if (status) {
    query += ' AND status = @status';
    params.status = status;
  }

  query += ' ORDER BY date_key ASC, time_label ASC, created_at DESC';

  return db.prepare(query).all(params);
}

export function listEventsByChefId(chefId) {
  return db
    .prepare('SELECT * FROM griller_events WHERE chef_id = ? ORDER BY created_at DESC')
    .all(chefId);
}

export function listAllEvents() {
  return db
    .prepare('SELECT * FROM griller_events ORDER BY created_at DESC')
    .all();
}

export function findEventById(eventId) {
  return db
    .prepare('SELECT * FROM griller_events WHERE id = ?')
    .get(eventId);
}

export function insertEvent(event) {
  db.prepare(`
    INSERT INTO griller_events (
      id, chef_id, chef_name, created_by_user_id, title, description, city, venue_name, address,
      date_key, time_label, capacity_total, seats_available, price_per_person,
      min_seats_per_reservation, max_seats_per_reservation, menu_json, status, created_at, updated_at
    ) VALUES (
      @id, @chefId, @chefName, @createdByUserId, @title, @description, @city, @venueName, @address,
      @dateKey, @timeLabel, @capacityTotal, @seatsAvailable, @pricePerPerson,
      @minSeatsPerReservation, @maxSeatsPerReservation, @menuJson, @status, @createdAt, @updatedAt
    )
  `).run(event);
}

export function updateEventStatusById({ eventId, status, updatedAt }) {
  db.prepare(`
    UPDATE griller_events
    SET status = @status, updated_at = @updatedAt
    WHERE id = @eventId
  `).run({
    eventId,
    status,
    updatedAt
  });
}

export function listReservationsByEventId(eventId) {
  return db
    .prepare('SELECT * FROM griller_event_reservations WHERE event_id = ? ORDER BY created_at DESC')
    .all(eventId);
}

export function reserveEventSeats({
  reservationId,
  eventId,
  userId,
  seats,
  amountTotal,
  paymentStatus,
  status,
  createdAt
}) {
  const transaction = db.transaction((payload) => {
    const eventRow = db
      .prepare('SELECT * FROM griller_events WHERE id = @eventId')
      .get({ eventId: payload.eventId });

    if (!eventRow) {
      return { error: 'EVENT_NOT_FOUND' };
    }

    if (String(eventRow.status ?? '') !== 'Publicado') {
      return { error: 'EVENT_NOT_OPEN', eventRow };
    }

    if (Number(eventRow.seats_available ?? 0) < payload.seats) {
      return { error: 'NOT_ENOUGH_SEATS', eventRow };
    }

    db.prepare(`
      UPDATE griller_events
      SET seats_available = seats_available - @seats,
          updated_at = @updatedAt
      WHERE id = @eventId
    `).run({
      eventId: payload.eventId,
      seats: payload.seats,
      updatedAt: payload.createdAt
    });

    db.prepare(`
      INSERT INTO griller_event_reservations (
        id, event_id, user_id, seats, amount_total, payment_status, status, created_at
      ) VALUES (
        @reservationId, @eventId, @userId, @seats, @amountTotal, @paymentStatus, @status, @createdAt
      )
    `).run({
      reservationId: payload.reservationId,
      eventId: payload.eventId,
      userId: payload.userId,
      seats: payload.seats,
      amountTotal: payload.amountTotal,
      paymentStatus: payload.paymentStatus,
      status: payload.status,
      createdAt: payload.createdAt
    });

    const updatedEventRow = db
      .prepare('SELECT * FROM griller_events WHERE id = @eventId')
      .get({ eventId: payload.eventId });
    const reservationRow = db
      .prepare('SELECT * FROM griller_event_reservations WHERE id = @reservationId')
      .get({ reservationId: payload.reservationId });

    return {
      eventRow: updatedEventRow,
      reservationRow
    };
  });

  return transaction({
    reservationId,
    eventId,
    userId,
    seats,
    amountTotal,
    paymentStatus,
    status,
    createdAt
  });
}
