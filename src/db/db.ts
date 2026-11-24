import * as Crypto from 'expo-crypto';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import * as schema from './schema';
import { INIT_SQL } from './sql';

let sqlite: SQLiteDatabase | null = null;
let orm: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getSqlite(): SQLiteDatabase {
  if (!sqlite) {
    sqlite = openDatabaseSync('fittrack.db');
    sqlite.execSync('PRAGMA journal_mode = WAL;');
    sqlite.execSync('PRAGMA foreign_keys = ON;');
    sqlite.execSync(INIT_SQL);
  }
  return sqlite;
}

export function getDb() {
  if (!orm) {
    orm = drizzle(getSqlite(), { schema });
  }
  return orm;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return Crypto.randomUUID();
}

export function normalizeSearch(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countRows(table: string): number {
  const row = getSqlite().getFirstSync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM ${table} WHERE deleted_at IS NULL`,
  );
  return row?.n ?? 0;
}

export function getMeta(key: string): string | null {
  const row = getSqlite().getFirstSync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [key]);
  return row?.value ?? null;
}

export function setMeta(key: string, value: string | null): void {
  if (value === null) {
    getSqlite().runSync('DELETE FROM meta WHERE key = ?', [key]);
    return;
  }
  getSqlite().runSync(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value],
  );
}

export function resetAllData(): void {
  const db = getSqlite();
  const tables = [
    'meta',
    'user_profile',
    'goal_setting',
    'nutrition_target',
    'food',
    'food_serving',
    'recipe_item',
    'meal_entry',
    'weight_log',
    'exercise',
    'workout_program',
    'program_day',
    'program_day_exercise',
    'workout_session',
    'session_exercise',
    'set_log',
    'reminder',
    'app_settings',
  ];
  db.withTransactionSync(() => {
    for (const table of tables) db.execSync(`DELETE FROM ${table};`);
  });
}
