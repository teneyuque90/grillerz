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
  bio
}) {
  db.prepare(`
    UPDATE chefs
    SET name = @name,
        title = @title,
        city = @city,
        base_price = @basePrice,
        specialties_json = @specialtiesJson,
        bio = @bio
    WHERE id = @chefId
  `).run({
    chefId,
    name,
    title,
    city,
    basePrice,
    specialtiesJson,
    bio
  });
}

export function updateChefAvailabilityById({
  chefId,
  weekdaysJson,
  timesJson
}) {
  db.prepare(`
    UPDATE chefs
    SET availability_weekdays_json = @weekdaysJson,
        availability_times_json = @timesJson
    WHERE id = @chefId
  `).run({
    chefId,
    weekdaysJson,
    timesJson
  });
}
