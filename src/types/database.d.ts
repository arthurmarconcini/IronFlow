export interface UserProfile {
  id?: number // Opcional apenas antes da inserção no DB
  goal: string | null
  heightCm: number | null
  currentWeightKg: number | null
  bmi: number | null
  bmiCategory: string | null
  onboardingCompleted: boolean | null
  syncStatus: 'synced' | 'dirty'
  lastModifiedLocally: number // Unix timestamp
}
