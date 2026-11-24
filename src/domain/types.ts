import type { ActivityLevel, Goal, Pace, Sex } from '../config';

export interface BmrInput {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}

export interface CalorieTargetInput extends BmrInput {
  goal: Goal;
  pace: Pace;
  sessionsPerWeek: number;
  activityLevel: ActivityLevel;
}

export type NutritionReason =
  | 'bulkSurplusCapped'
  | 'cuttingFloorApplied'
  | 'cuttingTooFast'
  | 'bulkNotRecommendedHighBmi'
  | 'cuttingBlockedLowBmi'
  | 'proteinOutOfRange'
  | 'fatOutOfRange'
  | 'fatRaisedToMinimum'
  | 'fatLoweredForCarbs'
  | 'carbsBelowMinimum'
  | 'caloriesTooLowForMacros';

export interface CalorieTargetResult {
  bmr: number;
  pal: number;
  tdee: number;
  calories: number;
  adjustmentKcal: number;
  adjustmentPct: number;
  weightChangeKgPerWeek: number;
  reasons: NutritionReason[];
  blocked: boolean;
}

export interface MacroInput {
  calories: number;
  weightKg: number;
  goal: Goal;
  proteinGPerKg?: number;
  fatPct?: number;
}

export interface MacroResult {
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  reasons: NutritionReason[];
}

export interface WorkSetInput {
  weightKg: number;
  reps: number;
  rpe?: number | null;
  isWarmup?: boolean;
}

export type PrType = 'weight' | 'reps' | 'e1rm' | 'volume';

export type ProgressionAction =
  | 'increase'
  | 'hold'
  | 'hold_add_rep'
  | 'deload'
  | 'reduce'
  | 'restart_90';

export type ProgressionReason =
  | 'layoffRestart'
  | 'deloadStalled'
  | 'increaseAllMax'
  | 'addRep'
  | 'holdBelowMinOnce'
  | 'reduceBelowMinTwice'
  | 'holdRpe10'
  | 'hold';

export interface ProgressionInput {
  lastSets: WorkSetInput[];
  repMin: number;
  repMax: number;
  incrementKg: number;
  daysSinceLastSession: number;
  consecutiveBelowMin: number;
  e1rmStallSessions: number;
}

export interface ProgressionPlan {
  action: ProgressionAction;
  weightKg: number;
  targetReps: number;
  reason: ProgressionReason;
}
