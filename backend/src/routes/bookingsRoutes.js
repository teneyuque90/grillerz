import { Router } from 'express';

import { handleHttpError } from '../lib/http.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { createBookingForUser, getBookingForUser, getBookingsForGriller, getBookingsForUser, updateBookingStatusForGriller } from '../services/bookingsService.js';

export const bookingsRoutes = Router();

bookingsRoutes.use(requireAuth);

bookingsRoutes.get('/', (req, res) => {
  try {
    const bookings = getBookingsForUser({
      authUserId: req.auth.user.id,
      requestedUserId: req.query.userId ? String(req.query.userId) : null
    });

    res.json({ bookings });
  } catch (error) {
    handleHttpError(res, error);
  }
});

bookingsRoutes.get('/griller/me', (req, res) => {
  try {
    const bookings = getBookingsForGriller({
      authUser: req.auth.user,
      requestedChefId: req.query.chefId ? String(req.query.chefId) : null
    });
    res.json({ bookings });
  } catch (error) {
    handleHttpError(res, error);
  }
});

bookingsRoutes.get('/:bookingId', (req, res) => {
  try {
    const booking = getBookingForUser({
      authUserId: req.auth.user.id,
      bookingId: req.params.bookingId
    });

    res.json({ booking });
  } catch (error) {
    handleHttpError(res, error);
  }
});

bookingsRoutes.post('/', (req, res) => {
  try {
    const booking = createBookingForUser({
      authUserId: req.auth.user.id,
      payload: req.body ?? {}
    });

    res.status(201).json({ booking });
  } catch (error) {
    handleHttpError(res, error);
  }
});

bookingsRoutes.put('/:bookingId/status', (req, res) => {
  try {
    const booking = updateBookingStatusForGriller({
      authUser: req.auth.user,
      bookingId: req.params.bookingId,
      status: req.body?.status
    });

    res.json({ booking });
  } catch (error) {
    handleHttpError(res, error);
  }
});
