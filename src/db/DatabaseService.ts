import * as SQLite from 'expo-sqlite'
import {
  UserProfile,
  Workout,
  Exercise as WorkoutExercise,
} from '../types/database'
import { Exercise as ApiExercise } from '../services/exerciseDB'

// --- Instância Única do Banco de Dados ---
let db: SQLite.SQLiteDatabase

// --- Interfaces de Mapeamento (snake_case do DB) ---
interface UserProfileFromDB {
  id: number
  user_id: string
  goal: string | null
  height_cm: number | null
  current_weight_kg: number | null
  bmi: number | null
  bmi_category: string | null
  onboarding_completed: number | null
  sync_status: 'synced' | 'dirty' | 'error' | 'syncing'
  last_modified_locally: number
  retry_count: number | null
  next_retry_timestamp: number | null
  last_updated_server: number | null
}

interface WorkoutFromDb {
  id: number
  firestore_id: string
  name: string
  muscle_group: string
  exercises_json: string
}

interface ApiExerciseFromDB {
  id: string
  name: string
  body_part: string
  target: string
  gif_url: string | null
  equipment: string
}

// --- Funções de Mapeamento (DB -> App) ---
const mapRecordToProfile = (record: UserProfileFromDB): UserProfile => ({
  id: record.id,
  userId: record.user_id,
  goal: record.goal,
  heightCm: record.height_cm,
  currentWeightKg: record.current_weight_kg,
  bmi: record.bmi,
  bmiCategory: record.bmi_category,
  onboardingCompleted:
    record.onboarding_completed === null
      ? null
      : record.onboarding_completed === 1,
  syncStatus: record.sync_status,
  lastModifiedLocally: record.last_modified_locally,
  retryCount: record.retry_count ?? undefined,
  nextRetryTimestamp: record.next_retry_timestamp ?? undefined,
  lastUpdatedServer: record.last_updated_server ?? undefined,
})

const mapRecordToWorkout = (record: WorkoutFromDb): Workout => ({
  id: record.id,
  firestoreId: record.firestore_id,
  name: record.name,
  muscleGroup: record.muscle_group,
  exercises: JSON.parse(record.exercises_json),
})

// --- Função de Inicialização ---
const initDB = async (): Promise<void> => {
  if (db) return
  db = await SQLite.openDatabaseAsync('ironflow.db')
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL UNIQUE,
      goal TEXT,
      height_cm REAL,
      current_weight_kg REAL,
      bmi REAL,
      bmi_category TEXT,
      onboarding_completed INTEGER,
      sync_status TEXT NOT NULL,
      last_modified_locally INTEGER NOT NULL,
      retry_count INTEGER DEFAULT 0,
      next_retry_timestamp INTEGER,
      last_updated_server INTEGER
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      body_part TEXT NOT NULL,
      target TEXT NOT NULL,
      gif_url TEXT,
      equipment TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      firestore_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      exercises_json TEXT NOT NULL
    );
  `)
  console.log('Database singleton initialized with all tables.')
}

// --- Funções de Cache de Exercícios ---
const saveExercises = async (exercises: ApiExercise[]): Promise<void> => {
  await db.withTransactionAsync(async () => {
    for (const exercise of exercises) {
      await db.runAsync(
        'INSERT OR REPLACE INTO exercises (id, name, body_part, target, gif_url, equipment) VALUES (?, ?, ?, ?, ?, ?);',
        [
          exercise.id,
          exercise.name,
          exercise.bodyPart,
          exercise.target,
          exercise.gifUrl ?? null,
          exercise.equipment,
        ],
      )
    }
  })
}

const getCachedExercises = async (): Promise<ApiExercise[]> => {
  const results = await db.getAllAsync<ApiExerciseFromDB>(
    'SELECT * FROM exercises',
  )
  return results.map((row) => ({
    id: row.id,
    name: row.name,
    bodyPart: row.body_part,
    target: row.target,
    gifUrl: row.gif_url ?? undefined,
    equipment: row.equipment,
  }))
}

// --- Funções de Perfil de Usuário ---
const saveUserProfile = async (
  profile: Omit<UserProfile, 'id'>,
): Promise<number> => {
  const {
    userId,
    goal,
    heightCm,
    currentWeightKg,
    bmi,
    bmiCategory,
    onboardingCompleted,
    syncStatus,
    lastModifiedLocally,
  } = profile
  const onboardingCompletedInt =
    onboardingCompleted === null ? null : onboardingCompleted ? 1 : 0
  await db.runAsync(
    'INSERT INTO user_profile (user_id, goal, height_cm, current_weight_kg, bmi, bmi_category, onboarding_completed, sync_status, last_modified_locally) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET goal=excluded.goal, height_cm=excluded.height_cm, current_weight_kg=excluded.current_weight_kg, bmi=excluded.bmi, bmi_category=excluded.bmi_category, onboarding_completed=excluded.onboarding_completed, sync_status=excluded.sync_status, last_modified_locally=excluded.last_modified_locally',
    userId,
    goal ?? null,
    heightCm ?? null,
    currentWeightKg ?? null,
    bmi ?? null,
    bmiCategory ?? null,
    onboardingCompletedInt,
    syncStatus,
    lastModifiedLocally,
  )
  const savedProfile = await getUserProfileByUserId(userId)
  if (!savedProfile)
    throw new Error('Failed to save or find user profile after upsert.')
  return savedProfile.id!
}

const getUserProfileByUserId = async (
  userId: string,
): Promise<UserProfile | null> => {
  const record = await db.getFirstAsync<UserProfileFromDB>(
    'SELECT * FROM user_profile WHERE user_id = ?',
    userId,
  )
  return record ? mapRecordToProfile(record) : null
}

const getRecordsToSync = async (): Promise<UserProfile[]> => {
  const now = Date.now()
  const records = await db.getAllAsync<UserProfileFromDB>(
    "SELECT * FROM user_profile WHERE sync_status = 'dirty' OR (sync_status = 'error' AND (next_retry_timestamp IS NULL OR next_retry_timestamp <= ?))",
    now,
  )
  return records.map(mapRecordToProfile)
}

const updateUserProfile = async (
  id: number,
  profile: Partial<Omit<UserProfile, 'id' | 'userId'>>,
): Promise<void> => {
  const fields = Object.keys(profile)
  const values = fields.map((key) => {
    const value = profile[key as keyof typeof profile]
    if (value === undefined) return null
    return typeof value === 'boolean' ? (value ? 1 : 0) : value
  })
  if (fields.length === 0) return
  const setClause = fields
    .map(
      (field) =>
        `${field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} = ?`,
    )
    .join(', ')
  await db.runAsync(
    `UPDATE user_profile SET ${setClause} WHERE id = ?`,
    ...values,
    id,
  )
}

const getDirtyRecords = async (): Promise<UserProfile[]> => {
  const dirtyRecords = await db.getAllAsync<UserProfileFromDB>(
    "SELECT * FROM user_profile WHERE sync_status = 'dirty' OR sync_status = 'error' OR sync_status = 'syncing'",
  )
  return dirtyRecords.map(mapRecordToProfile)
}

// --- Funções de Treinos (Workouts) ---
const addWorkout = async (
  firestoreId: string,
  userId: string,
  name: string,
  muscleGroup: string,
  exercises: WorkoutExercise[],
): Promise<void> => {
  const exercisesJson = JSON.stringify(exercises)
  await db.runAsync(
    'INSERT INTO workouts (firestore_id, user_id, name, muscle_group, exercises_json) VALUES (?, ?, ?, ?, ?)',
    firestoreId,
    userId,
    name,
    muscleGroup,
    exercisesJson,
  )
}

const getWorkouts = async (userId: string): Promise<Workout[]> => {
  const allRows = await db.getAllAsync<WorkoutFromDb>(
    'SELECT * FROM workouts WHERE user_id = ?',
    userId,
  )
  return allRows.map(mapRecordToWorkout)
}

const deleteWorkout = async (firestoreId: string): Promise<void> => {
  await db.runAsync('DELETE FROM workouts WHERE firestore_id = ?', firestoreId)
}

// --- Exportação do Serviço ---
export const DatabaseService = {
  initDB,
  saveUserProfile,
  getUserProfileByUserId,
  getRecordsToSync,
  updateUserProfile,
  getDirtyRecords,
  saveExercises,
  getCachedExercises,
  addWorkout,
  getWorkouts,
  deleteWorkout,
}
