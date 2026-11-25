import { getSqlite, isWeb } from './db';

/**
 * DB versioning via PRAGMA user_version.
 * Each migration runs in order when the schema version in the DB is below
 * the current code version. Safe to call on every app launch.
 */

/** Current schema version. Bump when adding a new migration. */
export const DB_VERSION = 0;

interface Migration {
  version: number;
  up: (db: ReturnType<typeof getSqlite>) => void;
}

/**
 * Ordered list of migrations. Each runs exactly once when the DB version
 * is below `version`. `up` receives the native SQLite session.
 */
const migrations: Migration[] = [
  // Future: add migrations here
  // {
  //   version: 1,
  //   up: (db) => {
  //     db.execSync('ALTER TABLE food ADD COLUMN fiber_100g REAL NOT NULL DEFAULT 0');
  //   },
  // },
];

/** Read the current user_version from SQLite. */
function getUserVersion(db: ReturnType<typeof getSqlite>): number {
  const rows = db.getAllSync<{ user_version: number }>('PRAGMA user_version');
  return rows[0]?.user_version ?? 0;
}

/** Set user_version in SQLite. */
function setUserVersion(db: ReturnType<typeof getSqlite>, version: number): void {
  db.execSync(`PRAGMA user_version = ${version}`);
}

/**
 * Run all pending migrations. No-op when current version >= DB_VERSION.
 */
export function runMigrations(): void {
  if (isWeb) return;
  const db = getSqlite();
  const currentVersion = getUserVersion(db);

  if (currentVersion >= DB_VERSION) return;

  for (const migration of migrations) {
    if (migration.version > currentVersion && migration.version <= DB_VERSION) {
      migration.up(db);
      setUserVersion(db, migration.version);
    }
  }

  // Ensure version is at least DB_VERSION (handles empty migration list)
  if (currentVersion < DB_VERSION) {
    setUserVersion(db, DB_VERSION);
  }
}
