import { MEAL_TYPES, REMINDER_DEFAULTS } from '../config';
import { SEED_EXERCISES } from '../data/exercises';
import { SEED_FOODS } from '../data/foods';
import { countRows, getSqlite, newId, normalizeSearch, nowISO } from './db';

export const SEED_VERSION = '1';

const ALL_DAYS = JSON.stringify([0, 1, 2, 3, 4, 5, 6]);

export function seedDatabase(): void {
  const db = getSqlite();
  const now = nowISO();

  db.runSync(
    `INSERT OR IGNORE INTO app_settings
      (id, created_at, updated_at, theme, language, week_start_day, notifications_enabled)
     VALUES ('app', ?, ?, 'system', 'id', 1, 0)`,
    [now, now],
  );

  if (countRows('food') === 0) {
    db.withTransactionSync(() => {
      for (const item of SEED_FOODS) {
        const foodId = newId();
        db.runSync(
          `INSERT INTO food
            (id, created_at, updated_at, name, brand, source, category, kcal_100g, protein_100g,
             carbs_100g, fat_100g, is_custom, verified, search_text)
           VALUES (?, ?, ?, ?, ?, 'builtin', ?, ?, ?, ?, ?, 0, 0, ?)`,
          [
            foodId,
            now,
            now,
            item.name,
            item.brand ?? null,
            item.category,
            item.kcal100g,
            item.protein100g,
            item.carbs100g,
            item.fat100g,
            normalizeSearch(`${item.name} ${item.brand ?? ''} ${item.category}`),
          ],
        );
        db.runSync(
          `INSERT INTO food_serving (id, created_at, updated_at, food_id, label, grams, is_default)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [newId(), now, now, foodId, item.servingLabel, item.servingGrams],
        );
      }
    });
  }

  if (countRows('exercise') === 0) {
    db.withTransactionSync(() => {
      for (const item of SEED_EXERCISES) {
        db.runSync(
          `INSERT INTO exercise
            (id, created_at, updated_at, name, name_en, muscle_group, equipment, default_rep_min,
             default_rep_max, increment_kg, is_custom, is_compound, search_text)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
          [
            newId(),
            now,
            now,
            item.name,
            item.nameEn,
            item.muscleGroup,
            item.equipment,
            item.repMin,
            item.repMax,
            item.incrementKg,
            item.isCompound ? 1 : 0,
            normalizeSearch(`${item.name} ${item.nameEn} ${item.muscleGroup} ${item.equipment}`),
          ],
        );
      }
    });
  }

  if (countRows('reminder') === 0) {
    db.withTransactionSync(() => {
      for (const mealType of MEAL_TYPES) {
        db.runSync(
          `INSERT INTO reminder (id, created_at, updated_at, type, time, days_of_week, meal_type, enabled)
           VALUES (?, ?, ?, 'meal', ?, ?, ?, 0)`,
          [newId(), now, now, REMINDER_DEFAULTS[mealType], ALL_DAYS, mealType],
        );
      }
      db.runSync(
        `INSERT INTO reminder (id, created_at, updated_at, type, time, days_of_week, enabled)
         VALUES (?, ?, ?, 'workout', ?, ?, 0)`,
        [newId(), now, now, REMINDER_DEFAULTS.workout, JSON.stringify([0, 2, 4])],
      );
      db.runSync(
        `INSERT INTO reminder (id, created_at, updated_at, type, time, days_of_week, enabled)
         VALUES (?, ?, ?, 'weigh_in', ?, ?, 0)`,
        [newId(), now, now, REMINDER_DEFAULTS.weighIn, JSON.stringify([0])],
      );
    });
  }

  db.runSync(`INSERT INTO meta (key, value) VALUES ('food_seed_version', ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [SEED_VERSION]);
}
