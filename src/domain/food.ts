import { FOOD_KCAL_CONSISTENCY_TOLERANCE, KCAL_PER_G } from '../config';

export interface NutritionPer100g {
  kcal100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
}

export interface Nutrition {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function macroKcal(proteinG: number, carbsG: number, fatG: number): number {
  return (
    proteinG * KCAL_PER_G.protein +
    carbsG * KCAL_PER_G.carbs +
    fatG * KCAL_PER_G.fat
  );
}

/** Relative difference between stated kcal and macro-derived kcal. Null if macros are empty. */
export function calorieConsistencyGap(
  kcal: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
): number | null {
  const derived = macroKcal(proteinG, carbsG, fatG);
  if (derived <= 0) return null;
  return Math.abs(kcal - derived) / derived;
}

export function isCalorieConsistent(
  kcal: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
): boolean {
  const gap = calorieConsistencyGap(kcal, proteinG, carbsG, fatG);
  return gap === null || gap <= FOOD_KCAL_CONSISTENCY_TOLERANCE;
}

export function scaleNutrition(per100g: NutritionPer100g, grams: number): Nutrition {
  const factor = grams / 100;
  return {
    kcal: per100g.kcal100g * factor,
    proteinG: per100g.protein100g * factor,
    carbsG: per100g.carbs100g * factor,
    fatG: per100g.fat100g * factor,
  };
}

export function addNutrition(a: Nutrition, b: Nutrition): Nutrition {
  return {
    kcal: a.kcal + b.kcal,
    proteinG: a.proteinG + b.proteinG,
    carbsG: a.carbsG + b.carbsG,
    fatG: a.fatG + b.fatG,
  };
}

export const EMPTY_NUTRITION: Nutrition = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

/** Builds a recipe food: total values divided back to a per-100g basis. */
export function recipeToPer100g(
  items: readonly { per100g: NutritionPer100g; grams: number }[],
): { per100g: NutritionPer100g; totalGrams: number; total: Nutrition } {
  let totalGrams = 0;
  let total = EMPTY_NUTRITION;
  for (const item of items) {
    totalGrams += item.grams;
    total = addNutrition(total, scaleNutrition(item.per100g, item.grams));
  }
  if (totalGrams <= 0) {
    return { per100g: { kcal100g: 0, protein100g: 0, carbs100g: 0, fat100g: 0 }, totalGrams: 0, total };
  }
  const factor = 100 / totalGrams;
  return {
    per100g: {
      kcal100g: total.kcal * factor,
      protein100g: total.proteinG * factor,
      carbs100g: total.carbsG * factor,
      fat100g: total.fatG * factor,
    },
    totalGrams,
    total,
  };
}
