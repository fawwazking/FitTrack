import { WORKOUT_DEFAULTS } from '../../config';
import { and, asc, desc, eq, gte, inArray, isNull, lte } from 'drizzle-orm';
import type { PrType, ProgressionPlan, WorkSetInput } from '../../domain/types';
import { addDaysISO, diffDaysISO, todayISO, weekdayIndex } from '../../domain/dates';
import {
  detectSetPrs,
  epley1Rm,
  isVolumePr,
  planNextSession,
  sessionVolume,
  workSets,
} from '../../domain/progression';
import { SEED_EXERCISES } from '../../data/exercises';
import { defaultRestForExercise, defaultSetsForExercise, templateForFrequency, type TemplateDefinition } from '../../data/templates';
import { getDb, getSqlite, isWeb, newId, nowISO, normalizeSearch } from '../db';
import {
  exercise,
  programDay,
  programDayExercise,
  sessionExercise,
  setLog,
  workoutProgram,
  workoutSession,
  appSettings,
  type ExerciseRow,
  type ProgramDayExerciseRow,
  type ProgramDayRow,
  type SessionExerciseRow,
  type SetLogRow,
  type WorkoutProgramRow,
  type WorkoutSessionRow,
} from '../schema';

export interface ProgramExerciseItem {
  row: ProgramDayExerciseRow;
  exercise: ExerciseRow;
}

export interface ProgramDayDetail {
  row: ProgramDayRow;
  exercises: ProgramExerciseItem[];
}

export interface ProgramDetail {
  program: WorkoutProgramRow;
  days: ProgramDayDetail[];
}

export interface PastSession {
  sessionId: string;
  date: string;
  startedAt: string;
  sets: SetLogRow[];
}

export interface SessionExerciseDetail {
  row: SessionExerciseRow;
  exercise: ExerciseRow;
  sets: SetLogRow[];
  lastSets: WorkSetInput[];
  lastDate: string | null;
  suggestion: ProgressionPlan | null;
}

export interface SessionDetail {
  session: WorkoutSessionRow;
  exercises: SessionExerciseDetail[];
}

export interface PrEvent {
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  type: PrType;
  weightKg: number;
  reps: number;
}

export interface SessionSummary {
  session: WorkoutSessionRow;
  totalVolume: number;
  totalWorkingSets: number;
  durationSeconds: number;
  prs: PrEvent[];
}

export interface ExerciseStat {
  sessionId: string;
  date: string;
  topWeightKg: number;
  topReps: number;
  bestE1rm: number | null;
  volume: number;
  totalReps: number;
}

export function listExercises(query = '', limit = 80): ExerciseRow[] {
  if (isWeb) {
    const normalized = normalizeSearch(query);
    const filtered = SEED_EXERCISES.filter((ex) => {
      if (!normalized) return true;
      return ex.name.toLowerCase().includes(normalized) || ex.nameEn.toLowerCase().includes(normalized);
    });
    return filtered.slice(0, limit).map((ex, i) => ({
      id: `seed-ex-${i}-${ex.name}`,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      deletedAt: null,
      name: ex.name,
      nameEn: ex.nameEn,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      defaultRepMin: ex.repMin,
      defaultRepMax: ex.repMax,
      incrementKg: ex.incrementKg,
      isCustom: 0,
      isCompound: ex.isCompound ? 1 : 0,
      searchText: `${ex.name} ${ex.nameEn}`.toLowerCase(),
    }));
  }
  const rows = getDb()
    .select()
    .from(exercise)
    .where(isNull(exercise.deletedAt))
    .orderBy(asc(exercise.muscleGroup), asc(exercise.name))
    .all();
  const normalized = normalizeSearch(query);
  const filtered = normalized ? rows.filter((row) => row.searchText.includes(normalized)) : rows;
  return filtered.slice(0, limit);
}

export function getExercise(id: string): ExerciseRow | null {
  if (isWeb) {
    const idx = parseInt(id.replace('seed-ex-', '').split('-')[0] || '0', 10);
    const ex = SEED_EXERCISES[idx];
    if (!ex) return null;
    return {
      id: `seed-ex-${idx}-${ex.name}`,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      deletedAt: null,
      name: ex.name,
      nameEn: ex.nameEn,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      defaultRepMin: ex.repMin,
      defaultRepMax: ex.repMax,
      incrementKg: ex.incrementKg,
      isCustom: 0,
      isCompound: ex.isCompound ? 1 : 0,
      searchText: `${ex.name} ${ex.nameEn}`.toLowerCase(),
    };
  }
  return (
    getDb()
      .select()
      .from(exercise)
      .where(and(eq(exercise.id, id), isNull(exercise.deletedAt)))
      .get() ?? null
  );
}

export function createCustomExercise(input: {
  name: string;
  muscleGroup: string;
  equipment: string;
}): ExerciseRow {
  if (isWeb) {
    return {
      id: `custom-ex-${Date.now()}`,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      deletedAt: null,
      name: input.name,
      nameEn: input.name,
      muscleGroup: input.muscleGroup,
      equipment: input.equipment,
      defaultRepMin: 8,
      defaultRepMax: 12,
      incrementKg: 2,
      isCustom: 1,
      isCompound: 0,
      searchText: input.name.toLowerCase(),
    };
  }
  const now = nowISO();
  const row: ExerciseRow = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    name: input.name.trim(),
    nameEn: null,
    muscleGroup: input.muscleGroup,
    equipment: input.equipment,
    defaultRepMin: 8,
    defaultRepMax: 12,
    incrementKg: 2.5,
    isCustom: 1,
    isCompound: 0,
    searchText: normalizeSearch(`${input.name} ${input.muscleGroup} ${input.equipment}`),
  };
  getDb().insert(exercise).values(row).run();
  return row;
}

function setActiveProgramId(programId: string | null): void {
  getSqlite().runSync('UPDATE app_settings SET active_program_id = ? WHERE id = ?', [programId, 'app']);
}

export function createProgramFromTemplate(
  sessionsPerWeek: number,
  options: { name?: string; activate?: boolean } = {},
): string | null {
  const template = templateForFrequency(sessionsPerWeek);
  if (template.days.length === 0) return null;
  if (isWeb) {
    const id = `web-program-${Date.now()}`;
    saveWebProgram(id, template, options.name?.trim() || template.name, sessionsPerWeek);
    if (options.activate !== false) setWebActiveProgram(id);
    return id;
  }

  const db = getDb();
  const now = nowISO();
  const programId = newId();
  const names = [...new Set(template.days.flatMap((day) => day.exercises))];
  const exercises = db
    .select()
    .from(exercise)
    .where(and(inArray(exercise.name, names), isNull(exercise.deletedAt)))
    .all();
  const byName = new Map(exercises.map((row) => [row.name, row]));

  getSqlite().withTransactionSync(() => {
    if (options.activate !== false) {
      db.update(workoutProgram).set({ isActive: 0, updatedAt: now }).where(eq(workoutProgram.isActive, 1)).run();
    }
    db.insert(workoutProgram)
      .values({
        id: programId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        name: options.name?.trim() || template.name,
        template: template.name,
        sessionsPerWeek: template.sessionsPerWeek,
        isActive: options.activate === false ? 0 : 1,
      })
      .run();

    template.days.forEach((day, dayIndex) => {
      const dayId = newId();
      db.insert(programDay)
        .values({
          id: dayId,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          programId,
          name: day.name,
          orderIndex: dayIndex,
          weekday: day.weekday,
        })
        .run();
      day.exercises.forEach((exerciseName, index) => {
        const found = byName.get(exerciseName);
        if (!found) return;
        db.insert(programDayExercise)
          .values({
            id: newId(),
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            programDayId: dayId,
            exerciseId: found.id,
            orderIndex: index,
            targetSets: defaultSetsForExercise(found.isCompound === 1),
            repMin: found.defaultRepMin,
            repMax: found.defaultRepMax,
            restSeconds: defaultRestForExercise(found.isCompound === 1),
          })
          .run();
      });
    });
  });

  if (options.activate !== false) setActiveProgramId(programId);
  return programId;
}

export function getActiveProgramId(): string | null {
  if (isWeb) return getWebActiveProgram();
  const settings = getDb()
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, 'app'))
    .get();
  if (settings?.activeProgramId) return settings.activeProgramId;
  const active = getDb()
    .select()
    .from(workoutProgram)
    .where(and(isNull(workoutProgram.deletedAt), eq(workoutProgram.isActive, 1)))
    .orderBy(desc(workoutProgram.createdAt))
    .limit(1)
    .get();
  return active?.id ?? null;
}

export function listPrograms(): WorkoutProgramRow[] {
  if (isWeb) {
    return getWebPrograms().map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: null,
      name: p.name,
      template: p.template,
      sessionsPerWeek: p.sessionsPerWeek,
      isActive: p.isActive ? 1 : 0,
    }));
  }
  return getDb()
    .select()
    .from(workoutProgram)
    .where(isNull(workoutProgram.deletedAt))
    .orderBy(desc(workoutProgram.createdAt))
    .all();
}

export function getProgramDetail(programId: string): ProgramDetail | null {
  if (isWeb) {
    return getWebProgramDetail(programId);
  }
  const db = getDb();
  const program = db
    .select()
    .from(workoutProgram)
    .where(and(eq(workoutProgram.id, programId), isNull(workoutProgram.deletedAt)))
    .get();
  if (!program) return null;
  const days = db
    .select()
    .from(programDay)
    .where(and(eq(programDay.programId, programId), isNull(programDay.deletedAt)))
    .orderBy(asc(programDay.orderIndex))
    .all();
  if (days.length === 0) return { program, days: [] };

  const dayIds = days.map((day) => day.id);
  const items = db
    .select()
    .from(programDayExercise)
    .where(and(inArray(programDayExercise.programDayId, dayIds), isNull(programDayExercise.deletedAt)))
    .orderBy(asc(programDayExercise.orderIndex))
    .all();
  const exerciseIds = [...new Set(items.map((item) => item.exerciseId))];
  const exercises = exerciseIds.length
    ? db
        .select()
        .from(exercise)
        .where(and(inArray(exercise.id, exerciseIds), isNull(exercise.deletedAt)))
        .all()
    : [];
  const byId = new Map(exercises.map((row) => [row.id, row]));

  return {
    program,
    days: days.map((day) => ({
      row: day,
      exercises: items
        .filter((item) => item.programDayId === day.id)
        .map((item) => ({ row: item, exercise: byId.get(item.exerciseId) }))
        .filter((item): item is ProgramExerciseItem => Boolean(item.exercise)),
    })),
  };
}

export function getActiveProgramDetail(): ProgramDetail | null {
  if (isWeb) {
    const activeId = getWebActiveProgram();
    if (!activeId) return null;
    return getWebProgramDetail(activeId);
  }
  const id = getActiveProgramId();
  return id ? getProgramDetail(id) : null;
}

export function setActiveProgram(programId: string): void {
  if (isWeb) {
    setWebActiveProgram(programId);
    return;
  }
  const now = nowISO();
  const db = getDb();
  db.update(workoutProgram).set({ isActive: 0, updatedAt: now }).where(eq(workoutProgram.isActive, 1)).run();
  db.update(workoutProgram).set({ isActive: 1, updatedAt: now }).where(eq(workoutProgram.id, programId)).run();
  setActiveProgramId(programId);
}

export function renameProgram(programId: string, name: string): void {
  if (isWeb) {
    const programs = getWebPrograms();
    const program = programs.find((p) => p.id === programId);
    if (program) {
      program.name = name.trim();
      program.updatedAt = nowISO();
      localStorage.setItem(WEB_PROGRAMS_KEY, JSON.stringify(programs));
    }
    return;
  }
  getDb()
    .update(workoutProgram)
    .set({ name: name.trim(), updatedAt: nowISO() })
    .where(eq(workoutProgram.id, programId))
    .run();
}

export function deleteProgram(programId: string): void {
  if (isWeb) {
    const programs = getWebPrograms().filter((p) => p.id !== programId);
    localStorage.setItem(WEB_PROGRAMS_KEY, JSON.stringify(programs));
    if (getWebActiveProgram() === programId) localStorage.removeItem(WEB_ACTIVE_KEY);
    return;
  }
  const db = getDb();
  const now = nowISO();
  getSqlite().withTransactionSync(() => {
    const days = db
      .select()
      .from(programDay)
      .where(and(eq(programDay.programId, programId), isNull(programDay.deletedAt)))
      .all();
    for (const day of days) {
      db.update(programDayExercise)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(programDayExercise.programDayId, day.id))
        .run();
    }
    db.update(programDay).set({ deletedAt: now, updatedAt: now }).where(eq(programDay.programId, programId)).run();
    db.update(workoutProgram).set({ deletedAt: now, updatedAt: now, isActive: 0 }).where(eq(workoutProgram.id, programId)).run();
  });
  if (getActiveProgramId() === programId) setActiveProgramId(null);
}

export function duplicateProgram(programId: string): string | null {
  if (isWeb) {
    const detail = getWebProgramDetail(programId);
    if (!detail) return null;
    const newId = `web-program-${Date.now()}`;
    const programs = getWebPrograms();
    const program = programs.find((p) => p.id === programId);
    if (program) {
      const copy: WebProgramData = JSON.parse(JSON.stringify(program));
      copy.id = newId;
      copy.name = `${program.name} (salinan)`;
      copy.isActive = false;
      copy.createdAt = nowISO();
      copy.updatedAt = nowISO();
      programs.push(copy);
      localStorage.setItem(WEB_PROGRAMS_KEY, JSON.stringify(programs));
    }
    return newId;
  }
  const detail = getProgramDetail(programId);
  if (!detail) return null;
  const db = getDb();
  const now = nowISO();
  const newProgramId = newId();
  getSqlite().withTransactionSync(() => {
    db.insert(workoutProgram)
      .values({
        id: newProgramId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        name: `${detail.program.name} (salinan)`,
        template: detail.program.template,
        sessionsPerWeek: detail.program.sessionsPerWeek,
        isActive: 0,
      })
      .run();
    for (const day of detail.days) {
      const dayId = newId();
      db.insert(programDay)
        .values({
          ...day.row,
          id: dayId,
          programId: newProgramId,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      for (const item of day.exercises) {
        db.insert(programDayExercise)
          .values({
            ...item.row,
            id: newId(),
            programDayId: dayId,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }
    }
  });
  return newProgramId;
}

export function updateProgramDayExercise(
  id: string,
  patch: Partial<Pick<ProgramDayExerciseRow, 'targetSets' | 'repMin' | 'repMax' | 'restSeconds' | 'orderIndex'>>,
): void {
  if (isWeb) return;
  getDb()
    .update(programDayExercise)
    .set({ ...patch, updatedAt: nowISO() })
    .where(eq(programDayExercise.id, id))
    .run();
}

export function addProgramDayExercise(dayId: string, exerciseId: string): string {
  if (isWeb) return `web-pde-${Date.now()}`;
  const db = getDb();
  const now = nowISO();
  const ex = getExercise(exerciseId);
  const existing = db
    .select()
    .from(programDayExercise)
    .where(and(eq(programDayExercise.programDayId, dayId), isNull(programDayExercise.deletedAt)))
    .orderBy(desc(programDayExercise.orderIndex))
    .limit(1)
    .get();
  const id = newId();
  db.insert(programDayExercise)
    .values({
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      programDayId: dayId,
      exerciseId,
      orderIndex: (existing?.orderIndex ?? -1) + 1,
      targetSets: ex ? defaultSetsForExercise(ex.isCompound === 1) : 3,
      repMin: ex?.defaultRepMin ?? 8,
      repMax: ex?.defaultRepMax ?? 12,
      restSeconds: ex ? defaultRestForExercise(ex.isCompound === 1) : 90,
    })
    .run();
  return id;
}

export function removeProgramDayExercise(id: string): void {
  if (isWeb) return;
  const now = nowISO();
  getDb()
    .update(programDayExercise)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(programDayExercise.id, id))
    .run();
}

export function addProgramDay(programId: string, name: string, weekday: number | null = null): string {
  if (isWeb) return `web-pday-${Date.now()}`;
  const db = getDb();
  const now = nowISO();
  const last = db
    .select()
    .from(programDay)
    .where(and(eq(programDay.programId, programId), isNull(programDay.deletedAt)))
    .orderBy(desc(programDay.orderIndex))
    .limit(1)
    .get();
  const id = newId();
  db.insert(programDay)
    .values({
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      programId,
      name,
      orderIndex: (last?.orderIndex ?? -1) + 1,
      weekday,
    })
    .run();
  return id;
}

export function updateProgramDay(
  id: string,
  patch: Partial<Pick<ProgramDayRow, 'name' | 'weekday'>>,
): void {
  if (isWeb) return;
  getDb().update(programDay).set({ ...patch, updatedAt: nowISO() }).where(eq(programDay.id, id)).run();
}

export function getTodayProgramDay(date = todayISO()): { program: WorkoutProgramRow; day: ProgramDayRow } | null {
  if (isWeb) {
    const detail = getActiveProgramDetail();
    if (!detail) return null;
    const target = weekdayIndex(date);
    const day = detail.days.find((item) => item.row.weekday === target);
    return day ? { program: detail.program, day: day.row } : null;
  }
  const detail = getActiveProgramDetail();
  if (!detail) return null;
  const target = weekdayIndex(date);
  const day = detail.days.find((item) => item.row.weekday === target);
  return day ? { program: detail.program, day: day.row } : null;
}

export function getProgramDayExerciseCount(dayId: string): number {
  if (isWeb) {
    const detail = getActiveProgramDetail();
    if (!detail) return 0;
    const day = detail.days.find((item) => item.row.id === dayId);
    return day?.exercises.length ?? 0;
  }
  const row = getSqlite().getFirstSync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM program_day_exercise
     WHERE program_day_id = ? AND deleted_at IS NULL`,
    [dayId],
  );
  return row?.n ?? 0;
}

export function getActiveSession(): WorkoutSessionRow | null {
  if (isWeb) return null;
  return (
    getDb()
      .select()
      .from(workoutSession)
      .where(and(isNull(workoutSession.deletedAt), eq(workoutSession.status, 'active')))
      .orderBy(desc(workoutSession.startedAt))
      .limit(1)
      .get() ?? null
  );
}

export function startSession(options: { date?: string; programDayId?: string | null } = {}): string {
  if (isWeb) return 'web-session';
  const existing = getActiveSession();
  if (existing) return existing.id;
  const db = getDb();
  const now = nowISO();
  const date = options.date ?? todayISO();
  const sessionId = newId();

  const day = options.programDayId
    ? db
        .select()
        .from(programDay)
        .where(and(eq(programDay.id, options.programDayId), isNull(programDay.deletedAt)))
        .get()
    : null;

  getSqlite().withTransactionSync(() => {
    db.insert(workoutSession)
      .values({
        id: sessionId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        date,
        programDayId: day?.id ?? null,
        programDayName: day?.name ?? null,
        startedAt: now,
        endedAt: null,
        status: 'active',
        note: null,
      })
      .run();

    if (day) {
      const items = db
        .select()
        .from(programDayExercise)
        .where(and(eq(programDayExercise.programDayId, day.id), isNull(programDayExercise.deletedAt)))
        .orderBy(asc(programDayExercise.orderIndex))
        .all();
      items.forEach((item, index) => {
        db.insert(sessionExercise)
          .values({
            id: newId(),
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            sessionId,
            exerciseId: item.exerciseId,
            orderIndex: index,
            targetSets: item.targetSets,
            repMin: item.repMin,
            repMax: item.repMax,
            restSeconds: item.restSeconds,
          })
          .run();
      });
    }
  });
  return sessionId;
}

export function addExerciseToSession(sessionId: string, exerciseId: string): string {
  if (isWeb) return `web-se-${Date.now()}`;
  const db = getDb();
  const now = nowISO();
  const ex = getExercise(exerciseId);
  const last = db
    .select()
    .from(sessionExercise)
    .where(and(eq(sessionExercise.sessionId, sessionId), isNull(sessionExercise.deletedAt)))
    .orderBy(desc(sessionExercise.orderIndex))
    .limit(1)
    .get();
  const id = newId();
  db.insert(sessionExercise)
    .values({
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      sessionId,
      exerciseId,
      orderIndex: (last?.orderIndex ?? -1) + 1,
      targetSets: ex ? defaultSetsForExercise(ex.isCompound === 1) : 3,
      repMin: ex?.defaultRepMin ?? 8,
      repMax: ex?.defaultRepMax ?? 12,
      restSeconds: ex ? defaultRestForExercise(ex.isCompound === 1) : 90,
    })
    .run();
  return id;
}

export function removeSessionExercise(id: string): void {
  if (isWeb) return;
  const db = getDb();
  const now = nowISO();
  getSqlite().withTransactionSync(() => {
    db.update(setLog).set({ deletedAt: now, updatedAt: now }).where(eq(setLog.sessionExerciseId, id)).run();
    db.update(sessionExercise).set({ deletedAt: now, updatedAt: now }).where(eq(sessionExercise.id, id)).run();
  });
}

export function getSessionDetail(sessionId: string): SessionDetail | null {
  if (isWeb) {
    return {
      session: {
        id: sessionId,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        deletedAt: null,
        date: todayISO(),
        programDayId: null,
        programDayName: null,
        startedAt: nowISO(),
        endedAt: null,
        status: 'active',
        note: null,
      },
      exercises: [],
    };
  }
  const db = getDb();
  const session = db
    .select()
    .from(workoutSession)
    .where(and(eq(workoutSession.id, sessionId), isNull(workoutSession.deletedAt)))
    .get();
  if (!session) return null;

  const rows = db
    .select()
    .from(sessionExercise)
    .where(and(eq(sessionExercise.sessionId, sessionId), isNull(sessionExercise.deletedAt)))
    .orderBy(asc(sessionExercise.orderIndex))
    .all();
  const exerciseIds = [...new Set(rows.map((row) => row.exerciseId))];
  const exercises = exerciseIds.length
    ? db
        .select()
        .from(exercise)
        .where(and(inArray(exercise.id, exerciseIds), isNull(exercise.deletedAt)))
        .all()
    : [];
  const exerciseById = new Map(exercises.map((row) => [row.id, row]));

  const sets = db
    .select()
    .from(setLog)
    .where(isNull(setLog.deletedAt))
    .all()
    .filter((set) => rows.some((row) => row.id === set.sessionExerciseId));

  return {
    session,
    exercises: rows
      .map((row) => {
        const found = exerciseById.get(row.exerciseId);
        if (!found) return null;
        const history = getPastExerciseSessions(found.id, 8);
        const last = history[0];
        const lastSets = last ? workSets(last.sets.map(toWorkSet)) : [];
        const daysSince = last ? diffDaysISO(last.date, todayISO()) : 0;
        let consecutiveBelowMin = 0;
        for (const past of history) {
          if (workSets(past.sets.map(toWorkSet)).some((set) => set.reps < row.repMin)) consecutiveBelowMin += 1;
          else break;
        }
        const e1rmStallSessions = countE1rmStalls(history);
        const suggestion =
          lastSets.length > 0 && found.incrementKg > 0
            ? planNextSession({
                lastSets,
                repMin: row.repMin,
                repMax: row.repMax,
                incrementKg: found.incrementKg,
                daysSinceLastSession: daysSince,
                consecutiveBelowMin,
                e1rmStallSessions,
              })
            : null;
        return {
          row,
          exercise: found,
          sets: sets
            .filter((set) => set.sessionExerciseId === row.id)
            .sort((a, b) => a.setIndex - b.setIndex),
          lastSets,
          lastDate: last?.date ?? null,
          suggestion,
        };
      })
      .filter((item): item is SessionExerciseDetail => Boolean(item)),
  };
}

function toWorkSet(set: SetLogRow): WorkSetInput {
  return { weightKg: set.weightKg, reps: set.reps, rpe: set.rpe, isWarmup: set.isWarmup === 1 };
}

function countE1rmStalls(history: PastSession[]): number {
  const bests = history
    .map((past) => {
      const values = workSets(past.sets.map(toWorkSet))
        .map((set) => epley1Rm(set.weightKg, set.reps))
        .filter((value): value is number => value !== null);
      return values.length ? Math.max(...values) : null;
    })
    .filter((value): value is number => value !== null);
  let stalls = 0;
  for (let index = 0; index < bests.length - 1; index += 1) {
    if ((bests[index] as number) <= (bests[index + 1] as number)) stalls += 1;
    else break;
  }
  return stalls;
}

export function getPastExerciseSessions(exerciseId: string, limit = 10): PastSession[] {
  if (isWeb) return [];
  const sessions = getSqlite().getAllSync<{ id: string; date: string; started_at: string }>(
    `SELECT ws.id, ws.date, ws.started_at
     FROM workout_session ws
     JOIN session_exercise se ON se.session_id = ws.id AND se.deleted_at IS NULL
     JOIN set_log sl ON sl.session_exercise_id = se.id AND sl.deleted_at IS NULL AND sl.is_warmup = 0
     WHERE ws.deleted_at IS NULL AND ws.status = 'done' AND se.exercise_id = ?
     GROUP BY ws.id
     ORDER BY ws.started_at DESC
     LIMIT ?`,
    [exerciseId, limit],
  );
  return sessions.map((session) => ({
    sessionId: session.id,
    date: session.date,
    startedAt: session.started_at,
    sets: getSqlite()
      .getAllSync<Record<string, unknown>>(
        `SELECT sl.* FROM set_log sl
         JOIN session_exercise se ON se.id = sl.session_exercise_id
         WHERE se.session_id = ? AND se.exercise_id = ? AND se.deleted_at IS NULL AND sl.deleted_at IS NULL
         ORDER BY sl.set_index`,
        [session.id, exerciseId],
      )
      .map(mapSetRow),
  }));
}

function mapSetRow(row: Record<string, unknown>): SetLogRow {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    deletedAt: (row.deleted_at as string | null) ?? null,
    sessionExerciseId: String(row.session_exercise_id),
    setIndex: Number(row.set_index),
    weightKg: Number(row.weight_kg),
    reps: Number(row.reps),
    rpe: row.rpe === null || row.rpe === undefined ? null : Number(row.rpe),
    isWarmup: Number(row.is_warmup),
    e1rmKg: row.e1rm_kg === null || row.e1rm_kg === undefined ? null : Number(row.e1rm_kg),
  };
}

function loadExerciseSets(exerciseId: string): SetLogRow[] {
  if (isWeb) return [];
  return getSqlite()
    .getAllSync<Record<string, unknown>>(
      `SELECT sl.* FROM set_log sl
       JOIN session_exercise se ON se.id = sl.session_exercise_id
       JOIN workout_session ws ON ws.id = se.session_id
       WHERE se.exercise_id = ? AND sl.deleted_at IS NULL AND se.deleted_at IS NULL AND ws.deleted_at IS NULL
       ORDER BY ws.started_at ASC, sl.set_index ASC`,
      [exerciseId],
    )
    .map(mapSetRow);
}

export function addSet(
  sessionExerciseId: string,
  input: { weightKg: number; reps: number; rpe?: number | null; isWarmup?: boolean },
): { id: string; prs: PrType[]; e1rmKg: number | null } | null {
  if (isWeb) {
    const e1rmKg = input.isWarmup ? null : epley1Rm(input.weightKg, input.reps);
    return { id: `web-set-${Date.now()}`, prs: [], e1rmKg };
  }
  const db = getDb();
  const row = db
    .select()
    .from(sessionExercise)
    .where(and(eq(sessionExercise.id, sessionExerciseId), isNull(sessionExercise.deletedAt)))
    .get();
  if (!row) return null;

  const now = nowISO();
  const previous = loadExerciseSets(row.exerciseId);
  const currentSessionSets = db
    .select()
    .from(setLog)
    .where(and(eq(setLog.sessionExerciseId, sessionExerciseId), isNull(setLog.deletedAt)))
    .all();
  const setIndex =
    currentSessionSets.reduce((max, set) => Math.max(max, set.setIndex), 0) + 1;
  const e1rmKg = input.isWarmup ? null : epley1Rm(input.weightKg, input.reps);
  const prs = detectSetPrs(previous.map(toWorkSet), {
    weightKg: input.weightKg,
    reps: input.reps,
    rpe: input.rpe,
    isWarmup: input.isWarmup,
  });

  if (!input.isWarmup) {
    const currentVolume =
      sessionVolume(currentSessionSets.map(toWorkSet)) + input.weightKg * input.reps;
    const pastVolumes = new Map<string, number>();
    for (const past of getPastExerciseSessions(row.exerciseId, 50)) {
      if (past.sessionId === row.sessionId) continue;
      const volume = sessionVolume(past.sets.map(toWorkSet));
      pastVolumes.set(past.sessionId, Math.max(pastVolumes.get(past.sessionId) ?? 0, volume));
    }
    const bestPast = pastVolumes.size ? Math.max(...pastVolumes.values()) : 0;
    if (isVolumePr(bestPast, currentVolume) && bestPast > 0) prs.push('volume');
  }

  const newSetId = newId();
  db.insert(setLog)
    .values({
      id: newSetId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      sessionExerciseId,
      setIndex,
      weightKg: input.weightKg,
      reps: input.reps,
      rpe: input.rpe ?? null,
      isWarmup: input.isWarmup ? 1 : 0,
      e1rmKg,
    })
    .run();

  return { id: newSetId, prs, e1rmKg };
}

export function deleteSet(id: string): void {
  if (isWeb) return;
  const now = nowISO();
  getDb().update(setLog).set({ deletedAt: now, updatedAt: now }).where(eq(setLog.id, id)).run();
}

export function finishSession(sessionId: string, note?: string | null): void {
  if (isWeb) return;
  getDb()
    .update(workoutSession)
    .set({ status: 'done', endedAt: nowISO(), note: note ?? null, updatedAt: nowISO() })
    .where(eq(workoutSession.id, sessionId))
    .run();
}

export function getSessionSummary(sessionId: string): SessionSummary | null {
  if (isWeb) return null;
  const db = getDb();
  const session = db
    .select()
    .from(workoutSession)
    .where(and(eq(workoutSession.id, sessionId), isNull(workoutSession.deletedAt)))
    .get();
  if (!session) return null;

  const rows = db
    .select()
    .from(sessionExercise)
    .where(and(eq(sessionExercise.sessionId, sessionId), isNull(sessionExercise.deletedAt)))
    .all();
  const sets = db
    .select()
    .from(setLog)
    .where(isNull(setLog.deletedAt))
    .all()
    .filter((set) => rows.some((row) => row.id === set.sessionExerciseId));

  const working = workSets(sets.map(toWorkSet));
  const started = new Date(session.startedAt).getTime();
  const ended = session.endedAt ? new Date(session.endedAt).getTime() : Date.now();

  const prs = getPrEvents().filter((event) => event.sessionId === sessionId);
  return {
    session,
    totalVolume: sessionVolume(working),
    totalWorkingSets: working.length,
    durationSeconds: Math.max(0, Math.round((ended - started) / 1000)),
    prs,
  };
}

export function getPrEvents(options: { sinceDate?: string } = {}): PrEvent[] {
  if (isWeb) return [];
  const all = getSqlite().getAllSync<{
    id: string;
    exercise_id: string;
    exercise_name: string;
    session_id: string;
    date: string;
    set_index: number;
    weight_kg: number;
    reps: number;
    e1rm_kg: number | null;
    is_warmup: number;
  }>(
    `SELECT sl.id, se.exercise_id, e.name AS exercise_name, ws.id AS session_id, ws.date,
            sl.set_index, sl.weight_kg, sl.reps, sl.e1rm_kg, sl.is_warmup
     FROM set_log sl
     JOIN session_exercise se ON se.id = sl.session_exercise_id
     JOIN workout_session ws ON ws.id = se.session_id
     JOIN exercise e ON e.id = se.exercise_id
     WHERE sl.deleted_at IS NULL AND se.deleted_at IS NULL AND ws.deleted_at IS NULL
     ORDER BY ws.started_at ASC, sl.set_index ASC`,
  );

  const byExercise = new Map<string, typeof all>();
  for (const row of all) {
    const list = byExercise.get(row.exercise_id) ?? [];
    list.push(row);
    byExercise.set(row.exercise_id, list);
  }

  const events: PrEvent[] = [];
  for (const [exerciseId, rows] of byExercise) {
    const history: WorkSetInput[] = [];
    const sessionVolumes = new Map<string, number>();
    const maxVolume = new Map<string, number>();
    for (const row of rows) {
      const current: WorkSetInput = {
        weightKg: row.weight_kg,
        reps: row.reps,
        isWarmup: row.is_warmup === 1,
      };
      if (!current.isWarmup) {
        const prs = detectSetPrs(history, current);
        for (const type of prs) {
          events.push({
            sessionId: row.session_id,
            exerciseId,
            exerciseName: row.exercise_name,
            date: row.date,
            type,
            weightKg: row.weight_kg,
            reps: row.reps,
          });
        }
        sessionVolumes.set(
          row.session_id,
          (sessionVolumes.get(row.session_id) ?? 0) + row.weight_kg * row.reps,
        );
        history.push(current);
      }
    }
    for (const [sessionId, volume] of sessionVolumes) {
      const previousBest = [...maxVolume.values()];
      if (previousBest.length && isVolumePr(Math.max(...previousBest), volume)) {
        const row = rows.find((item) => item.session_id === sessionId);
        if (row) {
          events.push({
            sessionId,
            exerciseId,
            exerciseName: row.exercise_name,
            date: row.date,
            type: 'volume',
            weightKg: 0,
            reps: 0,
          });
        }
      }
      maxVolume.set(sessionId, volume);
    }
  }

  const filtered = options.sinceDate
    ? events.filter((event) => event.date >= (options.sinceDate as string))
    : events;
  return filtered;
}

export function listSessions(limit = 40): {
  session: WorkoutSessionRow;
  totalVolume: number;
  totalSets: number;
}[] {
  if (isWeb) return [];
  const db = getDb();
  const sessions = db
    .select()
    .from(workoutSession)
    .where(and(isNull(workoutSession.deletedAt), eq(workoutSession.status, 'done')))
    .orderBy(desc(workoutSession.startedAt))
    .limit(limit)
    .all();
  if (sessions.length === 0) return [];
  const ids = sessions.map((session) => session.id);
  const rows = getSqlite().getAllSync<{
    session_id: string;
    volume: number;
    sets: number;
  }>(
    `SELECT se.session_id,
            COALESCE(SUM(sl.weight_kg * sl.reps), 0) AS volume,
            COUNT(sl.id) AS sets
     FROM session_exercise se
     JOIN set_log sl ON sl.session_exercise_id = se.id AND sl.deleted_at IS NULL AND sl.is_warmup = 0
     WHERE se.deleted_at IS NULL AND se.session_id IN (${ids.map(() => '?').join(',')})
     GROUP BY se.session_id`,
    ids,
  );
  const stats = new Map(rows.map((row) => [row.session_id, row]));
  return sessions.map((session) => ({
    session,
    totalVolume: stats.get(session.id)?.volume ?? 0,
    totalSets: stats.get(session.id)?.sets ?? 0,
  }));
}

export function deleteSession(sessionId: string): void {
  if (isWeb) return;
  const db = getDb();
  const now = nowISO();
  getSqlite().withTransactionSync(() => {
    const rows = db
      .select()
      .from(sessionExercise)
      .where(eq(sessionExercise.sessionId, sessionId))
      .all();
    for (const row of rows) {
      db.update(setLog).set({ deletedAt: now, updatedAt: now }).where(eq(setLog.sessionExerciseId, row.id)).run();
    }
    db.update(sessionExercise).set({ deletedAt: now, updatedAt: now }).where(eq(sessionExercise.sessionId, sessionId)).run();
    db.update(workoutSession).set({ deletedAt: now, updatedAt: now }).where(eq(workoutSession.id, sessionId)).run();
  });
}

export function getExerciseStats(exerciseId: string): ExerciseStat[] {
  const stats = getPastExerciseSessions(exerciseId, 100).map((past) => {
    const sets = workSets(past.sets.map(toWorkSet));
    const top = sets.reduce<WorkSetInput | null>(
      (best, set) =>
        !best || set.weightKg > best.weightKg || (set.weightKg === best.weightKg && set.reps > best.reps)
          ? set
          : best,
      null,
    );
    const e1rms = sets
      .map((set) => epley1Rm(set.weightKg, set.reps))
      .filter((value): value is number => value !== null);
    return {
      sessionId: past.sessionId,
      date: past.date,
      topWeightKg: top?.weightKg ?? 0,
      topReps: top?.reps ?? 0,
      bestE1rm: e1rms.length ? Math.max(...e1rms) : null,
      volume: sessionVolume(sets),
      totalReps: sets.reduce((sum, set) => sum + set.reps, 0),
    };
  });
  return stats;
}

/**
 * Weekly volume summary for the last N weeks.
 * Returns array of { weekStart, totalVolume, sessions, avgE1rm } for chart rendering.
 */
export function getWeeklyVolumeSummary(weeks = 12): {
  weekStart: string;
  totalVolume: number;
  sessions: number;
  avgE1rm: number | null;
}[] {
  if (isWeb) return [];
  const db = getDb();
  const today = todayISO();
  const results: { weekStart: string; totalVolume: number; sessions: number; avgE1rm: number | null }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addDaysISO(today, -(i * 7 + 6)); // Monday of that week
    const weekEnd = addDaysISO(weekStart, 6);

    const sessions = db
      .select()
      .from(workoutSession)
      .where(
        and(
          isNull(workoutSession.deletedAt),
          gte(workoutSession.date, weekStart),
          lte(workoutSession.date, weekEnd),
        ),
      )
      .all();

    if (sessions.length === 0) continue;

    let totalVolume = 0;
    const e1rms: number[] = [];

    for (const session of sessions) {
      const exs = db.select().from(sessionExercise).where(eq(sessionExercise.sessionId, session.id)).all();
      for (const ex of exs) {
        const sets = db
          .select()
          .from(setLog)
          .where(and(eq(setLog.sessionExerciseId, ex.id), isNull(setLog.deletedAt)))
          .all();
        const work = sets.filter((s) => !s.isWarmup);
        totalVolume += work.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
        for (const s of work) {
          const e = epley1Rm(s.weightKg, s.reps);
          if (e !== null) e1rms.push(e);
        }
      }
    }

    results.push({
      weekStart,
      totalVolume: Math.round(totalVolume),
      sessions: sessions.length,
      avgE1rm: e1rms.length ? Math.round(e1rms.reduce((a, b) => a + b, 0) / e1rms.length) : null,
    });
  }

  return results;
}

// ── Web program store (localStorage) ─────────────────────────────────────────

const WEB_PROGRAMS_KEY = 'fittrack-web-programs';
const WEB_ACTIVE_KEY = 'fittrack-web-active-program';

interface WebProgramData {
  id: string;
  name: string;
  template: string;
  sessionsPerWeek: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  days: {
    id: string;
    name: string;
    weekday: number;
    orderIndex: number;
    exercises: { id: string; exerciseId: string; name: string; targetSets: number; repMin: number; repMax: number; restSeconds: number; orderIndex: number }[];
  }[];
}

function getWebPrograms(): WebProgramData[] {
  try {
    const raw = localStorage.getItem(WEB_PROGRAMS_KEY);
    return raw ? (JSON.parse(raw) as WebProgramData[]) : [];
  } catch {
    return [];
  }
}

function saveWebProgram(id: string, template: TemplateDefinition, name: string, sessionsPerWeek: number): void {
  const programs = getWebPrograms();
  const now = nowISO();
  const exercisesById = new Map<string, (typeof SEED_EXERCISES)[number]>();
  for (const ex of SEED_EXERCISES) {
    exercisesById.set(ex.name, ex);
  }

  const webDays = template.days.map((day, idx) => ({
    id: `web-day-${Date.now()}-${idx}`,
    name: day.name,
    weekday: day.weekday,
    orderIndex: idx,
    exercises: day.exercises.map((exName, exIdx) => {
      const seed = exercisesById.get(exName);
      const isCompound = seed?.isCompound ?? false;
      return {
        id: `web-pde-${Date.now()}-${idx}-${exIdx}`,
        exerciseId: `web-ex-${exName}`,
        name: exName,
        targetSets: isCompound ? WORKOUT_DEFAULTS.compoundSets : WORKOUT_DEFAULTS.isolationSets,
        repMin: isCompound ? WORKOUT_DEFAULTS.compoundRepMin : WORKOUT_DEFAULTS.isolationRepMin,
        repMax: isCompound ? WORKOUT_DEFAULTS.compoundRepMax : WORKOUT_DEFAULTS.isolationRepMax,
        restSeconds: isCompound ? WORKOUT_DEFAULTS.restCompoundSeconds : WORKOUT_DEFAULTS.restIsolationSeconds,
        orderIndex: exIdx,
      };
    }),
  }));

  programs.push({
    id,
    name,
    template: template.name,
    sessionsPerWeek,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    days: webDays,
  });
  localStorage.setItem(WEB_PROGRAMS_KEY, JSON.stringify(programs));
}

function getWebActiveProgram(): string | null {
  return localStorage.getItem(WEB_ACTIVE_KEY);
}

function setWebActiveProgram(id: string): void {
  const programs = getWebPrograms();
  for (const p of programs) p.isActive = p.id === id;
  localStorage.setItem(WEB_PROGRAMS_KEY, JSON.stringify(programs));
  localStorage.setItem(WEB_ACTIVE_KEY, id);
}

function getWebProgramDetail(programId: string): ProgramDetail | null {
  const programs = getWebPrograms();
  const program = programs.find((p) => p.id === programId);
  if (!program) return null;

  const now = nowISO();
  const programRow: WorkoutProgramRow = {
    id: program.id,
    createdAt: program.createdAt,
    updatedAt: program.updatedAt,
    deletedAt: null,
    name: program.name,
    template: program.template,
    sessionsPerWeek: program.sessionsPerWeek,
    isActive: program.isActive ? 1 : 0,
  };

  const days: ProgramDayDetail[] = program.days.map((day) => {
    const dayRow: ProgramDayRow = {
      id: day.id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      programId,
      name: day.name,
      orderIndex: day.orderIndex,
      weekday: day.weekday,
    };
    const exercises: ProgramExerciseItem[] = day.exercises.map((ex) => {
      const exerciseRow: ExerciseRow = {
        id: ex.exerciseId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        name: ex.name,
        nameEn: ex.name,
        muscleGroup: '',
        equipment: '',
        defaultRepMin: ex.repMin,
        defaultRepMax: ex.repMax,
        incrementKg: 2.5,
        isCustom: 0,
        isCompound: ex.targetSets >= 3 ? 1 : 0,
        searchText: ex.name.toLowerCase(),
      };
      const pdeRow: ProgramDayExerciseRow = {
        id: ex.id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        programDayId: day.id,
        exerciseId: ex.exerciseId,
        orderIndex: ex.orderIndex,
        targetSets: ex.targetSets,
        repMin: ex.repMin,
        repMax: ex.repMax,
        restSeconds: ex.restSeconds,
      };
      return { row: pdeRow, exercise: exerciseRow };
    });
    return { row: dayRow, exercises };
  });

  return { program: programRow, days };
}
