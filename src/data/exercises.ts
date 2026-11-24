import { WORKOUT_DEFAULTS } from '../config';

export interface SeedExercise {
  name: string;
  nameEn: string;
  muscleGroup: string;
  equipment: string;
  isCompound: boolean;
  incrementKg: number;
  repMin: number;
  repMax: number;
}

type Row = [
  name: string,
  nameEn: string,
  muscle: string,
  equipment: string,
  compound: boolean,
  increment: number,
];

const rows: Row[] = [
  // Dada
  ['Bench Press', 'Barbell Bench Press', 'Dada', 'Barbel', true, 2.5],
  ['Incline Bench Press', 'Incline Barbell Bench Press', 'Dada', 'Barbel', true, 2.5],
  ['Decline Bench Press', 'Decline Barbell Bench Press', 'Dada', 'Barbel', true, 2.5],
  ['Dumbbell Bench Press', 'Dumbbell Bench Press', 'Dada', 'Dumbbell', true, 2],
  ['Incline Dumbbell Press', 'Incline Dumbbell Press', 'Dada', 'Dumbbell', true, 2],
  ['Machine Chest Press', 'Chest Press Machine', 'Dada', 'Mesin', true, 2.5],
  ['Chest Fly', 'Pec Deck Fly', 'Dada', 'Mesin', false, 2.5],
  ['Cable Crossover', 'Cable Crossover', 'Dada', 'Kabel', false, 2.5],
  ['Dumbbell Fly', 'Dumbbell Fly', 'Dada', 'Dumbbell', false, 2],
  ['Push Up', 'Push Up', 'Dada', 'Bodyweight', true, 0],
  ['Chest Dip', 'Chest Dip', 'Dada', 'Bodyweight', true, 0],

  // Punggung
  ['Deadlift', 'Conventional Deadlift', 'Punggung', 'Barbel', true, 5],
  ['Sumo Deadlift', 'Sumo Deadlift', 'Punggung', 'Barbel', true, 5],
  ['Barbell Row', 'Bent-over Barbell Row', 'Punggung', 'Barbel', true, 2.5],
  ['T-Bar Row', 'T-Bar Row', 'Punggung', 'Barbel', true, 2.5],
  ['Dumbbell Row', 'One-arm Dumbbell Row', 'Punggung', 'Dumbbell', true, 2],
  ['Seated Cable Row', 'Seated Cable Row', 'Punggung', 'Kabel', true, 2.5],
  ['Lat Pulldown', 'Lat Pulldown', 'Punggung', 'Mesin', true, 2.5],
  ['Pull Up', 'Pull Up', 'Punggung', 'Bodyweight', true, 0],
  ['Chin Up', 'Chin Up', 'Punggung', 'Bodyweight', true, 0],
  ['Inverted Row', 'Inverted Row', 'Punggung', 'Bodyweight', true, 0],
  ['Straight-arm Pulldown', 'Straight-arm Pulldown', 'Punggung', 'Kabel', false, 2.5],
  ['Face Pull', 'Face Pull', 'Punggung', 'Kabel', false, 2.5],
  ['Rack Pull', 'Rack Pull', 'Punggung', 'Barbel', true, 5],
  ['Hyperextension', 'Back Extension', 'Punggung', 'Bodyweight', false, 0],

  // Bahu
  ['Overhead Press', 'Standing Barbell Overhead Press', 'Bahu', 'Barbel', true, 2.5],
  ['Dumbbell Shoulder Press', 'Seated Dumbbell Press', 'Bahu', 'Dumbbell', true, 2],
  ['Arnold Press', 'Arnold Press', 'Bahu', 'Dumbbell', true, 2],
  ['Lateral Raise', 'Dumbbell Lateral Raise', 'Bahu', 'Dumbbell', false, 2],
  ['Front Raise', 'Dumbbell Front Raise', 'Bahu', 'Dumbbell', false, 2],
  ['Rear Delt Fly', 'Dumbbell Rear Delt Fly', 'Bahu', 'Dumbbell', false, 2],
  ['Upright Row', 'Barbell Upright Row', 'Bahu', 'Barbel', false, 2.5],
  ['Shrug', 'Barbell Shrug', 'Bahu', 'Barbel', false, 5],
  ['Cable Lateral Raise', 'Cable Lateral Raise', 'Bahu', 'Kabel', false, 2.5],
  ['Push Press', 'Push Press', 'Bahu', 'Barbel', true, 2.5],

  // Bisep
  ['Barbell Curl', 'Barbell Curl', 'Bisep', 'Barbel', false, 2.5],
  ['Dumbbell Curl', 'Dumbbell Curl', 'Bisep', 'Dumbbell', false, 2],
  ['Hammer Curl', 'Hammer Curl', 'Bisep', 'Dumbbell', false, 2],
  ['Preacher Curl', 'Preacher Curl', 'Bisep', 'Barbel', false, 2.5],
  ['Cable Curl', 'Cable Curl', 'Bisep', 'Kabel', false, 2.5],
  ['Concentration Curl', 'Concentration Curl', 'Bisep', 'Dumbbell', false, 2],

  // Trisep
  ['Close-Grip Bench Press', 'Close-Grip Bench Press', 'Trisep', 'Barbel', true, 2.5],
  ['Triceps Pushdown', 'Cable Triceps Pushdown', 'Trisep', 'Kabel', false, 2.5],
  ['Overhead Triceps Extension', 'Overhead Triceps Extension', 'Trisep', 'Kabel', false, 2.5],
  ['Skull Crusher', 'Lying Triceps Extension', 'Trisep', 'Barbel', false, 2.5],
  ['Dumbbell Kickback', 'Dumbbell Kickback', 'Trisep', 'Dumbbell', false, 2],
  ['Bench Dip', 'Bench Dip', 'Trisep', 'Bodyweight', false, 0],

  // Kaki
  ['Back Squat', 'Barbell Back Squat', 'Kaki', 'Barbel', true, 5],
  ['Front Squat', 'Barbell Front Squat', 'Kaki', 'Barbel', true, 5],
  ['Hack Squat', 'Hack Squat', 'Kaki', 'Mesin', true, 5],
  ['Leg Press', 'Leg Press', 'Kaki', 'Mesin', true, 5],
  ['Romanian Deadlift', 'Romanian Deadlift', 'Kaki', 'Barbel', true, 5],
  ['Leg Extension', 'Leg Extension', 'Kaki', 'Mesin', false, 2.5],
  ['Leg Curl', 'Lying Leg Curl', 'Kaki', 'Mesin', false, 2.5],
  ['Walking Lunge', 'Walking Lunge', 'Kaki', 'Dumbbell', true, 2],
  ['Bulgarian Split Squat', 'Bulgarian Split Squat', 'Kaki', 'Dumbbell', true, 2],
  ['Goblet Squat', 'Goblet Squat', 'Kaki', 'Dumbbell', true, 2],
  ['Step Up', 'Dumbbell Step Up', 'Kaki', 'Dumbbell', true, 2],
  ['Hip Thrust', 'Barbell Hip Thrust', 'Bokong', 'Barbel', true, 5],
  ['Glute Bridge', 'Glute Bridge', 'Bokong', 'Bodyweight', false, 0],
  ['Calf Raise', 'Standing Calf Raise', 'Betis', 'Mesin', false, 2.5],
  ['Seated Calf Raise', 'Seated Calf Raise', 'Betis', 'Mesin', false, 2.5],

  // Perut
  ['Plank', 'Plank', 'Perut', 'Bodyweight', false, 0],
  ['Side Plank', 'Side Plank', 'Perut', 'Bodyweight', false, 0],
  ['Crunch', 'Crunch', 'Perut', 'Bodyweight', false, 0],
  ['Hanging Leg Raise', 'Hanging Leg Raise', 'Perut', 'Bodyweight', false, 0],
  ['Cable Crunch', 'Cable Crunch', 'Perut', 'Kabel', false, 2.5],
  ['Russian Twist', 'Russian Twist', 'Perut', 'Dumbbell', false, 2],
  ['Ab Wheel Rollout', 'Ab Wheel Rollout', 'Perut', 'Lainnya', false, 0],
  ['Dead Bug', 'Dead Bug', 'Perut', 'Bodyweight', false, 0],

  // Full body / lainnya
  ['Power Clean', 'Power Clean', 'Full Body', 'Barbel', true, 5],
  ['Clean and Press', 'Clean and Press', 'Full Body', 'Barbel', true, 5],
  ['Kettlebell Swing', 'Kettlebell Swing', 'Full Body', 'Kettlebell', true, 4],
  ['Farmer Carry', "Farmer's Carry", 'Full Body', 'Dumbbell', true, 2],
  ['Good Morning', 'Good Morning', 'Punggung', 'Barbel', true, 2.5],
  ['Reverse Fly', 'Machine Reverse Fly', 'Bahu', 'Mesin', false, 2.5],
  ['Pec Deck', 'Pec Deck', 'Dada', 'Mesin', false, 2.5],
  ['Smith Machine Squat', 'Smith Machine Squat', 'Kaki', 'Mesin', true, 5],
  ['Smith Machine Press', 'Smith Machine Bench Press', 'Dada', 'Mesin', true, 2.5],
  ['Landmine Press', 'Landmine Press', 'Bahu', 'Barbel', true, 2.5],
  ['Band Pull-apart', 'Band Pull-apart', 'Bahu', 'Band', false, 0],
  ['Nordic Curl', 'Nordic Hamstring Curl', 'Kaki', 'Bodyweight', false, 0],
];

export const SEED_EXERCISES: SeedExercise[] = rows.map(
  ([name, nameEn, muscleGroup, equipment, isCompound, incrementKg]) => ({
    name,
    nameEn,
    muscleGroup,
    equipment,
    isCompound,
    incrementKg,
    repMin: isCompound ? WORKOUT_DEFAULTS.compoundRepMin : WORKOUT_DEFAULTS.isolationRepMin,
    repMax: isCompound ? WORKOUT_DEFAULTS.compoundRepMax : WORKOUT_DEFAULTS.isolationRepMax,
  }),
);
