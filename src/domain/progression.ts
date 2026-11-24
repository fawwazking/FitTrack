import { E1RM_MAX_REPS, PROGRESSION } from '../config';
import type {
  PrType,
  ProgressionInput,
  ProgressionPlan,
  WorkSetInput,
} from './types';

export function isWorkingSet(set: WorkSetInput): boolean {
  return !set.isWarmup && set.reps > 0 && set.weightKg >= 0;
}

export function workSets<T extends WorkSetInput>(sets: readonly T[]): T[] {
  return sets.filter(isWorkingSet);
}

/** Epley estimate. PRD 7.9: only valid for 1-12 reps, null otherwise. */
export function epley1Rm(weightKg: number, reps: number): number | null {
  if (reps < 1 || reps > E1RM_MAX_REPS) return null;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function setVolume(set: WorkSetInput): number {
  return isWorkingSet(set) ? set.weightKg * set.reps : 0;
}

export function sessionVolume(sets: readonly WorkSetInput[]): number {
  return sets.reduce((total, set) => total + setVolume(set), 0);
}

/**
 * Compares one working set against all earlier working sets for the same
 * exercise (oldest first not required). Returns the PR types achieved.
 * The very first recorded set yields no badge because there is no baseline.
 */
export function detectSetPrs(history: readonly WorkSetInput[], current: WorkSetInput): PrType[] {
  if (!isWorkingSet(current)) return [];
  const previous = workSets(history);
  if (previous.length === 0) return [];

  const prs: PrType[] = [];
  const bestWeight = Math.max(...previous.map((set) => set.weightKg));
  if (current.weightKg > bestWeight) prs.push('weight');

  const comparable = previous.filter((set) => set.weightKg >= current.weightKg);
  if (comparable.length > 0) {
    const bestReps = Math.max(...comparable.map((set) => set.reps));
    if (current.reps > bestReps) prs.push('reps');
  }

  const currentE1rm = epley1Rm(current.weightKg, current.reps);
  const previousE1rms = previous
    .map((set) => epley1Rm(set.weightKg, set.reps))
    .filter((value): value is number => value !== null);
  if (currentE1rm !== null && previousE1rms.length > 0 && currentE1rm > Math.max(...previousE1rms)) {
    prs.push('e1rm');
  }

  return prs;
}

export function isVolumePr(previousBestSessionVolume: number, currentSessionVolume: number): boolean {
  return currentSessionVolume > previousBestSessionVolume && currentSessionVolume > 0;
}

export function roundToIncrement(value: number, incrementKg: number): number {
  if (incrementKg <= 0) return Math.round(value * 100) / 100;
  return Math.round((Math.round(value / incrementKg) * incrementKg) * 100) / 100;
}

/** Double progression. PRD 7.8. */
export function planNextSession(input: ProgressionInput): ProgressionPlan {
  const sets = workSets(input.lastSets);
  const increment = input.incrementKg > 0 ? input.incrementKg : 2.5;
  const { repMin, repMax } = input;

  if (sets.length === 0) {
    return { action: 'hold', weightKg: 0, targetReps: repMin, reason: 'hold' };
  }

  const lastWeight = Math.max(...sets.map((set) => set.weightKg));
  const minReps = Math.min(...sets.map((set) => set.reps));
  const allAtMax = sets.every((set) => set.reps >= repMax);
  const anyRpe10 = sets.some((set) => set.rpe === PROGRESSION.maxRpe);
  const belowMin = minReps < repMin;

  if (input.daysSinceLastSession >= PROGRESSION.layoffDays) {
    return {
      action: 'restart_90',
      weightKg: roundToIncrement(lastWeight * PROGRESSION.layoffFactor, increment),
      targetReps: repMin,
      reason: 'layoffRestart',
    };
  }

  if (belowMin && input.consecutiveBelowMin >= 1) {
    return {
      action: 'reduce',
      weightKg: roundToIncrement(lastWeight * (1 - PROGRESSION.reducePct), increment),
      targetReps: repMin,
      reason: 'reduceBelowMinTwice',
    };
  }

  if (allAtMax && !anyRpe10) {
    return {
      action: 'increase',
      weightKg: Math.round((lastWeight + increment) * 100) / 100,
      targetReps: repMin,
      reason: 'increaseAllMax',
    };
  }

  if (anyRpe10) {
    return { action: 'hold', weightKg: lastWeight, targetReps: repMin, reason: 'holdRpe10' };
  }

  if (input.e1rmStallSessions >= PROGRESSION.e1rmStallSessions) {
    return {
      action: 'deload',
      weightKg: roundToIncrement(lastWeight * (1 - PROGRESSION.deloadPct), increment),
      targetReps: repMin,
      reason: 'deloadStalled',
    };
  }

  if (belowMin) {
    return { action: 'hold', weightKg: lastWeight, targetReps: repMin, reason: 'holdBelowMinOnce' };
  }

  const nextReps = Math.min(repMax, minReps + 1);
  return {
    action: 'hold_add_rep',
    weightKg: lastWeight,
    targetReps: nextReps,
    reason: 'addRep',
  };
}
