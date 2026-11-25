import { and, asc, desc, eq, inArray, isNull, like } from 'drizzle-orm';
import type { MealType } from '../../config';
import { addDaysISO, todayISO } from '../../domain/dates';
import {
  recipeToPer100g,
  scaleNutrition,
  type Nutrition,
  type NutritionPer100g,
} from '../../domain/food';
import { getDb, getSqlite, isWeb, newId, nowISO, normalizeSearch } from '../db';
import {
  food,
  foodServing,
  mealEntry,
  recipeItem,
  type FoodRow,
  type FoodServingRow,
  type MealEntryRow,
} from '../schema';

export interface FoodWithServings {
  food: FoodRow;
  servings: FoodServingRow[];
}

export interface DayTotals extends Nutrition {
  entryCount: number;
}

export interface MealGroup {
  mealType: MealType;
  entries: MealEntryRow[];
  totals: DayTotals;
}

export interface CustomFoodInput {
  name: string;
  brand?: string;
  category?: string;
  servingLabel?: string;
  servingGrams: number;
  kcal100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
}

export interface RecipeInput {
  name: string;
  category?: string;
  items: { foodId: string; grams: number }[];
}

export function searchFoods(
  query: string,
  mode: 'frequent' | 'recent' | 'all' | 'custom' = 'all',
  limit = 40,
): FoodRow[] {
  if (isWeb) return [];
  const db = getDb();
  const normalized = normalizeSearch(query);

  if (!normalized && (mode === 'frequent' || mode === 'recent')) {
    const order = mode === 'frequent' ? 'n DESC, last_used DESC' : 'last_used DESC';
    const ids = getSqlite().getAllSync<{ food_id: string }>(
      `SELECT m.food_id, COUNT(*) AS n, MAX(m.created_at) AS last_used
       FROM meal_entry m
       JOIN food f ON f.id = m.food_id AND f.deleted_at IS NULL
       WHERE m.deleted_at IS NULL
       GROUP BY m.food_id
       ORDER BY ${order}
       LIMIT ?`,
      [limit],
    );
    if (ids.length === 0) return [];
    const rows = db
      .select()
      .from(food)
      .where(and(inArray(food.id, ids.map((row) => row.food_id)), isNull(food.deletedAt)))
      .all();
    const byId = new Map(rows.map((row) => [row.id, row]));
    return ids.map((row) => byId.get(row.food_id)).filter((row): row is FoodRow => Boolean(row));
  }

  const filters = [isNull(food.deletedAt)];
  if (mode === 'custom') filters.push(eq(food.isCustom, 1));
  if (normalized) filters.push(like(food.searchText, `%${normalized}%`));

  return db
    .select()
    .from(food)
    .where(and(...filters))
    .orderBy(desc(food.isCustom), asc(food.name))
    .limit(limit)
    .all();
}

export function getFood(id: string): FoodRow | null {
  if (isWeb) return null;
  return (
    getDb()
      .select()
      .from(food)
      .where(and(eq(food.id, id), isNull(food.deletedAt)))
      .get() ?? null
  );
}

export function getServings(foodId: string): FoodServingRow[] {
  if (isWeb) return [];
  return getDb()
    .select()
    .from(foodServing)
    .where(and(eq(foodServing.foodId, foodId), isNull(foodServing.deletedAt)))
    .orderBy(desc(foodServing.isDefault))
    .all();
}

export function getFoodWithServings(id: string): FoodWithServings | null {
  const row = getFood(id);
  if (!row) return null;
  return { food: row, servings: getServings(id) };
}

function insertServing(foodId: string, label: string, grams: number): void {
  const now = nowISO();
  getDb()
    .insert(foodServing)
    .values({
      id: newId(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      foodId,
      label,
      grams,
      isDefault: 1,
    })
    .run();
}

export function createCustomFood(input: CustomFoodInput): string {
  if (isWeb) return 'web-food';
  const db = getDb();
  const now = nowISO();
  const id = newId();
  db.insert(food)
    .values({
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      name: input.name.trim(),
      brand: input.brand?.trim() || null,
      source: 'user',
      category: input.category?.trim() || 'Custom',
      kcal100g: input.kcal100g,
      protein100g: input.protein100g,
      carbs100g: input.carbs100g,
      fat100g: input.fat100g,
      isCustom: 1,
      verified: 0,
      searchText: normalizeSearch(`${input.name} ${input.brand ?? ''} ${input.category ?? ''} Saya`),
    })
    .run();
  insertServing(id, input.servingLabel?.trim() || '1 porsi', input.servingGrams);
  return id;
}

export function createRecipeFood(input: RecipeInput): string | null {
  const items = input.items
    .map((item) => ({ food: getFood(item.foodId), grams: item.grams }))
    .filter((item): item is { food: FoodRow; grams: number } => item.food !== null && item.grams > 0);
  if (items.length === 0) return null;

  const combined = recipeToPer100g(
    items.map((item) => ({
      per100g: {
        kcal100g: item.food.kcal100g,
        protein100g: item.food.protein100g,
        carbs100g: item.food.carbs100g,
        fat100g: item.food.fat100g,
      },
      grams: item.grams,
    })),
  );

  const db = getDb();
  const now = nowISO();
  const id = newId();
  getSqlite().withTransactionSync(() => {
    db.insert(food)
      .values({
        id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        name: input.name.trim(),
        brand: null,
        source: 'user',
        category: input.category?.trim() || 'Resep',
        kcal100g: combined.per100g.kcal100g,
        protein100g: combined.per100g.protein100g,
        carbs100g: combined.per100g.carbs100g,
        fat100g: combined.per100g.fat100g,
        isCustom: 1,
        verified: 0,
        searchText: normalizeSearch(`${input.name} resep Saya`),
      })
      .run();
    for (const item of items) {
      db.insert(recipeItem)
        .values({
          id: newId(),
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          recipeFoodId: id,
          ingredientFoodId: item.food.id,
          grams: item.grams,
        })
        .run();
    }
    insertServing(id, '100 g', 100);
  });
  return id;
}

export function addMealEntry(input: {
  date: string;
  mealType: MealType;
  foodId: string;
  grams: number;
  quantity?: number;
  servingId?: string | null;
}): MealEntryRow | null {
  if (isWeb) return null;
  const row = getFood(input.foodId);
  if (!row) return null;
  const per100g: NutritionPer100g = {
    kcal100g: row.kcal100g,
    protein100g: row.protein100g,
    carbs100g: row.carbs100g,
    fat100g: row.fat100g,
  };
  const nutrition = scaleNutrition(per100g, input.grams);
  const now = nowISO();
  const entry: MealEntryRow = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    date: input.date,
    mealType: input.mealType,
    foodId: row.id,
    servingId: input.servingId ?? null,
    quantity: input.quantity ?? 1,
    grams: input.grams,
    nameSnapshot: row.name,
    kcal: nutrition.kcal,
    proteinG: nutrition.proteinG,
    carbsG: nutrition.carbsG,
    fatG: nutrition.fatG,
  };
  getDb().insert(mealEntry).values(entry).run();
  return entry;
}

export function listMealEntries(date: string): MealEntryRow[] {
  if (isWeb) return [];
  return getDb()
    .select()
    .from(mealEntry)
    .where(and(eq(mealEntry.date, date), isNull(mealEntry.deletedAt)))
    .orderBy(asc(mealEntry.createdAt))
    .all();
}

export function groupMeals(date: string): MealGroup[] {
  const entries = listMealEntries(date);
  const types: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  return types.map((mealType) => {
    const group = entries.filter((entry) => entry.mealType === mealType);
    return {
      mealType,
      entries: group,
      totals: sumEntries(group),
    };
  });
}

export function sumEntries(entries: readonly MealEntryRow[]): DayTotals {
  return entries.reduce<DayTotals>(
    (total, entry) => ({
      kcal: total.kcal + entry.kcal,
      proteinG: total.proteinG + entry.proteinG,
      carbsG: total.carbsG + entry.carbsG,
      fatG: total.fatG + entry.fatG,
      entryCount: total.entryCount + 1,
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, entryCount: 0 },
  );
}

export function getDayTotals(date: string): DayTotals {
  return sumEntries(listMealEntries(date));
}

export function getRangeDayTotals(startDate: string, endDate: string): { date: string; totals: DayTotals }[] {
  if (isWeb) return [];
  const rows = getSqlite().getAllSync<{
    date: string;
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    entry_count: number;
  }>(
    `SELECT date,
            COALESCE(SUM(kcal), 0) AS kcal,
            COALESCE(SUM(protein_g), 0) AS protein_g,
            COALESCE(SUM(carbs_g), 0) AS carbs_g,
            COALESCE(SUM(fat_g), 0) AS fat_g,
            COUNT(*) AS entry_count
     FROM meal_entry
     WHERE deleted_at IS NULL AND date >= ? AND date <= ?
     GROUP BY date
     ORDER BY date ASC`,
    [startDate, endDate],
  );
  return rows.map((row) => ({
    date: row.date,
    totals: {
      kcal: row.kcal,
      proteinG: row.protein_g,
      carbsG: row.carbs_g,
      fatG: row.fat_g,
      entryCount: row.entry_count,
    },
  }));
}

export function deleteMealEntry(id: string): void {
  const now = nowISO();
  getDb().update(mealEntry).set({ deletedAt: now, updatedAt: now }).where(eq(mealEntry.id, id)).run();
}

export function copyDay(fromDate: string, toDate: string, mealType?: MealType): number {
  const entries = listMealEntries(fromDate).filter(
    (entry) => !mealType || entry.mealType === mealType,
  );
  if (entries.length === 0) return 0;
  const now = nowISO();
  getSqlite().withTransactionSync(() => {
    for (const entry of entries) {
      getDb()
        .insert(mealEntry)
        .values({
          ...entry,
          id: newId(),
          date: toDate,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })
        .run();
    }
  });
  return entries.length;
}

export function recentFoods(days = 30, limit = 20): FoodRow[] {
  if (isWeb) return [];
  const since = addDaysISO(todayISO(), -days);
  const ids = getSqlite().getAllSync<{ food_id: string }>(
    `SELECT m.food_id, MAX(m.created_at) AS last_used
     FROM meal_entry m JOIN food f ON f.id = m.food_id AND f.deleted_at IS NULL
     WHERE m.deleted_at IS NULL AND m.date >= ?
     GROUP BY m.food_id ORDER BY last_used DESC LIMIT ?`,
    [since, limit],
  );
  if (ids.length === 0) return [];
  const rows = getDb()
    .select()
    .from(food)
    .where(and(inArray(food.id, ids.map((row) => row.food_id)), isNull(food.deletedAt)))
    .all();
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((row) => byId.get(row.food_id)).filter((row): row is FoodRow => Boolean(row));
}

export function archiveFood(id: string): void {
  const now = nowISO();
  getDb().update(food).set({ deletedAt: now, updatedAt: now }).where(eq(food.id, id)).run();
}
