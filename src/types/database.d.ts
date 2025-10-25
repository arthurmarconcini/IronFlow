export interface UserProfile {
  id?: number // Opcional apenas antes da inserção no DB
  userId: string // ID do Firebase Auth
  goal: string | null
  heightCm: number | null
  currentWeightKg: number | null
  bmi: number | null
  bmiCategory: string | null
  onboardingCompleted: boolean | null
  syncStatus: 'synced' | 'dirty' | 'error' | 'syncing'
  lastModifiedLocally: number // Unix timestamp
  retryCount?: number
  nextRetryTimestamp?: number
  lastUpdatedServer?: number // Timestamp da última escrita bem-sucedida no servidor
}
