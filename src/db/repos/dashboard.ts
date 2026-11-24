import { addDaysISO, todayISO } from '../../domain/dates';
import type { DayTotals, MealGroup } from './food';
import { groupMeals, sumEntries } from './food';
import type { ProfileBundle } from './profile';
import { getProfileBundle } from './profile';
import type { WeightLogRow } from '../schema';
import { getLatestWeight } from './weight';
import type { PrEvent } from './workout';
import {
  getActiveSession,
  getPrEvents,
  getProgramDayExerciseCount,
  getTodayProgramDay,
} from './workout';

export interface TodayProgramInfo {
  programId: string;
  programName: string;
  programDayId: string;
  dayName: string;
  exerciseCount: number;
}

export interface DashboardData {
  bundle: ProfileBundle | null;
  groups: MealGroup[];
  totals: DayTotals;
  todayProgram: TodayProgramInfo | null;
  activeSessionId: string | null;
  latestWeight: WeightLogRow | null;
  recentPrs: PrEvent[];
}

export function getDashboard(date = todayISO()): DashboardData {
  const groups = groupMeals(date);
  const entries = groups.flatMap((group) => group.entries);
  const today = getTodayProgramDay(date);
  return {
    bundle: getProfileBundle(date),
    groups,
    totals: sumEntries(entries),
    todayProgram: today
      ? {
          programId: today.program.id,
          programName: today.program.name,
          programDayId: today.day.id,
          dayName: today.day.name,
          exerciseCount: getProgramDayExerciseCount(today.day.id),
        }
      : null,
    activeSessionId: getActiveSession()?.id ?? null,
    latestWeight: getLatestWeight(),
    recentPrs: getPrEvents({ sinceDate: addDaysISO(date, -7) })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      .slice(0, 5),
  };
}
