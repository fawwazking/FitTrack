import { integer, real, sqliteTable, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

const stamps = {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
};

export const userProfile = sqliteTable('user_profile', {
  ...stamps,
  sex: text('sex').notNull(),
  birthDate: text('birth_date').notNull(),
  heightCm: real('height_cm').notNull(),
  activityLevel: text('activity_level').notNull(),
  sessionsPerWeek: integer('sessions_per_week').notNull(),
  units: text('units').notNull(),
  weekStartDay: integer('week_start_day').notNull(),
  disclaimerAcceptedAt: text('disclaimer_accepted_at'),
});

export const goalSetting = sqliteTable('goal_setting', {
  ...stamps,
  profileId: text('profile_id').notNull(),
  goal: text('goal').notNull(),
  pace: text('pace').notNull(),
  startDate: text('start_date').notNull(),
  referenceWeightKg: real('reference_weight_kg').notNull(),
  manualOverride: integer('manual_override').notNull(),
});

export const nutritionTarget = sqliteTable(
  'nutrition_target',
  {
    ...stamps,
    goalSettingId: text('goal_setting_id').notNull(),
    effectiveDate: text('effective_date').notNull(),
    bmr: real('bmr').notNull(),
    tdee: real('tdee').notNull(),
    calories: real('calories').notNull(),
    proteinG: real('protein_g').notNull(),
    carbsG: real('carbs_g').notNull(),
    fatG: real('fat_g').notNull(),
    proteinGPerKg: real('protein_g_per_kg').notNull(),
    fatPct: real('fat_pct').notNull(),
    reason: text('reason').notNull(),
  },
  (table) => [index('idx_nutrition_target_date').on(table.effectiveDate)],
);

export const food = sqliteTable(
  'food',
  {
    ...stamps,
    name: text('name').notNull(),
    brand: text('brand'),
    source: text('source').notNull(),
    category: text('category'),
    kcal100g: real('kcal_100g').notNull(),
    protein100g: real('protein_100g').notNull(),
    carbs100g: real('carbs_100g').notNull(),
    fat100g: real('fat_100g').notNull(),
    isCustom: integer('is_custom').notNull(),
    verified: integer('verified').notNull(),
    searchText: text('search_text').notNull(),
  },
  (table) => [index('idx_food_search').on(table.searchText)],
);

export const foodServing = sqliteTable('food_serving', {
  ...stamps,
  foodId: text('food_id').notNull(),
  label: text('label').notNull(),
  grams: real('grams').notNull(),
  isDefault: integer('is_default').notNull(),
});

export const recipeItem = sqliteTable('recipe_item', {
  ...stamps,
  recipeFoodId: text('recipe_food_id').notNull(),
  ingredientFoodId: text('ingredient_food_id').notNull(),
  grams: real('grams').notNull(),
});

export const mealEntry = sqliteTable(
  'meal_entry',
  {
    ...stamps,
    date: text('date').notNull(),
    mealType: text('meal_type').notNull(),
    foodId: text('food_id').notNull(),
    servingId: text('serving_id'),
    quantity: real('quantity').notNull(),
    grams: real('grams').notNull(),
    nameSnapshot: text('name_snapshot').notNull(),
    kcal: real('kcal').notNull(),
    proteinG: real('protein_g').notNull(),
    carbsG: real('carbs_g').notNull(),
    fatG: real('fat_g').notNull(),
  },
  (table) => [index('idx_meal_entry_date').on(table.date)],
);

export const weightLog = sqliteTable(
  'weight_log',
  {
    ...stamps,
    date: text('date').notNull(),
    weightKg: real('weight_kg').notNull(),
    note: text('note'),
  },
  (table) => [uniqueIndex('uq_weight_log_date').on(table.date)],
);

export const exercise = sqliteTable('exercise', {
  ...stamps,
  name: text('name').notNull(),
  nameEn: text('name_en'),
  muscleGroup: text('muscle_group').notNull(),
  equipment: text('equipment').notNull(),
  defaultRepMin: integer('default_rep_min').notNull(),
  defaultRepMax: integer('default_rep_max').notNull(),
  incrementKg: real('increment_kg').notNull(),
  isCustom: integer('is_custom').notNull(),
  isCompound: integer('is_compound').notNull(),
  searchText: text('search_text').notNull(),
});

export const workoutProgram = sqliteTable('workout_program', {
  ...stamps,
  name: text('name').notNull(),
  template: text('template').notNull(),
  sessionsPerWeek: integer('sessions_per_week').notNull(),
  isActive: integer('is_active').notNull(),
});

export const programDay = sqliteTable('program_day', {
  ...stamps,
  programId: text('program_id').notNull(),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull(),
  weekday: integer('weekday'),
});

export const programDayExercise = sqliteTable('program_day_exercise', {
  ...stamps,
  programDayId: text('program_day_id').notNull(),
  exerciseId: text('exercise_id').notNull(),
  orderIndex: integer('order_index').notNull(),
  targetSets: integer('target_sets').notNull(),
  repMin: integer('rep_min').notNull(),
  repMax: integer('rep_max').notNull(),
  restSeconds: integer('rest_seconds').notNull(),
});

export const workoutSession = sqliteTable(
  'workout_session',
  {
    ...stamps,
    date: text('date').notNull(),
    programDayId: text('program_day_id'),
    programDayName: text('program_day_name'),
    startedAt: text('started_at').notNull(),
    endedAt: text('ended_at'),
    status: text('status').notNull(),
    note: text('note'),
  },
  (table) => [index('idx_workout_session_date').on(table.date)],
);

export const sessionExercise = sqliteTable('session_exercise', {
  ...stamps,
  sessionId: text('session_id').notNull(),
  exerciseId: text('exercise_id').notNull(),
  orderIndex: integer('order_index').notNull(),
  targetSets: integer('target_sets').notNull(),
  repMin: integer('rep_min').notNull(),
  repMax: integer('rep_max').notNull(),
  restSeconds: integer('rest_seconds').notNull(),
});

export const setLog = sqliteTable(
  'set_log',
  {
    ...stamps,
    sessionExerciseId: text('session_exercise_id').notNull(),
    setIndex: integer('set_index').notNull(),
    weightKg: real('weight_kg').notNull(),
    reps: integer('reps').notNull(),
    rpe: real('rpe'),
    isWarmup: integer('is_warmup').notNull(),
    e1rmKg: real('e1rm_kg'),
  },
  (table) => [index('idx_set_log_exercise').on(table.sessionExerciseId)],
);

export const reminder = sqliteTable('reminder', {
  ...stamps,
  type: text('type').notNull(),
  time: text('time').notNull(),
  daysOfWeek: text('days_of_week').notNull(),
  mealType: text('meal_type'),
  enabled: integer('enabled').notNull(),
  notificationId: text('notification_id'),
});

export const appSettings = sqliteTable('app_settings', {
  ...stamps,
  theme: text('theme').notNull(),
  language: text('language').notNull(),
  weekStartDay: integer('week_start_day').notNull(),
  notificationsEnabled: integer('notifications_enabled').notNull(),
  activeProgramId: text('active_program_id'),
});

export type FoodRow = typeof food.$inferSelect;
export type ExerciseRow = typeof exercise.$inferSelect;
export type MealEntryRow = typeof mealEntry.$inferSelect;
export type WeightLogRow = typeof weightLog.$inferSelect;
export type NutritionTargetRow = typeof nutritionTarget.$inferSelect;
export type GoalSettingRow = typeof goalSetting.$inferSelect;
export type UserProfileRow = typeof userProfile.$inferSelect;
export type WorkoutProgramRow = typeof workoutProgram.$inferSelect;
export type ProgramDayRow = typeof programDay.$inferSelect;
export type ProgramDayExerciseRow = typeof programDayExercise.$inferSelect;
export type WorkoutSessionRow = typeof workoutSession.$inferSelect;
export type SessionExerciseRow = typeof sessionExercise.$inferSelect;
export type SetLogRow = typeof setLog.$inferSelect;
export type ReminderRow = typeof reminder.$inferSelect;
export type AppSettingsRow = typeof appSettings.$inferSelect;
export type FoodServingRow = typeof foodServing.$inferSelect;
export type RecipeItemRow = typeof recipeItem.$inferSelect;
