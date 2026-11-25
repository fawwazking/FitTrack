import { SEED_EXERCISES } from '../src/data/exercises';
import { SEED_FOODS } from '../src/data/foods';

describe('seed data integrity', () => {
  it('ships a usable starter food set', () => {
    expect(SEED_FOODS.length).toBeGreaterThanOrEqual(150);
    const names = new Set(SEED_FOODS.map((food) => food.name.trim().toLowerCase()));
    expect(names.size).toBe(SEED_FOODS.length);
    for (const food of SEED_FOODS) {
      expect(food.name.trim().length).toBeGreaterThan(0);
      for (const value of [food.kcal100g, food.protein100g, food.carbs100g, food.fat100g]) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }
      expect(food.servingGrams).toBeGreaterThan(0);
    }
  });

  it('ships exercises with sane rep ranges and increments', () => {
    expect(SEED_EXERCISES.length).toBeGreaterThanOrEqual(60);
    const names = new Set(SEED_EXERCISES.map((exercise) => exercise.name.trim().toLowerCase()));
    expect(names.size).toBe(SEED_EXERCISES.length);
    for (const exercise of SEED_EXERCISES) {
      expect(exercise.name.trim().length).toBeGreaterThan(0);
      expect(exercise.repMin).toBeGreaterThan(0);
      expect(exercise.repMax).toBeGreaterThanOrEqual(exercise.repMin);
      expect(exercise.incrementKg).toBeGreaterThanOrEqual(0);
    }
  });
});
