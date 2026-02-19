import { db } from '../db.js';

export function listChefs() {
  return db
    .prepare('SELECT * FROM chefs ORDER BY rating DESC, reviews DESC, name ASC')
    .all();
}

export function findChefById(chefId) {
  return db.prepare('SELECT * FROM chefs WHERE id = ?').get(chefId);
}

export function updateChefProfileById({
  chefId,
  name,
  title,
  city,
  basePrice,
  specialtiesJson,
  bio,
  avatarUrl,
  coverUrl,
  galleryJson
}) {
  db.prepare(`
    UPDATE chefs
    SET name = @name,
        title = @title,
        city = @city,
        base_price = @basePrice,
        specialties_json = @specialtiesJson,
        bio = @bio,
        avatar_url = @avatarUrl,
        cover_url = @coverUrl,
        gallery_json = @galleryJson
    WHERE id = @chefId
  `).run({
    chefId,
    name,
    title,
    city,
    basePrice,
    specialtiesJson,
    bio,
    avatarUrl,
    coverUrl,
    galleryJson
  });
}

export function updateChefAvailabilityById({
  chefId,
  weekdaysJson,
  timesJson,
  blockedDatesJson,
  specialDatesJson
}) {
  db.prepare(`
    UPDATE chefs
    SET availability_weekdays_json = @weekdaysJson,
        availability_times_json = @timesJson,
        availability_blocked_dates_json = @blockedDatesJson,
        availability_special_dates_json = @specialDatesJson
    WHERE id = @chefId
  `).run({
    chefId,
    weekdaysJson,
    timesJson,
    blockedDatesJson,
    specialDatesJson
  });
}
