import { and, asc, desc, gt, isNull, lte } from 'drizzle-orm';
import { addDaysISO, todayISO } from '../../domain/dates';
import { evaluateWeekly, type WeeklyEvalResult } from '../../domain/weekly';
import { CUTTING_MIN_KCAL, type Goal } from '../../config';
import { getDb, isWeb } from '../db';
import {
  goalSetting,
  nutritionTarget,
  weightLog,
  mealEntry,
} from '../schema';

export interface WeeklyEvalData {
  currentAvg: number | null;
  previousAvg: number | null;
  weightEntries: number;
  foodDays: number;
  targetKcal: number;
  goal: Goal;
}

/**
 * Collect the raw data needed for a weekly evaluation.
 * weekStart = Monday of the current week.
 */
export function getWeeklyEvalData(weekStart: string): WeeklyEvalData | null {
  if (isWeb) return null;
  const db = getDb();

  // Previous week
  const prevStart = addDaysISO(weekStart, -7);
  const prevEnd = addDaysISO(weekStart, -1);

  // Current week (up to today)
  const today = todayISO();
  const currEnd = today < weekStart ? weekStart : today;

  const prevWeights = db
    .select()
    .from(weightLog)
    .where(and(isNull(weightLog.deletedAt), gt(weightLog.date, addDaysISO(prevStart, -1)), lte(weightLog.date, prevEnd)))
    .orderBy(asc(weightLog.date))
    .all();

  const currWeights = db
    .select()
    .from(weightLog)
    .where(and(isNull(weightLog.deletedAt), gt(weightLog.date, addDaysISO(weekStart, -1)), lte(weightLog.date, currEnd)))
    .orderBy(asc(weightLog.date))
    .all();

  const foodDaysRows = db
    .select({ date: mealEntry.date })
    .from(mealEntry)
    .where(and(isNull(mealEntry.deletedAt), gt(mealEntry.date, addDaysISO(weekStart, -1)), lte(mealEntry.date, currEnd)))
    .groupBy(mealEntry.date)
    .all();

  // Get active goal
  const activeGoal = db
    .select()
    .from(goalSetting)
    .where(isNull(goalSetting.deletedAt))
    .orderBy(desc(goalSetting.updatedAt as any))
    .limit(1)
    .get();

  const latestTarget = db
    .select()
    .from(nutritionTarget)
    .where(isNull(nutritionTarget.deletedAt))
    .orderBy(desc(nutritionTarget.effectiveDate as any))
    .limit(1)
    .get();

  if (!activeGoal || !latestTarget) return null;

  return {
    currentAvg: currWeights.length > 0 ? currWeights.reduce((s, r) => s + r.weightKg, 0) / currWeights.length : null,
    previousAvg: prevWeights.length > 0 ? prevWeights.reduce((s, r) => s + r.weightKg, 0) / prevWeights.length : null,
    weightEntries: currWeights.length,
    foodDays: foodDaysRows.length,
    targetKcal: latestTarget.calories,
    goal: activeGoal.goal as Goal,
  };
}

/**
 * Run the weekly evaluation and return the result.
 */
export function runWeeklyEval(weekStart: string): WeeklyEvalResult {
  const data = getWeeklyEvalData(weekStart);
  if (!data || data.currentAvg === null || data.previousAvg === null) {
    return {
      action: 'insufficient_data',
      adjustmentKcal: 0,
      newTargetKcal: data?.targetKcal ?? 0,
      weeklyRate: 0,
      reason: 'Data berat badan tidak cukup untuk evaluasi.',
    };
  }

  const minKcal = data.goal === 'cutting' ? CUTTING_MIN_KCAL.male : 0;
  return evaluateWeekly({
    currentAvg: data.currentAvg,
    previousAvg: data.previousAvg,
    goal: data.goal,
    targetKcal: data.targetKcal,
    minKcal,
    weightEntries: data.weightEntries,
    foodDays: data.foodDays,
  });
}
