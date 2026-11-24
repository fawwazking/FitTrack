import { WORKOUT_DEFAULTS } from '../config';

export interface TemplateDay {
  name: string;
  weekday: number;
  exercises: string[];
}

const FULL_A = ['Back Squat', 'Bench Press', 'Barbell Row', 'Overhead Press', 'Leg Curl', 'Plank'];
const FULL_B = ['Deadlift', 'Dumbbell Shoulder Press', 'Lat Pulldown', 'Walking Lunge', 'Dumbbell Curl', 'Cable Crunch'];
const UPPER = ['Bench Press', 'Barbell Row', 'Overhead Press', 'Lat Pulldown', 'Lateral Raise', 'Triceps Pushdown'];
const LOWER = ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Calf Raise', 'Plank'];
const PUSH = ['Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Lateral Raise', 'Triceps Pushdown', 'Chest Fly'];
const PULL = ['Deadlift', 'Pull Up', 'Seated Cable Row', 'Face Pull', 'Barbell Curl', 'Hammer Curl'];
const LEGS = ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Calf Raise', 'Hanging Leg Raise'];

export interface TemplateDefinition {
  name: string;
  sessionsPerWeek: number;
  days: TemplateDay[];
  note?: string;
}

/** PRD 7.7. */
export function templateForFrequency(sessionsPerWeek: number): TemplateDefinition {
  const n = Math.max(0, Math.min(7, Math.round(sessionsPerWeek)));
  switch (n) {
    case 0:
      return { name: 'Belum ada program', sessionsPerWeek: 0, days: [], note: 'Mulai dari 2-3x per minggu.' };
    case 1:
      return {
        name: 'Full Body',
        sessionsPerWeek: 1,
        days: [
          { name: 'Full Body', weekday: 0, exercises: FULL_A },
        ],
      };
    case 2:
      return {
        name: 'Full Body A/B',
        sessionsPerWeek: 2,
        days: [
          { name: 'Full Body A', weekday: 0, exercises: FULL_A },
          { name: 'Full Body B', weekday: 3, exercises: FULL_B },
        ],
      };
    case 3:
      return {
        name: 'Full Body A/B/A',
        sessionsPerWeek: 3,
        days: [
          { name: 'Full Body A', weekday: 0, exercises: FULL_A },
          { name: 'Full Body B', weekday: 2, exercises: FULL_B },
          { name: 'Full Body A', weekday: 4, exercises: FULL_A },
        ],
      };
    case 4:
      return {
        name: 'Upper/Lower',
        sessionsPerWeek: 4,
        days: [
          { name: 'Upper 1', weekday: 0, exercises: UPPER },
          { name: 'Lower 1', weekday: 1, exercises: LOWER },
          { name: 'Upper 2', weekday: 3, exercises: UPPER },
          { name: 'Lower 2', weekday: 4, exercises: LOWER },
        ],
      };
    case 5:
      return {
        name: 'Upper/Lower + PPL',
        sessionsPerWeek: 5,
        days: [
          { name: 'Upper', weekday: 0, exercises: UPPER },
          { name: 'Lower', weekday: 1, exercises: LOWER },
          { name: 'Push', weekday: 2, exercises: PUSH },
          { name: 'Pull', weekday: 4, exercises: PULL },
          { name: 'Legs', weekday: 5, exercises: LEGS },
        ],
      };
    case 6:
      return {
        name: 'Push/Pull/Legs',
        sessionsPerWeek: 6,
        days: [
          { name: 'Push 1', weekday: 0, exercises: PUSH },
          { name: 'Pull 1', weekday: 1, exercises: PULL },
          { name: 'Legs 1', weekday: 2, exercises: LEGS },
          { name: 'Push 2', weekday: 3, exercises: PUSH },
          { name: 'Pull 2', weekday: 4, exercises: PULL },
          { name: 'Legs 2', weekday: 5, exercises: LEGS },
        ],
      };
    default:
      return {
        name: 'Push/Pull/Legs x2',
        sessionsPerWeek: 7,
        days: [
          { name: 'Push 1', weekday: 0, exercises: PUSH },
          { name: 'Pull 1', weekday: 1, exercises: PULL },
          { name: 'Legs 1', weekday: 2, exercises: LEGS },
          { name: 'Push 2', weekday: 3, exercises: PUSH },
          { name: 'Pull 2', weekday: 4, exercises: PULL },
          { name: 'Legs 2', weekday: 5, exercises: LEGS },
        ],
        note: 'Sisakan minimal 1 hari istirahat penuh per minggu.',
      };
  }
}

export function defaultSetsForExercise(isCompound: boolean): number {
  return isCompound ? WORKOUT_DEFAULTS.compoundSets : WORKOUT_DEFAULTS.isolationSets;
}

export function defaultRestForExercise(isCompound: boolean): number {
  return isCompound ? WORKOUT_DEFAULTS.restCompoundSeconds : WORKOUT_DEFAULTS.restIsolationSeconds;
}
