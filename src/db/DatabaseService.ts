import * as SQLite from 'expo-sqlite'
import {
  UserProfile,
  Workout,
  Exercise as WorkoutExercise,
  ExerciseDefinition,
} from '../types/database'

// --- Instância Única do Banco de Dados ---
let db: SQLite.SQLiteDatabase

// --- Interfaces de Mapeamento (snake_case do DB) ---
interface UserProfileFromDB {
  id: number
  user_id: string
  plan_type: 'free' | 'premium' | null
  display_name: string | null
  dob: string | null
  sex: 'male' | 'female' | 'other' | null
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null
  availability: '1-2' | '3-4' | '5+' | null
  goal: 'GAIN_MASS' | 'FAT_LOSS' | 'STRENGTH' | 'MAINTAIN' | null
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
  last_modified: number
  deleted_at: number | null
}

interface ExerciseDefinitionFromDB {
  id: string
  name: string
  bodyPart: string
  equipment: string
  gifUrl: string
  target: string
  instructions_json: string
  secondary_muscles_json: string
}

// --- Funções de Mapeamento (DB -> App) ---
const mapRecordToProfile = (record: UserProfileFromDB): UserProfile => ({
  id: record.id,
  userId: record.user_id,
  planType: record.plan_type,
  displayName: record.display_name,
  dob: record.dob,
  sex: record.sex,
  experienceLevel: record.experience_level,
  availability: record.availability,
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
  lastModified: record.last_modified,
  deletedAt: record.deleted_at ?? undefined,
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
      plan_type TEXT DEFAULT 'free',
      display_name TEXT,
      dob TEXT,
      sex TEXT,
      experience_level TEXT,
      availability TEXT,
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

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      firestore_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      exercises_json TEXT NOT NULL,
      last_modified INTEGER NOT NULL,
      deleted_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      workout_firestore_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS set_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      workout_log_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      exercise_db_id TEXT,
      set_index INTEGER NOT NULL,
      target_reps INTEGER,
      actual_reps INTEGER,
      target_weight_kg REAL,
      actual_weight_kg REAL,
      rest_time_seconds INTEGER,
      completed_at INTEGER NOT NULL,
      FOREIGN KEY (workout_log_id) REFERENCES workout_logs (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exercise_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      best_weight_kg REAL NOT NULL,
      reps_at_best_weight INTEGER NOT NULL,
      achieved_at INTEGER NOT NULL,
      UNIQUE(user_id, exercise_name)
    );

    CREATE TABLE IF NOT EXISTS exercise_definitions (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      body_part TEXT,
      equipment TEXT,
      gif_url TEXT,
      target_muscle TEXT,
      instructions_json TEXT,
      secondary_muscles_json TEXT
    );
  `)
  console.log('Database singleton initialized with all tables.')
}

// --- Funções da Biblioteca de Exercícios ---
const saveExerciseDefinitions = async (
  exercises: ExerciseDefinition[],
): Promise<void> => {
  if (exercises.length === 0) return

  const statement = await db.prepareAsync(
    'INSERT INTO exercise_definitions (id, name, body_part, equipment, gif_url, target_muscle, instructions_json, secondary_muscles_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, body_part=excluded.body_part, equipment=excluded.equipment, gif_url=excluded.gif_url, target_muscle=excluded.target_muscle, instructions_json=excluded.instructions_json, secondary_muscles_json=excluded.secondary_muscles_json',
  )

  try {
    for (const exercise of exercises) {
      await statement.executeAsync(
        exercise.id,
        exercise.name,
        exercise.bodyPart,
        exercise.equipment,
        exercise.gifUrl,
        exercise.target,
        JSON.stringify(exercise.instructions),
        JSON.stringify(exercise.secondaryMuscles),
      )
    }
  } finally {
    await statement.finalizeAsync()
  }
}

const getExerciseDefinitions = async (
  searchTerm: string = '',
  limit: number = 20,
): Promise<ExerciseDefinition[]> => {
  const query = `
    SELECT 
      id, 
      name, 
      body_part as bodyPart, 
      equipment, 
      gif_url as gifUrl, 
      target_muscle as target, 
      instructions_json, 
      secondary_muscles_json 
    FROM exercise_definitions 
    WHERE name LIKE ? 
    LIMIT ?
  `
  const results = await db.getAllAsync<ExerciseDefinitionFromDB>(query, [
    `%${searchTerm}%`,
    limit,
  ])

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    bodyPart: row.bodyPart,
    equipment: row.equipment,
    gifUrl: row.gifUrl,
    target: row.target,
    instructions: JSON.parse(row.instructions_json || '[]'),
    secondaryMuscles: JSON.parse(row.secondary_muscles_json || '[]'),
  }))
}

// --- Funções de Perfil de Usuário ---
const saveUserProfile = async (
  profile: Omit<UserProfile, 'id'>,
): Promise<number> => {
  const {
    userId,
    planType,
    displayName,
    dob,
    sex,
    experienceLevel,
    availability,
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
  try {
    await db.runAsync(
      'INSERT INTO user_profile (user_id, plan_type, display_name, dob, sex, experience_level, availability, goal, height_cm, current_weight_kg, bmi, bmi_category, onboarding_completed, sync_status, last_modified_locally) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET plan_type=excluded.plan_type, display_name=excluded.display_name, dob=excluded.dob, sex=excluded.sex, experience_level=excluded.experience_level, availability=excluded.availability, goal=excluded.goal, height_cm=excluded.height_cm, current_weight_kg=excluded.current_weight_kg, bmi=excluded.bmi, bmi_category=excluded.bmi_category, onboarding_completed=excluded.onboarding_completed, sync_status=excluded.sync_status, last_modified_locally=excluded.last_modified_locally',
      userId,
      planType ?? 'free',
      displayName ?? null,
      dob ?? null,
      sex ?? null,
      experienceLevel ?? null,
      availability ?? null,
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
    if (!savedProfile) {
      throw new Error(
        'Falha ao salvar ou encontrar o perfil do usuário após o upsert.',
      )
    }
    return savedProfile.id!
  } catch (error) {
    console.error('Erro ao executar saveUserProfile:', error)
    throw error
  }
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
  lastModified: number,
): Promise<void> => {
  const exercisesJson = JSON.stringify(exercises)
  await db.runAsync(
    'INSERT INTO workouts (firestore_id, user_id, name, muscle_group, exercises_json, last_modified) VALUES (?, ?, ?, ?, ?, ?)',
    firestoreId,
    userId,
    name,
    muscleGroup,
    exercisesJson,
    lastModified,
  )
}

const updateWorkout = async (
  firestoreId: string,
  name: string,
  muscleGroup: string,
  exercises: WorkoutExercise[],
  lastModified: number,
): Promise<void> => {
  const exercisesJson = JSON.stringify(exercises)
  await db.runAsync(
    'UPDATE workouts SET name = ?, muscle_group = ?, exercises_json = ?, last_modified = ? WHERE firestore_id = ?',
    name,
    muscleGroup,
    exercisesJson,
    lastModified,
    firestoreId,
  )
}

const getWorkouts = async (userId: string): Promise<Workout[]> => {
  const allRows = await db.getAllAsync<WorkoutFromDb>(
    'SELECT * FROM workouts WHERE user_id = ? AND deleted_at IS NULL',
    userId,
  )
  return allRows.map(mapRecordToWorkout)
}

const getAllWorkoutsForSync = async (userId: string): Promise<Workout[]> => {
  const allRows = await db.getAllAsync<WorkoutFromDb>(
    'SELECT * FROM workouts WHERE user_id = ?',
    userId,
  )
  return allRows.map(mapRecordToWorkout)
}

const deleteWorkout = async (firestoreId: string): Promise<void> => {
  const now = Date.now()
  await db.runAsync(
    'UPDATE workouts SET deleted_at = ?, last_modified = ? WHERE firestore_id = ?',
    now,
    now,
    firestoreId,
  )
}

const getWorkoutById = async (firestoreId: string): Promise<Workout | null> => {
  const record = await db.getFirstAsync<WorkoutFromDb>(
    'SELECT * FROM workouts WHERE firestore_id = ? AND deleted_at IS NULL',
    firestoreId,
  )
  return record ? mapRecordToWorkout(record) : null
}

// --- Funções de Logging de Treino ---

interface SetLogData {
  workoutLogId: number
  exerciseName: string
  exerciseDbId: string | null
  setIndex: number
  targetReps: number | null
  actualReps: number | null
  targetWeight: number | null
  actualWeight: number | null
  restTime: number | null
  completedAt: number
}

interface ExerciseRecordData {
  userId: string
  exerciseName: string
  actualWeight: number
  actualReps: number
}

const startWorkoutLog = async (
  workoutFirestoreId: string,
  userId: string,
): Promise<number> => {
  const result = await db.runAsync(
    'INSERT INTO workout_logs (workout_firestore_id, user_id, started_at, status) VALUES (?, ?, ?, ?)',
    workoutFirestoreId,
    userId,
    Date.now(),
    'in_progress',
  )
  return result.lastInsertRowId
}

const logSetData = async (log: SetLogData): Promise<void> => {
  await db.runAsync(
    'INSERT INTO set_logs (workout_log_id, exercise_name, exercise_db_id, set_index, target_reps, actual_reps, target_weight_kg, actual_weight_kg, rest_time_seconds, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    log.workoutLogId,
    log.exerciseName,
    log.exerciseDbId ?? null,
    log.setIndex,
    log.targetReps ?? null,
    log.actualReps ?? null,
    log.targetWeight ?? null,
    log.actualWeight ?? null,
    log.restTime ?? null,
    log.completedAt,
  )
}

const saveOrUpdateExerciseRecord = async (
  record: ExerciseRecordData,
): Promise<void> => {
  const { userId, exerciseName, actualWeight, actualReps } = record
  const existingRecord = await db.getFirstAsync<{ best_weight_kg: number }>(
    'SELECT best_weight_kg FROM exercise_records WHERE user_id = ? AND exercise_name = ?',
    userId,
    exerciseName,
  )

  if (!existingRecord || actualWeight > existingRecord.best_weight_kg) {
    await db.runAsync(
      'INSERT INTO exercise_records (user_id, exercise_name, best_weight_kg, reps_at_best_weight, achieved_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, exercise_name) DO UPDATE SET best_weight_kg=excluded.best_weight_kg, reps_at_best_weight=excluded.reps_at_best_weight, achieved_at=excluded.achieved_at',
      userId,
      exerciseName,
      actualWeight,
      actualReps,
      Date.now(),
    )
  }
}

const finishWorkoutLog = async (workoutLogId: number): Promise<void> => {
  await db.runAsync(
    "UPDATE workout_logs SET finished_at = ?, status = 'completed' WHERE id = ?",
    Date.now(),
    workoutLogId,
  )
}

export interface ExerciseRecord {
  weight: number
  reps: number
}

const getExerciseRecord = async (
  userId: string,
  exerciseName: string,
): Promise<ExerciseRecord | null> => {
  const record = await db.getFirstAsync<{
    best_weight_kg: number
    reps_at_best_weight: number
  }>(
    'SELECT best_weight_kg, reps_at_best_weight FROM exercise_records WHERE user_id = ? AND exercise_name = ?',
    userId,
    exerciseName,
  )

  if (!record) return null

  return {
    weight: record.best_weight_kg,
    reps: record.reps_at_best_weight,
  }
}

// --- Funções de Estatísticas ---
const getWorkoutLogsCount = async (userId: string): Promise<number> => {
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM workout_logs WHERE user_id = ? AND status = 'completed'",
    userId,
  )
  return result?.count ?? 0
}

const getTotalSetsCompleted = async (userId: string): Promise<number> => {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(s.id) as count FROM set_logs s JOIN workout_logs w ON s.workout_log_id = w.id WHERE w.user_id = ?',
    userId,
  )
  return result?.count ?? 0
}

// --- Exportação do Serviço ---
export const DatabaseService = {
  initDB,
  saveExerciseDefinitions,
  getExerciseDefinitions,
  saveUserProfile,
  getUserProfileByUserId,
  getRecordsToSync,
  updateUserProfile,
  getDirtyRecords,
  addWorkout,
  updateWorkout,
  getWorkouts,
  getAllWorkoutsForSync,
  deleteWorkout,
  getWorkoutById,
  startWorkoutLog,
  logSetData,
  saveOrUpdateExerciseRecord,
  finishWorkoutLog,
  getExerciseRecord,
  getWorkoutLogsCount,
  getTotalSetsCompleted,
}
