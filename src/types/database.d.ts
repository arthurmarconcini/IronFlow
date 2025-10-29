export interface UserProfile {
  id?: number
  userId: string
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

// Representa um exercício dentro de um treino salvo pelo usuário
export interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number // Peso alvo em kg
  rest: number
  dbId?: string // ID opcional do exercício da API ExerciseDB
}

// Representa um treino completo salvo pelo usuário
export interface Workout {
  id: number // ID local do SQLite
  firestoreId: string // ID do Firestore
  name: string
  muscleGroup: string
  exercises: Exercise[]
  lastModified: number
}
