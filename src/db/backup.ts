import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getSqlite, isWeb } from './db';

export interface BackupBundle {
  version: number;
  exportedAt: string;
  tables: Record<string, string>;
}

/**
 * Export all database tables to a JSON file and open the share sheet.
 * Returns the file URI or null on failure.
 */
export async function exportBackup(): Promise<string | null> {
  if (isWeb) return null;
  const db = getSqlite();
  const tables = [
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

  const bundle: BackupBundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tables: {},
  };

  for (const table of tables) {
    const rows = db.getAllSync(table) as unknown[];
    bundle.tables[table] = JSON.stringify(rows ?? []);
  }

  const json = JSON.stringify(bundle, null, 2);
  const uri = FileSystem.Paths.join(FileSystem.Paths.document, `fittrack-backup-${Date.now()}.json`);
  await FileSystemLegacy.writeAsStringAsync(uri, json);
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'FitTrack Backup',
  });
  return uri;
}

/**
 * Import a backup JSON file. Replaces all existing data.
 * Returns number of tables imported or null on failure.
 */
export async function importBackup(): Promise<number | null> {
  if (isWeb) return null;
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  const json = await FileSystemLegacy.readAsStringAsync(asset.uri);
  let bundle: BackupBundle;
  try {
    bundle = JSON.parse(json) as BackupBundle;
  } catch {
    return null;
  }
  const db = getSqlite();
  db.withTransactionSync(() => {
    for (const table of Object.keys(bundle.tables)) {
      // Only allow known table names to prevent SQL injection
      const allowed = [
        'user_profile', 'goal_setting', 'nutrition_target', 'food',
        'food_serving', 'recipe_item', 'meal_entry', 'weight_log',
        'exercise', 'workout_program', 'program_day', 'program_day_exercise',
        'workout_session', 'session_exercise', 'set_log', 'reminder', 'app_settings',
      ];
      if (!allowed.includes(table)) continue;
      const raw = bundle.tables[table] ?? '[]';
      const rows: Record<string, unknown>[] = JSON.parse(raw);
      db.runSync(`DELETE FROM ${table}`);
      if (rows.length === 0) continue;
      const cols = Object.keys(rows[0] ?? {});
      if (cols.length === 0) continue;
      const placeholders = cols.map((c) => `?`).join(', ');
      const colNames = cols.join(', ');
      for (const row of rows) {
        const values: (string | number | null)[] = cols.map((c) => {
          const v = row[c];
          return typeof v === 'string' || typeof v === 'number' ? v : null;
        });
        db.runSync(
          `INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`,
          values,
        );
      }
    }
  });
  return Object.keys(bundle.tables).length;
}
