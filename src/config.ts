/**
 * Single source of truth for every tunable constant in FitTrack.
 * Business rules from docs/PRD.md sections 7.1 - 7.11 live here.
 */

export type Sex = 'male' | 'female';
export type Goal = 'bulking' | 'cutting' | 'recomp';
export type Pace = 'slow' | 'moderate' | 'aggressive';
export type ActivityLevel = 'low' | 'medium' | 'high';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const APP = {
  name: 'FitTrack',
  kcalPerKgBodyMass: 7700,
} as const;

export const PROFILE_LIMITS = {
  ageMin: 18,
  ageMax: 80,
  heightCmMin: 120,
  heightCmMax: 230,
  weightKgMin: 30,
  weightKgMax: 250,
  sessionsPerWeekMin: 0,
  sessionsPerWeekMax: 7,
} as const;

export const SEXES: readonly Sex[] = ['male', 'female'];
export const GOALS: readonly Goal[] = ['bulking', 'cutting', 'recomp'];
export const PACES: readonly Pace[] = ['slow', 'moderate', 'aggressive'];
export const ACTIVITY_LEVELS: readonly ActivityLevel[] = ['low', 'medium', 'high'];
export const MEAL_TYPES: readonly MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** PRD 7.2: PAL contribution by gym sessions per week (index 0..7). */
export const PAL_BY_FREQUENCY: readonly number[] = [1.2, 1.3, 1.375, 1.46, 1.55, 1.64, 1.725, 1.8];

/** PRD 7.2: extra PAL by daily activity level. */
export const ACTIVITY_PAL_ADDITION: Readonly<Record<ActivityLevel, number>> = {
  low: 0,
  medium: 0.05,
  high: 0.1,
};

/** PRD 7.2: hard cap so TDEE never inflates beyond this multiplier. */
export const PAL_MAX = 1.9;

/** PRD 7.3: calorie adjustment per goal and pace (fraction of TDEE). */
export const GOAL_PACE_ADJUSTMENT: Readonly<Record<Goal, Readonly<Record<Pace, number>>>> = {
  bulking: { slow: 0.05, moderate: 0.1, aggressive: 0.15 },
  cutting: { slow: -0.1, moderate: -0.15, aggressive: -0.2 },
  recomp: { slow: 0, moderate: -0.05, aggressive: -0.1 },
};

/** PRD 7.3: bulking surplus hard cap = min(+)percentage, kcal cap. */
export const BULK_SURPLUS_MAX_PCT = 0.2;
export const BULK_SURPLUS_MAX_KCAL = 500;

/** PRD 7.3: cutting floor rules. */
export const CUTTING_DEFICIT_MAX_PCT = -0.25;
export const CUTTING_MIN_KCAL: Readonly<Record<Sex, number>> = { male: 1500, female: 1200 };
export const CUTTING_MAX_LOSS_PCT_PER_WEEK = 0.01;
export const MIN_KCAL_AS_BMR_FACTOR = 1.0;

/** PRD 7.3: recomp floor. */
export const RECOMP_DEFICIT_MAX_PCT = -0.1;

/** PRD 7.4: macro targets. */
export const PROTEIN_G_PER_KG: Readonly<Record<Goal, number>> = {
  bulking: 1.8,
  cutting: 2.2,
  recomp: 2.0,
};
export const PROTEIN_RANGE_G_PER_KG: Readonly<Record<Goal, readonly [number, number]>> = {
  bulking: [1.6, 2.2],
  cutting: [2.0, 2.6],
  recomp: [1.8, 2.4],
};
export const PROTEIN_MAX_G_PER_KG = 3.0;
export const FAT_DEFAULT_PCT = 0.25;
export const FAT_MIN_PCT = 0.2;
export const FAT_MAX_PCT = 0.35;
export const FAT_MIN_G_PER_KG = 0.6;
export const CARBS_MIN_G_PER_KG = 2.0;
export const FIBER_G_PER_1000_KCAL = 14;
export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

/** PRD 7.3 / A2: BMI guards. */
export const BMI_CUTTING_MIN = 18.5;
export const BMI_BULK_WARN = 30;

/** PRD 7.9: Epley only valid for 1-12 reps. */
export const E1RM_MAX_REPS = 12;

/** PRD C2 / 7.11: warning tolerance between stated kcal and 4P+4C+9F. */
export const FOOD_KCAL_CONSISTENCY_TOLERANCE = 0.15;

/** PRD 7.8: default load increments (kg). */
export const DEFAULT_INCREMENT_KG = {
  upperBarbell: 2.5,
  lowerBarbell: 5,
  dumbbell: 2,
  machine: 2.5,
} as const;

/** PRD 7.8: double progression thresholds. */
export const PROGRESSION = {
  deloadPct: 0.1,
  reducePct: 0.1,
  layoffDays: 14,
  layoffFactor: 0.9,
  e1rmStallSessions: 3,
  rpeRirLimit: 9,
  minRpe: 6,
  maxRpe: 10,
  rpeStep: 0.5,
} as const;

/** PRD 7.7: session defaults. */
export const WORKOUT_DEFAULTS = {
  compoundSets: 4,
  compoundRepMin: 6,
  compoundRepMax: 10,
  isolationSets: 3,
  isolationRepMin: 10,
  isolationRepMax: 15,
  restCompoundSeconds: 180,
  restIsolationSeconds: 90,
  exercisesPerSessionMin: 4,
  exercisesPerSessionMax: 6,
} as const;

/** PRD 7.11: week starts Monday. */
export const WEEK_START_DAY = 1;

/** Reminder defaults. */
export const REMINDER_DEFAULTS = {
  breakfast: '07:00',
  lunch: '12:00',
  dinner: '19:00',
  snack: '16:00',
  workout: '17:00',
  weighIn: '07:00',
} as const;

/** PRD 7.11: built-in food values are unverified estimates. */
export const FOOD_SEED_SOURCE = 'estimasi internal (belum terverifikasi)';
export const FOOD_SERVING_SOURCE_NOTE = 'Nilai gizi per 100 g adalah estimasi. Periksa label atau TKPI sebelum mengandalkan angka ini.';
