import type { Goal } from '../config';

export interface WeeklyEvalInput {
  /** Average weight of the last 7-day window (kg). */
  currentAvg: number;
  /** Average weight of the previous 7-day window (kg). */
  previousAvg: number;
  goal: Goal;
  /** Current target calories (kcal/day). */
  targetKcal: number;
  /** Minimum calories (cutting floor). */
  minKcal: number;
  /** Number of weight entries in the current week. */
  weightEntries: number;
  /** Number of days with food logged in the current week. */
  foodDays: number;
}

export type WeeklyEvalAction = 'add_kcal' | 'reduce_kcal' | 'add_activity' | 'improve_adherence' | 'on_track' | 'insufficient_data';

export interface WeeklyEvalResult {
  action: WeeklyEvalAction;
  /** Calorie adjustment (+/- kcal), 0 if on_track. */
  adjustmentKcal: number;
  /** New target calories if adjustment is applied. */
  newTargetKcal: number;
  /** Weekly weight change as fraction of previous average. */
  weeklyRate: number;
  /** Human-readable explanation. */
  reason: string;
}

/** PRD 7.10: weekly weight-trend evaluation and calorie adjustment. */
export function evaluateWeekly(input: WeeklyEvalInput): WeeklyEvalResult {
  const { currentAvg, previousAvg, goal, targetKcal, minKcal, weightEntries, foodDays } = input;

  // Insufficient data: need >= 4 weight entries AND >= 4 food days
  if (weightEntries < 4 || foodDays < 4) {
    return {
      action: 'insufficient_data',
      adjustmentKcal: 0,
      newTargetKcal: targetKcal,
      weeklyRate: 0,
      reason: 'Data belum cukup: minimal 4 entri berat dan 4 hari makanan tercatat per minggu.',
    };
  }

  if (previousAvg <= 0) {
    return {
      action: 'insufficient_data',
      adjustmentKcal: 0,
      newTargetKcal: targetKcal,
      weeklyRate: 0,
      reason: 'Rata-rata berat minggu sebelumnya tidak tersedia.',
    };
  }

  const weeklyRate = (currentAvg - previousAvg) / previousAvg;

  // Determine expected range per goal (PRD 7.10)
  let low: number, high: number;
  if (goal === 'bulking') {
    low = 0.0015;
    high = 0.005;
  } else if (goal === 'cutting') {
    low = -0.01;
    high = -0.0025;
  } else {
    // recomp
    low = -0.0025;
    high = 0.0025;
  }

  // Check if rate is within range
  const inRange = weeklyRate >= low && weeklyRate <= high;

  if (inRange) {
    return {
      action: 'on_track',
      adjustmentKcal: 0,
      newTargetKcal: targetKcal,
      weeklyRate,
      reason: `Sesuai target (${(weeklyRate * 100).toFixed(1)}% BB/minggu).`,
    };
  }

  // Out of range: suggest adjustment
  let adjustmentKcal: number;
  let action: WeeklyEvalAction;
  let reason: string;

  if (goal === 'bulking') {
    if (weeklyRate < low) {
      // Gaining too slow
      adjustmentKcal = 150;
      action = 'add_kcal';
      reason = 'Kenaikan berat terlalu lambat. Tambah 150 kcal/hari.';
    } else {
      // Gaining too fast
      adjustmentKcal = -150;
      action = 'reduce_kcal';
      reason = 'Kenaikan berat terlalu cepat. Kurangi 150 kcal/hari.';
    }
  } else if (goal === 'cutting') {
    if (weeklyRate > high) {
      // Losing too slow (closer to 0 or positive)
      adjustmentKcal = -150;
      action = 'reduce_kcal';
      reason = 'Penurunan berat terlalu lambat. Kurangi 150 kcal/hari atau tambah aktivitas.';
    } else {
      // Losing too fast (more negative than -1%)
      adjustmentKcal = 150;
      action = 'add_kcal';
      reason = 'Penurunan berat terlalu cepat. Tambah 150 kcal/hari.';
    }
  } else {
    // recomp
    if (weeklyRate > high) {
      adjustmentKcal = -100;
      action = 'reduce_kcal';
      reason = 'Naik terlalu cepat untuk recomp. Kurangi 100 kcal/hari.';
    } else if (weeklyRate < low) {
      adjustmentKcal = 100;
      action = 'add_kcal';
      reason = 'Turun terlalu cepat untuk recomp. Tambah 100 kcal/hari.';
    } else {
      // Shouldn't reach here if inRange, but safe fallback
      adjustmentKcal = 0;
      action = 'on_track';
      reason = 'Sesuai target.';
    }
  }

  // Apply min kcal floor (cutting)
  const newTargetKcal = Math.max(targetKcal + adjustmentKcal, minKcal);
  const clamped = newTargetKcal !== targetKcal + adjustmentKcal;
  if (clamped) {
    reason += ' (Terbatas oleh batas minimum kalori.)';
  }

  return {
    action,
    adjustmentKcal: newTargetKcal - targetKcal,
    newTargetKcal,
    weeklyRate,
    reason,
  };
}
