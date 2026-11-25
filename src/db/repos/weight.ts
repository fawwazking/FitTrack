import { and, asc, desc, eq, gt, isNull, lte } from 'drizzle-orm';
import { addDaysISO, todayISO } from '../../domain/dates';
import { getDb, isWeb, newId, nowISO } from '../db';
import { weightLog, type WeightLogRow } from '../schema';

export function upsertWeight(date: string, weightKg: number, note?: string | null): WeightLogRow {
  if (isWeb) {
    return { id: 'web-weight', createdAt: nowISO(), updatedAt: nowISO(), deletedAt: null, date, weightKg, note: note ?? null };
  }
  const db = getDb();
  const now = nowISO();
  const existing = db.select().from(weightLog).where(eq(weightLog.date, date)).get();
  if (existing) {
    db.update(weightLog)
      .set({ weightKg, note: note ?? null, updatedAt: now, deletedAt: null })
      .where(eq(weightLog.id, existing.id))
      .run();
    return { ...existing, weightKg, note: note ?? null, updatedAt: now, deletedAt: null };
  }
  const row: WeightLogRow = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    date,
    weightKg,
    note: note ?? null,
  };
  db.insert(weightLog).values(row).run();
  return row;
}

export function getLatestWeight(): WeightLogRow | null {
  if (isWeb) return null;
  const row = getDb()
    .select()
    .from(weightLog)
    .where(isNull(weightLog.deletedAt))
    .orderBy(desc(weightLog.date))
    .limit(1)
    .get();
  return row ?? null;
}

export function getWeightForDate(date: string): WeightLogRow | null {
  if (isWeb) return null;
  const row = getDb()
    .select()
    .from(weightLog)
    .where(and(eq(weightLog.date, date), isNull(weightLog.deletedAt)))
    .get();
  return row ?? null;
}

export function listWeights(limit = 120): WeightLogRow[] {
  if (isWeb) return [];
  return getDb()
    .select()
    .from(weightLog)
    .where(isNull(weightLog.deletedAt))
    .orderBy(desc(weightLog.date))
    .limit(limit)
    .all();
}

export function listWeightsBetween(startDate: string, endDate: string): WeightLogRow[] {
  if (isWeb) return [];
  return getDb()
    .select()
    .from(weightLog)
    .where(
      and(
        isNull(weightLog.deletedAt),
        gt(weightLog.date, addDaysISO(startDate, -1)),
        lte(weightLog.date, endDate),
      ),
    )
    .orderBy(asc(weightLog.date))
    .all();
}

export function getWeightAverage(endDate: string, windowDays = 7): number | null {
  if (isWeb) return null;
  const rows = listWeightsBetween(addDaysISO(endDate, -(windowDays - 1)), endDate);
  if (rows.length === 0) return null;
  return rows.reduce((sum, row) => sum + row.weightKg, 0) / rows.length;
}

export function getWeightToday(): WeightLogRow | null {
  return getWeightForDate(todayISO());
}

export function deleteWeight(id: string): void {
  getDb()
    .update(weightLog)
    .set({ deletedAt: nowISO(), updatedAt: nowISO() })
    .where(eq(weightLog.id, id))
    .run();
}
