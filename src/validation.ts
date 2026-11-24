import { z } from 'zod';
import { PROFILE_LIMITS } from './config';
import { t } from './i18n';

const numberField = z.coerce.number({ message: t.validation.number });

export const profileSchema = z.object({
  sex: z.enum(['male', 'female']),
  age: numberField
    .int(t.validation.age)
    .min(PROFILE_LIMITS.ageMin, t.validation.age)
    .max(PROFILE_LIMITS.ageMax, t.validation.age),
  heightCm: numberField
    .min(PROFILE_LIMITS.heightCmMin, t.validation.height)
    .max(PROFILE_LIMITS.heightCmMax, t.validation.height),
  weightKg: numberField
    .min(PROFILE_LIMITS.weightKgMin, t.validation.weight)
    .max(PROFILE_LIMITS.weightKgMax, t.validation.weight),
  sessionsPerWeek: numberField
    .int(t.validation.sessions)
    .min(PROFILE_LIMITS.sessionsPerWeekMin, t.validation.sessions)
    .max(PROFILE_LIMITS.sessionsPerWeekMax, t.validation.sessions),
  activityLevel: z.enum(['low', 'medium', 'high']),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const goalSchema = z.object({
  goal: z.enum(['bulking', 'cutting', 'recomp']),
  pace: z.enum(['slow', 'moderate', 'aggressive']),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

export const customFoodSchema = z.object({
  name: z.string().trim().min(1, t.validation.name).max(80, t.validation.tooLong),
  brand: z.string().trim().max(60, t.validation.tooLong).optional(),
  category: z.string().trim().max(40, t.validation.tooLong).optional(),
  servingLabel: z.string().trim().max(40, t.validation.tooLong).optional(),
  servingGrams: numberField.min(1, t.validation.positive),
  kcal100g: numberField.min(0, t.validation.nonNegative),
  protein100g: numberField.min(0, t.validation.nonNegative),
  carbs100g: numberField.min(0, t.validation.nonNegative),
  fat100g: numberField.min(0, t.validation.nonNegative),
});

export type CustomFoodFormValues = z.infer<typeof customFoodSchema>;

export const weightSchema = z.object({
  weightKg: numberField
    .min(PROFILE_LIMITS.weightKgMin, t.validation.weight)
    .max(PROFILE_LIMITS.weightKgMax, t.validation.weight),
  note: z.string().trim().max(200, t.validation.tooLong).optional(),
});

export type WeightFormValues = z.infer<typeof weightSchema>;

export const setSchema = z.object({
  weightKg: numberField.min(0, t.validation.nonNegative),
  reps: numberField.int(t.validation.positive).min(1, t.validation.positive),
  rpe: z.union([z.literal(''), numberField.min(6, t.validation.number).max(10, t.validation.number)]),
});

export const customExerciseSchema = z.object({
  name: z.string().trim().min(1, t.validation.name).max(80, t.validation.tooLong),
  muscleGroup: z.string().trim().min(1, t.validation.required),
  equipment: z.string().trim().min(1, t.validation.required),
});

export const reminderSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/, t.validation.required),
  enabled: z.boolean(),
});

export const loginPinSchema = z.object({
  pin: z.string().regex(/^\d{4,8}$/, t.validation.number),
});
