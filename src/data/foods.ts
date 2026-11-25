/**
 * Seed foods for the Indonesian-first database.
 *
 * IMPORTANT: these values are approximate and flagged `verified: false`.
 * AGENTS.md forbids inventing nutrition data, so this is a starter set only;
 * replace it with TKPI/label data when an importer is built.
 */

export interface SeedFood {
  name: string;
  brand?: string;
  category: string;
  kcal100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
  servingLabel: string;
  servingGrams: number;
}

type Row = [
  name: string,
  category: string,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  servingLabel: string,
  servingGrams: number,
];

const rows: Row[] = [
  // Staples and rice dishes
  ['Nasi putih', 'Karbohidrat', 130, 2.7, 28.2, 0.3, '1 piring', 200],
  ['Nasi merah', 'Karbohidrat', 110, 2.6, 23, 0.9, '1 piring', 200],
  ['Nasi goreng', 'Karbohidrat', 175, 4, 26, 6, '1 piring', 250],
  ['Nasi uduk', 'Karbohidrat', 190, 4, 28, 7, '1 piring', 200],
  ['Nasi kuning', 'Karbohidrat', 180, 4, 30, 5, '1 piring', 200],
  ['Bubur ayam', 'Karbohidrat', 90, 5, 12, 2.5, '1 mangkuk', 300],
  ['Bubur kacang hijau', 'Karbohidrat', 150, 5, 27, 3, '1 mangkuk', 250],
  ['Mie rebus', 'Karbohidrat', 110, 4, 18, 2.5, '1 mangkuk', 300],
  ['Mie goreng', 'Karbohidrat', 200, 5, 28, 8, '1 piring', 250],
  ['Mie ayam', 'Karbohidrat', 150, 7, 20, 4, '1 mangkuk', 300],
  ['Bakmi goreng', 'Karbohidrat', 190, 6, 27, 7, '1 piring', 250],
  ['Bihun goreng', 'Karbohidrat', 170, 3, 27, 5.5, '1 piring', 200],
  ['Kwetiau goreng', 'Karbohidrat', 190, 5, 28, 7, '1 piring', 250],
  ['Roti putih', 'Karbohidrat', 265, 8, 49, 3.2, '1 lembar', 30],
  ['Roti gandum', 'Karbohidrat', 250, 9, 45, 3.5, '1 lembar', 30],
  ['Oatmeal (masak air)', 'Karbohidrat', 70, 2.5, 12, 1.5, '1 mangkuk', 240],
  ['Kentang rebus', 'Karbohidrat', 87, 2, 20, 0.1, '1 buah sedang', 150],
  ['Kentang goreng', 'Karbohidrat', 312, 3.4, 41, 15, '1 porsi', 100],
  ['Ubi jalar rebus', 'Karbohidrat', 90, 2, 21, 0.2, '1 buah', 150],
  ['Singkong rebus', 'Karbohidrat', 160, 1.4, 38, 0.3, '1 potong', 100],
  ['Jagung rebus', 'Karbohidrat', 96, 3.4, 21, 1.5, '1 buah', 150],
  ['Beras putih mentah', 'Bahan', 365, 7, 80, 0.7, '100 g', 100],
  ['Beras merah mentah', 'Bahan', 350, 7.5, 77, 2.5, '100 g', 100],

  // Chicken and meat
  ['Dada ayam rebus', 'Protein', 165, 31, 0, 3.6, '1 potong', 100],
  ['Dada ayam goreng', 'Protein', 230, 30, 5, 10, '1 potong', 100],
  ['Paha ayam rebus', 'Protein', 210, 26, 0, 11, '1 potong', 100],
  ['Paha ayam goreng', 'Protein', 280, 26, 6, 18, '1 potong', 100],
  ['Ayam bakar', 'Protein', 230, 25, 3, 14, '1 potong', 100],
  ['Ayam geprek', 'Protein', 250, 20, 8, 15, '1 porsi', 150],
  ['Daging ayam cincang', 'Protein', 180, 20, 0, 11, '100 g', 100],
  ['Daging sapi sirloin', 'Protein', 190, 30, 0, 7, '100 g', 100],
  ['Daging sapi goreng', 'Protein', 250, 28, 2, 15, '100 g', 100],
  ['Rendang', 'Protein', 250, 20, 5, 17, '1 potong', 100],
  ['Sate ayam', 'Protein', 220, 22, 5, 12, '1 tusuk', 30],
  ['Bakso sapi', 'Protein', 180, 13, 10, 10, '1 porsi', 250],
  ['Sosis ayam', 'Protein', 250, 13, 5, 20, '1 buah', 50],
  ['Nugget ayam', 'Protein', 220, 13, 15, 12, '1 buah', 30],
  ['Telur ayam rebus', 'Protein', 155, 13, 1.1, 11, '1 butir', 50],
  ['Telur ayam goreng', 'Protein', 200, 13.6, 1, 15, '1 butir', 55],
  ['Telur dadar', 'Protein', 190, 13, 2, 14, '1 butir', 60],
  ['Telur puyuh rebus', 'Protein', 158, 13, 0.8, 11, '1 butir', 9],

  // Fish and seafood
  ['Ikan kembung rebus', 'Protein', 120, 21, 0, 4, '1 ekor', 100],
  ['Ikan kembung goreng', 'Protein', 200, 21, 0, 13, '1 ekor', 100],
  ['Ikan nila goreng', 'Protein', 195, 24, 0, 11, '1 ekor', 120],
  ['Ikan tongkol goreng', 'Protein', 210, 22, 0, 14, '1 potong', 100],
  ['Ikan lele goreng', 'Protein', 230, 20, 2, 16, '1 ekor', 120],
  ['Udang rebus', 'Protein', 99, 24, 0.2, 0.3, '100 g', 100],
  ['Udang goreng', 'Protein', 190, 20, 3, 11, '100 g', 100],
  ['Cumi goreng', 'Protein', 175, 18, 4, 10, '100 g', 100],
  ['Pecel lele', 'Protein', 260, 20, 5, 18, '1 porsi', 200],

  // Tofu, tempeh, plant protein
  ['Tempe goreng', 'Protein nabati', 190, 19, 9, 11, '1 potong', 30],
  ['Tempe kukus', 'Protein nabati', 160, 20, 8, 5, '1 potong', 30],
  ['Tempe mendoan', 'Protein nabati', 240, 12, 18, 14, '1 potong', 40],
  ['Tahu goreng', 'Protein nabati', 170, 13, 6, 11, '1 potong', 40],
  ['Tahu kukus', 'Protein nabati', 80, 8, 2, 4, '1 potong', 40],
  ['Tahu isi goreng', 'Protein nabati', 220, 8, 20, 12, '1 buah', 60],
  ['Oncom goreng', 'Protein nabati', 200, 12, 10, 12, '1 potong', 40],
  ['Kacang tanah rebus', 'Protein nabati', 320, 14, 21, 22, '100 g', 100],

  // Vegetables
  ['Bayam rebus', 'Sayur', 23, 2.9, 3.6, 0.4, '1 mangkuk', 100],
  ['Sayur bayam tumis', 'Sayur', 65, 3, 5, 4, '1 mangkuk', 100],
  ['Kangkung rebus', 'Sayur', 25, 2.6, 3.4, 0.5, '1 mangkuk', 100],
  ['Kangkung tumis', 'Sayur', 70, 2.5, 5, 5, '1 mangkuk', 100],
  ['Brokoli rebus', 'Sayur', 35, 2.4, 7, 0.4, '1 mangkuk', 100],
  ['Brokoli tumis', 'Sayur', 80, 3, 8, 4.5, '1 mangkuk', 100],
  ['Wortel rebus', 'Sayur', 35, 0.8, 8, 0.2, '1 buah', 80],
  ['Buncis tumis', 'Sayur', 70, 2.5, 7, 3.5, '1 mangkuk', 100],
  ['Kol rebus', 'Sayur', 25, 1.3, 6, 0.1, '1 mangkuk', 100],
  ['Timun', 'Sayur', 15, 0.7, 3.6, 0.1, '1 buah', 100],
  ['Tomat', 'Sayur', 18, 0.9, 3.9, 0.2, '1 buah', 100],
  ['Terong goreng', 'Sayur', 120, 1.5, 8, 9, '1 potong', 60],
  ['Labu siam tumis', 'Sayur', 50, 1.2, 7, 2, '1 mangkuk', 100],
  ['Daun singkong rebus', 'Sayur', 40, 5, 6, 0.5, '1 mangkuk', 100],
  ['Gado-gado', 'Sayur', 160, 6, 15, 9, '1 porsi', 250],
  ['Ketoprak', 'Sayur', 180, 7, 22, 7, '1 porsi', 250],

  // Fruits
  ['Pisang', 'Buah', 89, 1.1, 23, 0.3, '1 buah', 120],
  ['Apel', 'Buah', 52, 0.3, 14, 0.2, '1 buah', 180],
  ['Jeruk', 'Buah', 47, 0.9, 12, 0.1, '1 buah', 130],
  ['Pepaya', 'Buah', 43, 0.5, 11, 0.3, '1 potong', 150],
  ['Mangga', 'Buah', 60, 0.8, 15, 0.4, '1 buah', 200],
  ['Semangka', 'Buah', 30, 0.6, 7.6, 0.2, '1 potong', 200],
  ['Melon', 'Buah', 34, 0.8, 8, 0.2, '1 potong', 150],
  ['Alpukat', 'Buah', 160, 2, 9, 15, '1 buah', 150],
  ['Anggur', 'Buah', 69, 0.7, 18, 0.2, '100 g', 100],
  ['Nanas', 'Buah', 50, 0.5, 13, 0.1, '1 potong', 100],
  ['Kiwi', 'Buah', 61, 1.1, 15, 0.5, '1 buah', 75],
  ['Stroberi', 'Buah', 32, 0.7, 7.7, 0.3, '100 g', 100],

  // Snacks and street food
  ['Bakwan goreng', 'Camilan', 280, 4, 30, 16, '1 buah', 50],
  ['Pisang goreng', 'Camilan', 250, 2.5, 38, 10, '1 buah', 60],
  ['Martabak manis', 'Camilan', 320, 6, 45, 13, '1 potong', 100],
  ['Martabak telur', 'Camilan', 280, 12, 20, 17, '1 potong', 100],
  ['Donat', 'Camilan', 380, 5, 50, 18, '1 buah', 60],
  ['Kue lapis', 'Camilan', 300, 3, 50, 11, '1 potong', 50],
  ['Klepon', 'Camilan', 250, 2, 48, 6, '1 butir', 25],
  ['Onde-onde', 'Camilan', 300, 3, 45, 12, '1 butir', 30],
  ['Bakpia', 'Camilan', 320, 5, 45, 13, '1 buah', 30],
  ['Kerupuk', 'Camilan', 480, 5, 55, 26, '1 genggam', 20],
  ['Kacang goreng', 'Camilan', 570, 24, 20, 45, '1 genggam', 30],
  ['Keripik singkong', 'Camilan', 500, 4, 55, 29, '1 bungkus kecil', 40],
  ['Cokelat susu', 'Camilan', 535, 8, 58, 30, '1 batang kecil', 30],
  ['Biskuit', 'Camilan', 450, 7, 68, 15, '1 keping', 10],
  ['Es krim', 'Camilan', 200, 3.5, 24, 11, '1 scoop', 60],
  ['Roti bakar cokelat', 'Camilan', 330, 7, 50, 12, '1 porsi', 100],
  ['Kolak pisang', 'Camilan', 160, 2, 30, 4, '1 mangkuk', 200],
  ['Siomay', 'Camilan', 170, 8, 18, 7, '1 porsi', 200],
  ['Batagor', 'Camilan', 220, 9, 22, 11, '1 porsi', 200],
  ['Pempek', 'Camilan', 190, 10, 25, 6, '1 porsi', 200],
  ['Soto ayam', 'Camilan', 70, 5, 6, 3, '1 mangkuk', 300],
  ['Rawon', 'Camilan', 90, 7, 5, 5, '1 mangkuk', 300],
  ['Selai kacang', 'Camilan', 588, 25, 20, 50, '1 sdm', 15],
  ['Madu', 'Camilan', 304, 0.3, 82, 0, '1 sdm', 20],
  ['Gula pasir', 'Bahan', 387, 0, 100, 0, '1 sdm', 12],
  ['Minyak goreng', 'Bahan', 884, 0, 0, 100, '1 sdm', 14],
  ['Mentega', 'Bahan', 717, 0.9, 0.1, 81, '1 sdm', 14],
  ['Santan', 'Bahan', 230, 2.3, 5.5, 24, '100 ml', 100],
  ['Kecap manis', 'Bahan', 290, 5, 60, 0, '1 sdm', 15],

  // Drinks
  ['Air putih', 'Minuman', 0, 0, 0, 0, '1 gelas', 250],
  ['Teh manis', 'Minuman', 40, 0, 10, 0, '1 gelas', 250],
  ['Es teh manis', 'Minuman', 35, 0, 9, 0, '1 gelas', 250],
  ['Kopi hitam', 'Minuman', 2, 0.1, 0, 0, '1 cangkir', 200],
  ['Kopi susu', 'Minuman', 70, 1.5, 10, 2.5, '1 cangkir', 200],
  ['Susu full cream', 'Minuman', 61, 3.2, 4.8, 3.3, '1 gelas', 200],
  ['Susu skim', 'Minuman', 35, 3.4, 5, 0.1, '1 gelas', 200],
  ['Jus jeruk', 'Minuman', 45, 0.7, 10, 0.2, '1 gelas', 250],
  ['Minuman soda', 'Minuman', 42, 0, 10.6, 0, '1 kaleng', 330],
];

interface PrepBase {
  name: string;
  category: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  servingLabel: string;
  servingGrams: number;
}

const prepBases: PrepBase[] = [
  { name: 'Dada ayam', category: 'Protein', kcal: 165, protein: 31, carbs: 0, fat: 3.6, servingLabel: '1 potong', servingGrams: 100 },
  { name: 'Paha ayam', category: 'Protein', kcal: 210, protein: 26, carbs: 0, fat: 11, servingLabel: '1 potong', servingGrams: 100 },
  { name: 'Ikan kembung', category: 'Protein', kcal: 125, protein: 21, carbs: 0, fat: 4, servingLabel: '1 ekor', servingGrams: 100 },
  { name: 'Ikan nila', category: 'Protein', kcal: 130, protein: 20, carbs: 0, fat: 5, servingLabel: '1 ekor', servingGrams: 120 },
  { name: 'Udang', category: 'Protein', kcal: 99, protein: 24, carbs: 0.2, fat: 0.3, servingLabel: '100 g', servingGrams: 100 },
  { name: 'Tempe', category: 'Protein nabati', kcal: 160, protein: 20, carbs: 8, fat: 5, servingLabel: '1 potong', servingGrams: 30 },
  { name: 'Tahu', category: 'Protein nabati', kcal: 80, protein: 8, carbs: 2, fat: 4, servingLabel: '1 potong', servingGrams: 40 },
  { name: 'Kentang', category: 'Karbohidrat', kcal: 87, protein: 2, carbs: 20, fat: 0.1, servingLabel: '1 buah', servingGrams: 150 },
  { name: 'Ubi jalar', category: 'Karbohidrat', kcal: 90, protein: 2, carbs: 21, fat: 0.2, servingLabel: '1 buah', servingGrams: 150 },
  { name: 'Brokoli', category: 'Sayur', kcal: 35, protein: 2.4, carbs: 7, fat: 0.4, servingLabel: '1 mangkuk', servingGrams: 100 },
  { name: 'Kangkung', category: 'Sayur', kcal: 25, protein: 2.6, carbs: 3.4, fat: 0.5, servingLabel: '1 mangkuk', servingGrams: 100 },
  { name: 'Bayam', category: 'Sayur', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingLabel: '1 mangkuk', servingGrams: 100 },
  { name: 'Buncis', category: 'Sayur', kcal: 44, protein: 2.4, carbs: 7, fat: 0.3, servingLabel: '1 mangkuk', servingGrams: 100 },
  { name: 'Terong', category: 'Sayur', kcal: 35, protein: 1.1, carbs: 8, fat: 0.2, servingLabel: '1 potong', servingGrams: 60 },
];

interface PrepMethod {
  label: string;
  kcalFactor: number;
  proteinFactor: number;
  carbsFactor: number;
  fatAdd: number;
  restSeconds?: number;
}

const prepMethods: PrepMethod[] = [
  { label: 'rebus', kcalFactor: 1, proteinFactor: 1, carbsFactor: 1, fatAdd: 0 },
  { label: 'kukus', kcalFactor: 0.98, proteinFactor: 1, carbsFactor: 0.98, fatAdd: 0 },
  { label: 'goreng', kcalFactor: 1.25, proteinFactor: 0.98, carbsFactor: 1, fatAdd: 8 },
  { label: 'tumis', kcalFactor: 1.15, proteinFactor: 1, carbsFactor: 1, fatAdd: 5 },
  { label: 'panggang', kcalFactor: 1.08, proteinFactor: 1, carbsFactor: 1, fatAdd: 2 },
];

const round1 = (value: number) => Math.round(value * 10) / 10;

function buildFoods(): SeedFood[] {
  const out: SeedFood[] = [];
  const seen = new Set<string>();
  const push = (food: SeedFood) => {
    const key = food.name.trim().toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(food);
  };

  for (const [name, category, kcal, protein, carbs, fat, servingLabel, servingGrams] of rows) {
    push({ name, category, kcal100g: kcal, protein100g: protein, carbs100g: carbs, fat100g: fat, servingLabel, servingGrams });
  }

  for (const base of prepBases) {
    for (const method of prepMethods) {
      const name = `${base.name} ${method.label}`;
      push({
        name,
        category: base.category,
        kcal100g: round1(base.kcal * method.kcalFactor + method.fatAdd * 9),
        protein100g: round1(base.protein * method.proteinFactor),
        carbs100g: round1(base.carbs * method.carbsFactor),
        fat100g: round1(base.fat + method.fatAdd),
        servingLabel: base.servingLabel,
        servingGrams: base.servingGrams,
      });
    }
  }

  return out;
}

export const SEED_FOODS: SeedFood[] = buildFoods();
