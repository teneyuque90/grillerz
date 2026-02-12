import { db } from '../db.js';

export function listBookingsByUserId(userId) {
  return db
    .prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId);
}

export function findBookingById(bookingId) {
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
}

export function insertBooking(booking) {
  db.prepare(`
    INSERT INTO bookings (
      id, user_id, chef_id, chef_name, status, date_label, time_label, mode, address,
      package_name, guests, duration_hours, service_fee, transfer_fee, total, payment_method, created_at
    ) VALUES (
      @id, @userId, @chefId, @chefName, @status, @dateLabel, @timeLabel, @mode, @address,
      @packageName, @guests, @durationHours, @serviceFee, @transferFee, @total, @paymentMethod, @createdAt
    )
  `).run(booking);
}
