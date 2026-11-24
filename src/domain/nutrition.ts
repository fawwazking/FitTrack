import {
  ACTIVITY_PAL_ADDITION,
  APP,
  BMI_BULK_WARN,
  BMI_CUTTING_MIN,
  BULK_SURPLUS_MAX_KCAL,
  BULK_SURPLUS_MAX_PCT,
  CARBS_MIN_G_PER_KG,
  CUTTING_DEFICIT_MAX_PCT,
  CUTTING_MAX_LOSS_PCT_PER_WEEK,
  CUTTING_MIN_KCAL,
  FAT_DEFAULT_PCT,
  FAT_MAX_PCT,
  FAT_MIN_G_PER_KG,
  FAT_MIN_PCT,
  FIBER_G_PER_1000_KCAL,
  GOAL_PACE_ADJUSTMENT,
  KCAL_PER_G,
  MIN_KCAL_AS_BMR_FACTOR,
  PAL_BY_FREQUENCY,
  PAL_MAX,
  PROTEIN_G_PER_KG,
  PROTEIN_MAX_G_PER_KG,
  PROTEIN_RANGE_G_PER_KG,
  RECOMP_DEFICIT_MAX_PCT,
  type Goal,
  type Pace,
} from '../config';
import type {
  BmrInput,
  CalorieTargetInput,
  CalorieTargetResult,
  MacroInput,
  MacroResult,
  NutritionReason,
} from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Mifflin-St Jeor. PRD 7.1. */
export function computeBmr(input: BmrInput): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === 'male' ? base + 5 : base - 161;
}

/** PRD 7.2. Sessions per week is rounded and clamped to 0..7. */
export function computePal(sessionsPerWeek: number, activityLevel: keyof typeof ACTIVITY_PAL_ADDITION): number {
  const index = clamp(Math.round(sessionsPerWeek), 0, PAL_BY_FREQUENCY.length - 1);
  const frequencyPal = PAL_BY_FREQUENCY[index] ?? PAL_BY_FREQUENCY[0]!;
  return Math.min(PAL_MAX, frequencyPal + ACTIVITY_PAL_ADDITION[activityLevel]);
}

export function computeTdee(bmr: number, pal: number): number {
  return bmr * pal;
}

export function bmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function isCuttingBlockedByBmi(value: number): boolean {
  return value < BMI_CUTTING_MIN;
}

export function isBulkingDiscouragedByBmi(value: number): boolean {
  return value >= BMI_BULK_WARN;
}

/** PRD 7.3. `blocked` is true when the goal itself is unsafe for the BMI. */
export function computeCalorieTarget(input: CalorieTargetInput): CalorieTargetResult {
  const bmr = computeBmr(input);
  const pal = computePal(input.sessionsPerWeek, input.activityLevel);
  const tdee = computeTdee(bmr, pal);
  const reasons: NutritionReason[] = [];
  const bodyBmi = bmi(input.weightKg, input.heightCm);

  let blocked = false;
  if (input.goal === 'cutting' && isCuttingBlockedByBmi(bodyBmi)) {
    blocked = true;
    reasons.push('cuttingBlockedLowBmi');
  }
  if (input.goal === 'bulking' && isBulkingDiscouragedByBmi(bodyBmi)) {
    reasons.push('bulkNotRecommendedHighBmi');
  }

  let adjustmentPct = GOAL_PACE_ADJUSTMENT[input.goal][input.pace];

  if (input.goal === 'bulking') {
    const maxPct = Math.min(BULK_SURPLUS_MAX_PCT, BULK_SURPLUS_MAX_KCAL / tdee);
    if (adjustmentPct > maxPct) {
      adjustmentPct = maxPct;
      reasons.push('bulkSurplusCapped');
    }
  } else if (input.goal === 'cutting') {
    adjustmentPct = Math.max(adjustmentPct, CUTTING_DEFICIT_MAX_PCT);
  } else {
    adjustmentPct = Math.max(adjustmentPct, RECOMP_DEFICIT_MAX_PCT);
  }

  let calories = tdee * (1 + adjustmentPct);

  if (input.goal === 'cutting') {
    const floor = Math.max(CUTTING_MIN_KCAL[input.sex], bmr * MIN_KCAL_AS_BMR_FACTOR);
    if (calories < floor) {
      calories = floor;
      adjustmentPct = calories / tdee - 1;
      reasons.push('cuttingFloorApplied');
    }
    const lossPct = ((tdee - calories) * 7) / APP.kcalPerKgBodyMass / input.weightKg;
    if (lossPct > CUTTING_MAX_LOSS_PCT_PER_WEEK) {
      reasons.push('cuttingTooFast');
      blocked = input.pace === 'aggressive' ? true : blocked;
    }
  }

  const adjustmentKcal = calories - tdee;
  return {
    bmr,
    pal,
    tdee,
    calories,
    adjustmentKcal,
    adjustmentPct,
    weightChangeKgPerWeek: (adjustmentKcal * 7) / APP.kcalPerKgBodyMass,
    reasons,
    blocked,
  };
}

/** True when a pace is unsafe to offer for the given target/goal. PRD 7.3 + A2. */
export function isPaceAllowed(
  goal: Goal,
  pace: Pace,
  result: Pick<CalorieTargetResult, 'tdee' | 'calories' | 'blocked'>,
  weightKg: number,
): boolean {
  if (result.blocked) return false;
  if (goal !== 'cutting' || pace !== 'aggressive') return true;
  const lossPct = ((result.tdee - result.calories) * 7) / APP.kcalPerKgBodyMass / weightKg;
  return lossPct <= CUTTING_MAX_LOSS_PCT_PER_WEEK;
}

/** PRD 7.4. Order: protein (g/kg), fat (% kcal with floor), carbs = remainder. */
export function computeMacros(input: MacroInput): MacroResult {
  const reasons: NutritionReason[] = [];
  const weight = input.weightKg;

  let proteinPerKg = input.proteinGPerKg ?? PROTEIN_G_PER_KG[input.goal];
  const [rangeMin, rangeMax] = PROTEIN_RANGE_G_PER_KG[input.goal];
  if (proteinPerKg < rangeMin || proteinPerKg > rangeMax) reasons.push('proteinOutOfRange');
  if (proteinPerKg > PROTEIN_MAX_G_PER_KG) {
    proteinPerKg = PROTEIN_MAX_G_PER_KG;
    reasons.push('proteinOutOfRange');
  }
  proteinPerKg = Math.max(0, proteinPerKg);
  const proteinG = proteinPerKg * weight;
  const proteinKcal = proteinG * KCAL_PER_G.protein;

  let fatPct = input.fatPct ?? FAT_DEFAULT_PCT;
  if (fatPct < FAT_MIN_PCT || fatPct > FAT_MAX_PCT) reasons.push('fatOutOfRange');
  fatPct = clamp(fatPct, FAT_MIN_PCT, FAT_MAX_PCT);
  let fatG = (input.calories * fatPct) / KCAL_PER_G.fat;
  const fatFloor = FAT_MIN_G_PER_KG * weight;
  if (fatG < fatFloor) {
    fatG = fatFloor;
    reasons.push('fatRaisedToMinimum');
  }

  let carbsKcal = input.calories - proteinKcal - fatG * KCAL_PER_G.fat;
  let carbsG = carbsKcal / KCAL_PER_G.carbs;

  if (carbsG < CARBS_MIN_G_PER_KG * weight) {
    fatG = Math.max((input.calories * FAT_MIN_PCT) / KCAL_PER_G.fat, fatFloor);
    carbsKcal = input.calories - proteinKcal - fatG * KCAL_PER_G.fat;
    carbsG = carbsKcal / KCAL_PER_G.carbs;
    reasons.push('fatLoweredForCarbs');
    if (carbsG < CARBS_MIN_G_PER_KG * weight) reasons.push('carbsBelowMinimum');
  }

  if (carbsG < 0) {
    carbsKcal = 0;
    carbsG = 0;
    reasons.push('caloriesTooLowForMacros');
  }

  return {
    proteinG,
    carbsG,
    fatG,
    fiberG: (input.calories / 1000) * FIBER_G_PER_1000_KCAL,
    proteinKcal,
    carbsKcal,
    fatKcal: fatG * KCAL_PER_G.fat,
    reasons,
  };
}
