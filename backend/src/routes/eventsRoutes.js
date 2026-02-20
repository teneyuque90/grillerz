import { Router } from 'express';

import { handleHttpError } from '../lib/http.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  createEventForGriller,
  getEventById,
  getEventReservationsForGriller,
  getEventsForGriller,
  getPublishedEvents,
  reserveSeatsInEvent,
  updateEventStatus
} from '../services/eventsService.js';

export const eventsRoutes = Router();

eventsRoutes.use(requireAuth);

eventsRoutes.get('/', (req, res) => {
  try {
    const events = getPublishedEvents({
      city: req.query.city ? String(req.query.city) : null,
      chefId: req.query.chefId ? String(req.query.chefId) : null,
      status: req.query.status ? String(req.query.status) : null
    });
    res.json({ events });
  } catch (error) {
    handleHttpError(res, error);
  }
});

eventsRoutes.get('/chef/me', (req, res) => {
  try {
    const events = getEventsForGriller({
      authUser: req.auth.user,
      requestedChefId: req.query.chefId ? String(req.query.chefId) : null
    });
    res.json({ events });
  } catch (error) {
    handleHttpError(res, error);
  }
});

eventsRoutes.post('/', (req, res) => {
  try {
    const event = createEventForGriller({
      authUser: req.auth.user,
      payload: req.body ?? {}
    });
    res.status(201).json({ event });
  } catch (error) {
    handleHttpError(res, error);
  }
});

eventsRoutes.get('/:eventId', (req, res) => {
  try {
    const event = getEventById(req.params.eventId);
    res.json({ event });
  } catch (error) {
    handleHttpError(res, error);
  }
});

eventsRoutes.put('/:eventId/status', (req, res) => {
  try {
    const event = updateEventStatus({
      authUser: req.auth.user,
      eventId: req.params.eventId,
      status: req.body?.status
    });
    res.json({ event });
  } catch (error) {
    handleHttpError(res, error);
  }
});

eventsRoutes.post('/:eventId/reservations', (req, res) => {
  try {
    const result = reserveSeatsInEvent({
      authUser: req.auth.user,
      eventId: req.params.eventId,
      payload: req.body ?? {}
    });
    res.status(201).json(result);
  } catch (error) {
    handleHttpError(res, error);
  }
});

eventsRoutes.get('/:eventId/reservations', (req, res) => {
  try {
    const reservations = getEventReservationsForGriller({
      authUser: req.auth.user,
      eventId: req.params.eventId
    });
    res.json({ reservations });
  } catch (error) {
    handleHttpError(res, error);
  }
});
