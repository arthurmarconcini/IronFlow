export interface UserProfile {
  id?: number
  userId: string
  displayName: string | null
  dob: string | null
  sex: 'male' | 'female' | 'other' | null
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
  availability: '1-2' | '3-4' | '5+' | null
  goal: string | null
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

// Base interface for all exercises
interface BaseExercise {
  name: string
  dbId?: string // ID from ExerciseDB
}

// Exercise type for strength-based activities
export interface StrengthExercise extends BaseExercise {
  type: 'strength'
  sets: number
  reps: number
  rest: number
  weight?: number
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
