import * as SQLite from 'expo-sqlite'
import { UserProfile } from '../types/database'

// Uma única instância do banco de dados para ser usada pelo serviço.
let db: SQLite.SQLiteDatabase

// Interface para o formato de dados retornado do SQLite (snake_case)
interface UserProfileFromDB {
  id: number
  user_id: string
  goal: string | null
  height_cm: number | null
  current_weight_kg: number | null
  bmi: number | null
  bmi_category: string | null
  onboarding_completed: number | null // 0, 1, ou NULL
  sync_status: 'synced' | 'dirty' | 'error' | 'syncing'
  last_modified_locally: number
  retry_count: number | null
  next_retry_timestamp: number | null
  last_updated_server: number | null
}

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

/**
 * Inicializa a conexão com o banco de dados e cria/atualiza a tabela 'user_profile'.
 */
const initDB = async (): Promise<void> => {
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
  `)
  // TODO: Adicionar lógica de migração para adicionar novas colunas se a tabela já existir
  console.log('Database and user_profile table initialized.')
}

/**
 * Insere ou atualiza um perfil de usuário (upsert).
 * Se um perfil com o mesmo userId já existir, ele será atualizado.
 * @param profile - O objeto de perfil do usuário a ser salvo.
 * @returns O ID do registro inserido ou atualizado.
 */
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
    `INSERT INTO user_profile (user_id, goal, height_cm, current_weight_kg, bmi, bmi_category, onboarding_completed, sync_status, last_modified_locally)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       goal=excluded.goal,
       height_cm=excluded.height_cm,
       current_weight_kg=excluded.current_weight_kg,
       bmi=excluded.bmi,
       bmi_category=excluded.bmi_category,
       onboarding_completed=excluded.onboarding_completed,
       sync_status=excluded.sync_status,
       last_modified_locally=excluded.last_modified_locally`,
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

  // Após um upsert, precisamos buscar o registro para garantir que temos o ID correto.
  const savedProfile = await getUserProfileByUserId(userId)
  if (!savedProfile) {
    throw new Error(
      'Falha ao salvar ou encontrar o perfil do usuário após o upsert.',
    )
  }
  return savedProfile.id!
}

/**
 * Busca um perfil de usuário pelo seu ID de usuário.
 */
const getUserProfileByUserId = async (
  userId: string,
): Promise<UserProfile | null> => {
  const record = await db.getFirstAsync<UserProfileFromDB>(
    'SELECT * FROM user_profile WHERE user_id = ?',
    userId,
  )
  return record ? mapRecordToProfile(record) : null
}

/**
 * Retorna registros que precisam ser sincronizados.
 * Inclui registros 'dirty' e registros 'error' cujo tempo de nova tentativa chegou.
 */
const getRecordsToSync = async (): Promise<UserProfile[]> => {
  const now = Date.now()
  const records = await db.getAllAsync<UserProfileFromDB>(
    "SELECT * FROM user_profile WHERE sync_status = 'dirty' OR (sync_status = 'error' AND (next_retry_timestamp IS NULL OR next_retry_timestamp <= ?))",
    now,
  )
  return records.map(mapRecordToProfile)
}

/**
 * Atualiza o perfil do usuário existente.
 */
const updateUserProfile = async (
  id: number,
  profile: Partial<Omit<UserProfile, 'id' | 'userId'>>,
): Promise<void> => {
  const fields = Object.keys(profile)

  const values = fields.map((key) => {
    const value = profile[key as keyof typeof profile]
    if (value === undefined) {
      return null
    }
    return typeof value === 'boolean' ? (value ? 1 : 0) : value
  })

  if (fields.length === 0) {
    console.warn('updateUserProfile called with no fields to update.')
    return
  }

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

// Manter getDirtyRecords pode ser útil para UI, mas a sincronização usará getRecordsToSync
const getDirtyRecords = async (): Promise<UserProfile[]> => {
  const dirtyRecords = await db.getAllAsync<UserProfileFromDB>(
    "SELECT * FROM user_profile WHERE sync_status = 'dirty' OR sync_status = 'error' OR sync_status = 'syncing'",
  )
  return dirtyRecords.map(mapRecordToProfile)
}

export const DatabaseService = {
  initDB,
  saveUserProfile,
  getUserProfileByUserId,
  getRecordsToSync, // Nova função exportada
  updateUserProfile,
  getDirtyRecords,
}
