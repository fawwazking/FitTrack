export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  sex TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  height_cm REAL NOT NULL,
  activity_level TEXT NOT NULL,
  sessions_per_week INTEGER NOT NULL,
  units TEXT NOT NULL,
  week_start_day INTEGER NOT NULL,
  disclaimer_accepted_at TEXT
);

CREATE TABLE IF NOT EXISTS goal_setting (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  profile_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  pace TEXT NOT NULL,
  start_date TEXT NOT NULL,
  reference_weight_kg REAL NOT NULL,
  manual_override INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS nutrition_target (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  goal_setting_id TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  bmr REAL NOT NULL,
  tdee REAL NOT NULL,
  calories REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL,
  protein_g_per_kg REAL NOT NULL,
  fat_pct REAL NOT NULL,
  reason TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nutrition_target_date ON nutrition_target (effective_date);

CREATE TABLE IF NOT EXISTS food (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  name TEXT NOT NULL,
  brand TEXT,
  source TEXT NOT NULL,
  category TEXT,
  kcal_100g REAL NOT NULL,
  protein_100g REAL NOT NULL,
  carbs_100g REAL NOT NULL,
  fat_100g REAL NOT NULL,
  is_custom INTEGER NOT NULL,
  verified INTEGER NOT NULL,
  search_text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_food_search ON food (search_text);

CREATE TABLE IF NOT EXISTS food_serving (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  food_id TEXT NOT NULL,
  label TEXT NOT NULL,
  grams REAL NOT NULL,
  is_default INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_food_serving_food ON food_serving (food_id);

CREATE TABLE IF NOT EXISTS recipe_item (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  recipe_food_id TEXT NOT NULL,
  ingredient_food_id TEXT NOT NULL,
  grams REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_entry (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  food_id TEXT NOT NULL,
  serving_id TEXT,
  quantity REAL NOT NULL,
  grams REAL NOT NULL,
  name_snapshot TEXT NOT NULL,
  kcal REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_meal_entry_date ON meal_entry (date);

CREATE TABLE IF NOT EXISTS weight_log (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  date TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  note TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_weight_log_date ON weight_log (date);

CREATE TABLE IF NOT EXISTS exercise (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  name TEXT NOT NULL,
  name_en TEXT,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  default_rep_min INTEGER NOT NULL,
  default_rep_max INTEGER NOT NULL,
  increment_kg REAL NOT NULL,
  is_custom INTEGER NOT NULL,
  is_compound INTEGER NOT NULL,
  search_text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_exercise_search ON exercise (search_text);

CREATE TABLE IF NOT EXISTS workout_program (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  sessions_per_week INTEGER NOT NULL,
  is_active INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS program_day (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  program_id TEXT NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  weekday INTEGER
);
CREATE INDEX IF NOT EXISTS idx_program_day_program ON program_day (program_id);

CREATE TABLE IF NOT EXISTS program_day_exercise (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  program_day_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  target_sets INTEGER NOT NULL,
  rep_min INTEGER NOT NULL,
  rep_max INTEGER NOT NULL,
  rest_seconds INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pde_day ON program_day_exercise (program_day_id);

CREATE TABLE IF NOT EXISTS workout_session (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  date TEXT NOT NULL,
  program_day_id TEXT,
  program_day_name TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  status TEXT NOT NULL,
  note TEXT
);
CREATE INDEX IF NOT EXISTS idx_workout_session_date ON workout_session (date);

CREATE TABLE IF NOT EXISTS session_exercise (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  session_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  target_sets INTEGER NOT NULL,
  rep_min INTEGER NOT NULL,
  rep_max INTEGER NOT NULL,
  rest_seconds INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_exercise_session ON session_exercise (session_id);

CREATE TABLE IF NOT EXISTS set_log (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  session_exercise_id TEXT NOT NULL,
  set_index INTEGER NOT NULL,
  weight_kg REAL NOT NULL,
  reps INTEGER NOT NULL,
  rpe REAL,
  is_warmup INTEGER NOT NULL,
  e1rm_kg REAL
);
CREATE INDEX IF NOT EXISTS idx_set_log_exercise ON set_log (session_exercise_id);

CREATE TABLE IF NOT EXISTS reminder (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  type TEXT NOT NULL,
  time TEXT NOT NULL,
  days_of_week TEXT NOT NULL,
  meal_type TEXT,
  enabled INTEGER NOT NULL,
  notification_id TEXT
);

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  theme TEXT NOT NULL,
  language TEXT NOT NULL,
  week_start_day INTEGER NOT NULL,
  notifications_enabled INTEGER NOT NULL,
  active_program_id TEXT
);
`;
