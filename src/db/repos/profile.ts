import { and, desc, eq, isNull, lte } from 'drizzle-orm';
import {
  FAT_DEFAULT_PCT,
  PROTEIN_G_PER_KG,
  type ActivityLevel,
  type Goal,
  type Pace,
  type Sex,
} from '../../config';
import { computeCalorieTarget, computeMacros } from '../../domain/nutrition';
import type { CalorieTargetResult, MacroResult } from '../../domain/types';
import { addDaysISO, parseLocalDate, toLocalDateISO, todayISO } from '../../domain/dates';
import type { ProfileFormValues } from '../../validation';
import { getDb, getMeta, newId, nowISO, setMeta } from '../db';
import {
  goalSetting,
  nutritionTarget,
  userProfile,
  type GoalSettingRow,
  type NutritionTargetRow,
  type UserProfileRow,
} from '../schema';
import { upsertWeight, getLatestWeight } from './weight';

export interface ProfileBundle {
  profile: UserProfileRow;
  goal: GoalSettingRow;
  target: NutritionTargetRow | null;
  latestWeightKg: number | null;
}

export interface OnboardingInput extends ProfileFormValues {
  goal: Goal;
  pace: Pace;
  disclaimerAcceptedAt: string;
}

export interface ComputedTarget {
  result: CalorieTargetResult;
  macros: MacroResult;
}

export function birthDateFromAge(age: number, today = todayISO()): string {
  const date = parseLocalDate(today);
  date.setFullYear(date.getFullYear() - age);
  return toLocalDateISO(date);
}

export function ageFromBirthDate(birthDate: string, today = todayISO()): number {
  const birth = parseLocalDate(birthDate);
  const ref = parseLocalDate(today);
  let age = ref.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    ref.getMonth() < birth.getMonth() ||
    (ref.getMonth() === birth.getMonth() && ref.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function hasProfile(): boolean {
  return getProfileRow() !== null;
}

export function getProfileRow(): UserProfileRow | null {
  const row = getDb()
    .select()
    .from(userProfile)
    .where(isNull(userProfile.deletedAt))
    .orderBy(desc(userProfile.createdAt))
    .limit(1)
    .get();
  return row ?? null;
}

export function getActiveGoal(profileId: string): GoalSettingRow | null {
  const row = getDb()
    .select()
    .from(goalSetting)
    .where(and(eq(goalSetting.profileId, profileId), isNull(goalSetting.deletedAt)))
    .orderBy(desc(goalSetting.createdAt))
    .limit(1)
    .get();
  return row ?? null;
}

export function getTargetForDate(goalId: string, date: string): NutritionTargetRow | null {
  const row = getDb()
    .select()
    .from(nutritionTarget)
    .where(
      and(
        eq(nutritionTarget.goalSettingId, goalId),
        isNull(nutritionTarget.deletedAt),
        lte(nutritionTarget.effectiveDate, date),
      ),
    )
    .orderBy(desc(nutritionTarget.effectiveDate), desc(nutritionTarget.createdAt))
    .limit(1)
    .get();
  return row ?? null;
}

export function getProfileBundle(date = todayISO()): ProfileBundle | null {
  const profile = getProfileRow();
  if (!profile) return null;
  const goal = getActiveGoal(profile.id);
  if (!goal) return null;
  return {
    profile,
    goal,
    target: getTargetForDate(goal.id, date),
    latestWeightKg: getLatestWeight()?.weightKg ?? null,
  };
}

export function computeTarget(
  input: {
    sex: Sex;
    age: number;
    heightCm: number;
    sessionsPerWeek: number;
    activityLevel: ActivityLevel;
    weightKg: number;
  },
  goal: Goal,
  pace: Pace,
): ComputedTarget {
  const result = computeCalorieTarget({ ...input, goal, pace });
  const macros = computeMacros({ calories: result.calories, weightKg: input.weightKg, goal });
  return { result, macros };
}

function insertTarget(input: {
  goalSettingId: string;
  date: string;
  computed: ComputedTarget;
  goal: Goal;
  reason: 'onboarding' | 'weight_change' | 'goal_change' | 'weekly_review' | 'manual';
}): NutritionTargetRow {
  const db = getDb();
  const now = nowISO();
  const row: NutritionTargetRow = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    goalSettingId: input.goalSettingId,
    effectiveDate: input.date,
    bmr: input.computed.result.bmr,
    tdee: input.computed.result.tdee,
    calories: input.computed.result.calories,
    proteinG: input.computed.macros.proteinG,
    carbsG: input.computed.macros.carbsG,
    fatG: input.computed.macros.fatG,
    proteinGPerKg: PROTEIN_G_PER_KG[input.goal],
    fatPct: FAT_DEFAULT_PCT,
    reason: input.reason,
  };
  db.insert(nutritionTarget).values(row).run();
  return row;
}

export function saveOnboarding(input: OnboardingInput): { profileId: string; goalId: string; targetId: string } {
  const db = getDb();
  const now = nowISO();
  const today = todayISO();
  const birthDate = birthDateFromAge(input.age, today);

  const profileId = newId();
  db.insert(userProfile)
    .values({
      id: profileId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      sex: input.sex,
      birthDate,
      heightCm: input.heightCm,
      activityLevel: input.activityLevel,
      sessionsPerWeek: input.sessionsPerWeek,
      units: 'metric',
      weekStartDay: 1,
      disclaimerAcceptedAt: input.disclaimerAcceptedAt,
    })
    .run();

  const goalId = newId();
  db.insert(goalSetting)
    .values({
      id: goalId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      profileId,
      goal: input.goal,
      pace: input.pace,
      startDate: today,
      referenceWeightKg: input.weightKg,
      manualOverride: 0,
    })
    .run();

  upsertWeight(today, input.weightKg, null);

  const computed = computeTarget(
    {
      sex: input.sex,
      age: input.age,
      heightCm: input.heightCm,
      sessionsPerWeek: input.sessionsPerWeek,
      activityLevel: input.activityLevel,
      weightKg: input.weightKg,
    },
    input.goal,
    input.pace,
  );

  const target = insertTarget({ goalSettingId: goalId, date: today, computed, goal: input.goal, reason: 'onboarding' });
  return { profileId, goalId, targetId: target.id };
}

export function updateProfile(input: ProfileFormValues): NutritionTargetRow | null {
  const bundle = getProfileBundle();
  if (!bundle) return null;
  const db = getDb();
  const now = nowISO();
  const today = todayISO();
  const previousWeight = bundle.latestWeightKg;
  const weightChanged = previousWeight === null || Math.abs(previousWeight - input.weightKg) >= 0.05;

  db.update(userProfile)
    .set({
      sex: input.sex,
      birthDate: birthDateFromAge(input.age, today),
      heightCm: input.heightCm,
      activityLevel: input.activityLevel,
      sessionsPerWeek: input.sessionsPerWeek,
      updatedAt: now,
    })
    .where(eq(userProfile.id, bundle.profile.id))
    .run();

  if (weightChanged) upsertWeight(today, input.weightKg, null);

  db.update(goalSetting)
    .set({ referenceWeightKg: input.weightKg, updatedAt: now, manualOverride: 0 })
    .where(eq(goalSetting.id, bundle.goal.id))
    .run();

  const computed = computeTarget(
    {
      sex: input.sex,
      age: input.age,
      heightCm: input.heightCm,
      sessionsPerWeek: input.sessionsPerWeek,
      activityLevel: input.activityLevel,
      weightKg: input.weightKg,
    },
    bundle.goal.goal as Goal,
    bundle.goal.pace as Pace,
  );

  return insertTarget({
    goalSettingId: bundle.goal.id,
    date: today,
    computed,
    goal: bundle.goal.goal as Goal,
    reason: weightChanged ? 'weight_change' : 'goal_change',
  });
}

export function updateGoalAndTarget(goal: Goal, pace: Pace): NutritionTargetRow | null {
  const bundle = getProfileBundle();
  if (!bundle) return null;
  const db = getDb();
  const now = nowISO();
  const weightKg = bundle.latestWeightKg ?? bundle.goal.referenceWeightKg;
  const today = todayISO();

  db.update(goalSetting)
    .set({
      goal,
      pace,
      referenceWeightKg: weightKg,
      startDate: bundle.goal.startDate,
      manualOverride: 0,
      updatedAt: now,
    })
    .where(eq(goalSetting.id, bundle.goal.id))
    .run();

  const computed = computeTarget(
    {
      sex: bundle.profile.sex as Sex,
      age: ageFromBirthDate(bundle.profile.birthDate, today),
      heightCm: bundle.profile.heightCm,
      sessionsPerWeek: bundle.profile.sessionsPerWeek,
      activityLevel: bundle.profile.activityLevel as ActivityLevel,
      weightKg,
    },
    goal,
    pace,
  );

  return insertTarget({ goalSettingId: bundle.goal.id, date: today, computed, goal, reason: 'goal_change' });
}

export function setManualTarget(calories: number): NutritionTargetRow | null {
  const bundle = getProfileBundle();
  if (!bundle) return null;
  const db = getDb();
  const goal = bundle.goal.goal as Goal;
  const weightKg = bundle.latestWeightKg ?? bundle.goal.referenceWeightKg;
  const macros = computeMacros({ calories, weightKg, goal });
  const target = bundle.target;

  db.update(goalSetting)
    .set({ manualOverride: 1, referenceWeightKg: weightKg, updatedAt: nowISO() })
    .where(eq(goalSetting.id, bundle.goal.id))
    .run();

  const row: NutritionTargetRow = {
    id: newId(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
    deletedAt: null,
    goalSettingId: bundle.goal.id,
    effectiveDate: todayISO(),
    bmr: target?.bmr ?? computeCalorieTarget({
      sex: bundle.profile.sex as Sex,
      age: ageFromBirthDate(bundle.profile.birthDate),
      heightCm: bundle.profile.heightCm,
      sessionsPerWeek: bundle.profile.sessionsPerWeek,
      activityLevel: bundle.profile.activityLevel as ActivityLevel,
      weightKg,
      goal,
      pace: bundle.goal.pace as Pace,
    }).bmr,
    tdee: target?.tdee ?? 0,
    calories,
    proteinG: macros.proteinG,
    carbsG: macros.carbsG,
    fatG: macros.fatG,
    proteinGPerKg: PROTEIN_G_PER_KG[goal],
    fatPct: FAT_DEFAULT_PCT,
    reason: 'manual',
  };
  db.insert(nutritionTarget).values(row).run();
  return row;
}

export function getTargetHistory(limit = 12): NutritionTargetRow[] {
  const bundle = getProfileBundle();
  if (!bundle) return [];
  return getDb()
    .select()
    .from(nutritionTarget)
    .where(and(eq(nutritionTarget.goalSettingId, bundle.goal.id), isNull(nutritionTarget.deletedAt)))
    .orderBy(desc(nutritionTarget.effectiveDate), desc(nutritionTarget.createdAt))
    .limit(limit)
    .all();
}

const REJECT_META_DATE = 'recalc_rejected_on';
const REJECT_META_WEIGHT = 'recalc_rejected_weight';

export interface RecalculationSuggestion {
  bundle: ProfileBundle;
  latestWeightKg: number;
  computed: ComputedTarget;
  weightDeltaKg: number;
}

/**
 * Offers a recalculated target when weight moved >= 1 kg since the active
 * target. A rejection silences it for 7 days unless weight moved >= 2 kg.
 * PRD 7.5.
 */
export function getRecalculationSuggestion(): RecalculationSuggestion | null {
  const bundle = getProfileBundle();
  if (!bundle) return null;
  const latest = getLatestWeight();
  if (!latest) return null;

  const delta = latest.weightKg - bundle.goal.referenceWeightKg;
  if (Math.abs(delta) < 1) return null;

  const rejectedOn = getMeta(REJECT_META_DATE);
  const rejectedWeight = Number(getMeta(REJECT_META_WEIGHT) ?? '');
  if (rejectedOn && addDaysISO(rejectedOn, 7) > todayISO()) {
    if (Number.isFinite(rejectedWeight) && Math.abs(latest.weightKg - rejectedWeight) < 2) return null;
  }

  const computed = computeTarget(
    {
      sex: bundle.profile.sex as Sex,
      age: ageFromBirthDate(bundle.profile.birthDate),
      heightCm: bundle.profile.heightCm,
      sessionsPerWeek: bundle.profile.sessionsPerWeek,
      activityLevel: bundle.profile.activityLevel as ActivityLevel,
      weightKg: latest.weightKg,
    },
    bundle.goal.goal as Goal,
    bundle.goal.pace as Pace,
  );

  return { bundle, latestWeightKg: latest.weightKg, computed, weightDeltaKg: delta };
}

export function acceptRecalculation(): NutritionTargetRow | null {
  const suggestion = getRecalculationSuggestion();
  if (!suggestion) return null;
  const db = getDb();
  db.update(goalSetting)
    .set({
      referenceWeightKg: suggestion.latestWeightKg,
      manualOverride: 0,
      updatedAt: nowISO(),
    })
    .where(eq(goalSetting.id, suggestion.bundle.goal.id))
    .run();
  setMeta(REJECT_META_DATE, null);
  setMeta(REJECT_META_WEIGHT, null);
  return insertTarget({
    goalSettingId: suggestion.bundle.goal.id,
    date: todayISO(),
    computed: suggestion.computed,
    goal: suggestion.bundle.goal.goal as Goal,
    reason: 'weight_change',
  });
}

export function rejectRecalculation(): void {
  const latest = getLatestWeight();
  setMeta(REJECT_META_DATE, todayISO());
  setMeta(REJECT_META_WEIGHT, String(latest?.weightKg ?? 0));
}
