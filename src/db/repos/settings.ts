import { and, asc, eq, isNull } from 'drizzle-orm';
import { seedDatabase } from '../seed';
import { getDb, getSqlite, isWeb, nowISO, resetAllData } from '../db';
import { appSettings, reminder, type AppSettingsRow, type ReminderRow } from '../schema';

export function getSettings(): AppSettingsRow {
  if (isWeb) {
    return {
      id: 'app', createdAt: nowISO(), updatedAt: nowISO(), deletedAt: null,
      theme: 'system', language: 'id', weekStartDay: 1,
      notificationsEnabled: 0, activeProgramId: null,
    };
  }
  const db = getDb();
  const row = db.select().from(appSettings).where(eq(appSettings.id, 'app')).get();
  if (row) return row;
  const now = nowISO();
  const created: AppSettingsRow = {
    id: 'app',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    theme: 'system',
    language: 'id',
    weekStartDay: 1,
    notificationsEnabled: 0,
    activeProgramId: null,
  };
  db.insert(appSettings).values(created).run();
  return created;
}

export function updateSettings(patch: Partial<Pick<AppSettingsRow, 'theme' | 'notificationsEnabled' | 'weekStartDay'>>): void {
  if (isWeb) return;
  getSettings();
  getDb()
    .update(appSettings)
    .set({ ...patch, updatedAt: nowISO() })
    .where(eq(appSettings.id, 'app'))
    .run();
}

export function listReminders(): ReminderRow[] {
  if (isWeb) return [];
  return getDb()
    .select()
    .from(reminder)
    .where(isNull(reminder.deletedAt))
    .orderBy(asc(reminder.type), asc(reminder.time))
    .all();
}

export function getReminderFor(type: string, mealType?: string | null): ReminderRow | null {
  if (isWeb) return null;
  const rows = getDb()
    .select()
    .from(reminder)
    .where(and(isNull(reminder.deletedAt), eq(reminder.type, type)))
    .all();
  if (mealType) return rows.find((row) => row.mealType === mealType) ?? null;
  return rows[0] ?? null;
}

export function updateReminder(
  id: string,
  patch: Partial<Pick<ReminderRow, 'time' | 'daysOfWeek' | 'enabled' | 'notificationId'>>,
): void {
  getDb()
    .update(reminder)
    .set({ ...patch, updatedAt: nowISO() })
    .where(eq(reminder.id, id))
    .run();
}

export function resetApplication(): void {
  if (isWeb) return;
  resetAllData();
  getSqlite();
  seedDatabase();
}
