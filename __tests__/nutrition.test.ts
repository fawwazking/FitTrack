import {
  bmi,
  computeBmr,
  computeCalorieTarget,
  computeMacros,
  computePal,
  computeTdee,
  epley1Rm,
  isPaceAllowed,
} from '../src/domain';
import { isCalorieConsistent, recipeToPer100g } from '../src/domain/food';

const rizky = {
  sex: 'male' as const,
  age: 25,
  weightKg: 70,
  heightCm: 170,
  sessionsPerWeek: 4,
  activityLevel: 'low' as const,
};

describe('PRD 7.6 golden example (male 25y, 70 kg, 170 cm, 4x/week, bulking)', () => {
  it('computes BMR with Mifflin-St Jeor', () => {
    expect(computeBmr(rizky)).toBeCloseTo(1642.5, 5);
  });

  it('computes PAL 1.55', () => {
    expect(computePal(4, 'low')).toBeCloseTo(1.55, 5);
  });

  it('computes TDEE 2546 kcal', () => {
    const tdee = computeTdee(computeBmr(rizky), computePal(4, 'low'));
    expect(tdee).toBeCloseTo(2545.875, 3);
    expect(Math.round(tdee)).toBe(2546);
  });

  it('computes bulking moderate target 2801 kcal and +0.23 kg/week', () => {
    const result = computeCalorieTarget({ ...rizky, goal: 'bulking', pace: 'moderate' });
    expect(Math.abs(Math.round(result.calories) - 2801)).toBeLessThanOrEqual(1);
    expect(result.adjustmentKcal).toBeCloseTo(254.5875, 2);
    expect(result.weightChangeKgPerWeek).toBeCloseTo(0.2314, 3);
  });

  it('computes macros 126 g protein, 78 g fat, 399 g carbs', () => {
    const target = computeCalorieTarget({ ...rizky, goal: 'bulking', pace: 'moderate' });
    const macros = computeMacros({ calories: target.calories, weightKg: 70, goal: 'bulking' });
    expect(Math.round(macros.proteinG)).toBe(126);
    expect(Math.round(macros.fatG)).toBe(78);
    expect(Math.round(macros.carbsG)).toBe(399);
    expect(macros.fiberG).toBeCloseTo(39.2, 1);
  });

  it('computes cutting moderate comparison: 2164 kcal, 154 g protein, 60 g fat, 252 g carbs', () => {
    const target = computeCalorieTarget({ ...rizky, goal: 'cutting', pace: 'moderate' });
    const macros = computeMacros({ calories: target.calories, weightKg: 70, goal: 'cutting' });
    expect(Math.round(target.calories)).toBe(2164);
    expect(Math.round(macros.proteinG)).toBe(154);
    expect(Math.round(macros.fatG)).toBe(60);
    expect(Math.round(macros.carbsG)).toBe(252);
  });
});

describe('calorie target safety rules', () => {
  it('caps PAL at 1.90', () => {
    expect(computePal(7, 'high')).toBeCloseTo(1.9, 5);
    expect(computePal(99, 'high')).toBeCloseTo(1.9, 5);
  });

  it('caps bulking surplus at 500 kcal when 15% exceeds it', () => {
    const result = computeCalorieTarget({
      sex: 'male',
      age: 30,
      weightKg: 120,
      heightCm: 190,
      sessionsPerWeek: 7,
      activityLevel: 'high',
      goal: 'bulking',
      pace: 'aggressive',
    });
    expect(result.adjustmentKcal).toBeCloseTo(500, 5);
    expect(result.reasons).toContain('bulkSurplusCapped');
  });

  it('applies the cutting floor (1500 male / 1200 female and >= BMR)', () => {
    const result = computeCalorieTarget({
      sex: 'male',
      age: 50,
      weightKg: 60,
      heightCm: 165,
      sessionsPerWeek: 0,
      activityLevel: 'low',
      goal: 'cutting',
      pace: 'aggressive',
    });
    expect(result.calories).toBeCloseTo(1500, 5);
    expect(result.reasons).toContain('cuttingFloorApplied');
  });

  it('blocks cutting when BMI < 18.5', () => {
    const result = computeCalorieTarget({
      sex: 'male',
      age: 25,
      weightKg: 45,
      heightCm: 180,
      sessionsPerWeek: 2,
      activityLevel: 'low',
      goal: 'cutting',
      pace: 'moderate',
    });
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain('cuttingBlockedLowBmi');
    expect(isPaceAllowed('cutting', 'moderate', result, 45)).toBe(false);
  });

  it('warns for bulking when BMI >= 30', () => {
    const result = computeCalorieTarget({
      sex: 'male',
      age: 35,
      weightKg: 100,
      heightCm: 170,
      sessionsPerWeek: 3,
      activityLevel: 'low',
      goal: 'bulking',
      pace: 'moderate',
    });
    expect(result.reasons).toContain('bulkNotRecommendedHighBmi');
    expect(bmi(100, 170)).toBeGreaterThanOrEqual(30);
  });
});

describe('macro rules', () => {
  it('raises fat to the 0.6 g/kg floor', () => {
    const macros = computeMacros({
      calories: 1800,
      weightKg: 100,
      goal: 'cutting',
      proteinGPerKg: 1.6,
      fatPct: 0.2,
    });
    expect(macros.fatG).toBeGreaterThanOrEqual(60);
    expect(macros.reasons).toContain('fatRaisedToMinimum');
  });

  it('lowers fat to 20% and still warns when carbs stay under 2 g/kg', () => {
    const macros = computeMacros({
      calories: 1100,
      weightKg: 70,
      goal: 'cutting',
      proteinGPerKg: 2.6,
      fatPct: 0.35,
    });
    expect(macros.reasons).toContain('fatLoweredForCarbs');
    expect(macros.reasons).toContain('carbsBelowMinimum');
    expect(macros.carbsG).toBeLessThan(140);
  });

  it('caps protein at 3.0 g/kg', () => {
    const macros = computeMacros({ calories: 3000, weightKg: 70, goal: 'bulking', proteinGPerKg: 3.5 });
    expect(macros.proteinG).toBeCloseTo(210, 5);
    expect(macros.reasons).toContain('proteinOutOfRange');
  });

  it('uses 25% fat by default', () => {
    const macros = computeMacros({ calories: 2000, weightKg: 80, goal: 'recomp' });
    expect(macros.fatG).toBeCloseTo((2000 * 0.25) / 9, 5);
  });
});

describe('food helpers', () => {
  it('flags kcal that differ from 4P + 4C + 9F by more than 15%', () => {
    expect(isCalorieConsistent(100, 10, 0, 0)).toBe(false);
    expect(isCalorieConsistent(100, 25, 0, 0)).toBe(true);
  });

  it('builds recipe per-100g values from ingredients', () => {
    const recipe = recipeToPer100g([
      { per100g: { kcal100g: 100, protein100g: 5, carbs100g: 10, fat100g: 2 }, grams: 100 },
      { per100g: { kcal100g: 200, protein100g: 10, carbs100g: 20, fat100g: 4 }, grams: 100 },
    ]);
    expect(recipe.totalGrams).toBe(200);
    expect(recipe.total.kcal).toBeCloseTo(300, 5);
    expect(recipe.per100g.kcal100g).toBeCloseTo(150, 5);
    expect(recipe.per100g.protein100g).toBeCloseTo(7.5, 5);
  });
});

describe('e1RM (PRD 7.9)', () => {
  it('estimates 80 kg x 8 as 101.3 kg', () => {
    expect(epley1Rm(80, 8)).toBeCloseTo(101.3333, 3);
  });

  it('returns the weight for a single rep', () => {
    expect(epley1Rm(100, 1)).toBe(100);
  });

  it('does not estimate reps over 12', () => {
    expect(epley1Rm(60, 13)).toBeNull();
  });
});
