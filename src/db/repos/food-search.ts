import { SEED_FOODS, type SeedFood } from '../../data/foods';

export interface WebFoodSearchResult {
  id: string;
  name: string;
  category: string;
  kcal100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
  isCustom: 0;
  source: 'builtin';
}

const normalize = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9\u00c0-\u024f\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Pre-build normalized search index
const SEARCH_INDEX: { food: SeedFood; norm: string }[] = SEED_FOODS.map((food) => ({
  food,
  norm: normalize(food.name),
}));

/**
 * Search seed foods by name (case-insensitive, partial match).
 * Used as fallback when DB is unavailable (web mode).
 */
export function webSearchFoods(query: string, mode: 'frequent' | 'recent' | 'all' | 'custom' = 'all', limit = 40): WebFoodSearchResult[] {
  const normalized = normalize(query);

  // For 'frequent'/'recent' with no query: return popular staples
  if (!normalized && (mode === 'frequent' || mode === 'recent')) {
    const popular = ['nasi', 'ayam', 'tempe', 'telur', 'sapi', 'ikan', 'telur', 'susu', 'roti', 'pasta'];
    const results: WebFoodSearchResult[] = [];
    for (const keyword of popular) {
      const matches = SEARCH_INDEX.filter((entry) => entry.norm.includes(keyword) && !results.find((r) => r.name === entry.food.name));
      for (const match of matches.slice(0, 2)) {
        results.push(toWebResult(match.food));
        if (results.length >= limit) break;
      }
      if (results.length >= limit) break;
    }
    return results.slice(0, limit);
  }

  if (!normalized) {
    // 'all' with no query: return first N foods
    return SEARCH_INDEX.slice(0, limit).map((entry) => toWebResult(entry.food));
  }

  // Filter by partial match
  const results = SEARCH_INDEX
    .filter((entry) => entry.norm.includes(normalized))
    .slice(0, limit)
    .map((entry) => toWebResult(entry.food));

  return results;
}

function toWebResult(food: SeedFood): WebFoodSearchResult {
  // Deterministic ID from name
  const id = `web-${normalize(food.name)}`;
  return {
    id,
    name: food.name,
    category: food.category,
    kcal100g: food.kcal100g,
    protein100g: food.protein100g,
    carbs100g: food.carbs100g,
    fat100g: food.fat100g,
    isCustom: 0,
    source: 'builtin',
  };
}
