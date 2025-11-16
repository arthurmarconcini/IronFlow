export interface UserProfile {
  id?: number
  userId: string
  planType: 'free' | 'premium' | null
  displayName: string | null
  dob: string | null
  sex: 'male' | 'female' | 'other' | null
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
  availability: '1-2' | '3-4' | '5+' | null
  goal: 'GAIN_MASS' | 'FAT_LOSS' | 'MAINTAIN' | 'STRENGTH' | null
  equipment: 'full' | 'limited' | null
  heightCm: number | null
  currentWeightKg: number | null
  bmi: number | null
  bmiCategory: string | null
  onboardingCompleted: boolean | null
  syncStatus: 'synced' | 'dirty' | 'error' | 'syncing'
  lastModifiedLocally: number
  retryCount?: number
  nextRetryTimestamp?: number
  lastUpdatedServer?: number
}

// Representa a definição de um exercício na nossa biblioteca principal
export interface ExerciseDefinition {
  id: string // ID original da ExerciseDB
  name: string
  bodyPart: string
  equipment: string
  gifUrl: string
  target: string
  instructions: string[]
  secondaryMuscles: string[]
}

// Base interface for an exercise when it's part of a user's workout
interface BaseExercise {
  name: string
  exerciseId: string // ID que referencia a ExerciseDefinition
}

// Exercise type for strength-based activities
export interface StrengthExercise extends BaseExercise {
  type: 'strength'
  sets: number
  reps: string
  rest: number
  weight?: number
  bodyPart?: string
  equipment?: string
}

// Exercise type for cardio-based activities
export interface CardioExercise extends BaseExercise {
  type: 'cardio'
  durationMinutes: number
}

// Union type for any exercise
export type Exercise = StrengthExercise | CardioExercise

// Representa um treino completo salvo pelo usuário
export interface Workout {
  id: number // ID local do SQLite
  firestoreId: string // ID do Firestore
  name: string
  muscleGroup: string
  exercises: Exercise[]
  lastModified: number
  deletedAt?: number
}

// --- Planos de Treino (Templates) ---

// Representa um "molde" de treino dentro de um WorkoutPlan
export interface WorkoutTemplate {
  name: string
  muscleGroup: string
  exercises: Exercise[]
}

// Representa um plano de treino (template) que os usuários podem importar
export interface WorkoutPlan {
  id: number // ID local do SQLite
  firestoreId: string // ID do Firestore para sincronização
  name: string
  description: string
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  workouts: WorkoutTemplate[]
  isPremium?: boolean // Adicionado para indicar se o plano é premium
}

// --- Agendamento de Treinos ---

// Representa um treino que foi agendado em uma data específica
export interface ScheduledWorkout extends Workout {
  scheduleId: number
  scheduledDate: string
  status: 'scheduled' | 'completed' | 'skipped'
  workoutLogId: number | null
}
