import * as SQLite from 'expo-sqlite'
import { UserProfile } from '../types/database'

// Uma única instância do banco de dados para ser usada pelo serviço.
let db: SQLite.SQLiteDatabase

// Interface para o formato de dados retornado do SQLite (snake_case)
interface UserProfileFromDB {
  id: number
  goal: string | null
  height_cm: number | null
  current_weight_kg: number | null
  bmi: number | null
  bmi_category: string | null
  onboarding_completed: number | null // 0, 1, ou NULL
  sync_status: 'synced' | 'dirty'
  last_modified_locally: number
}

/**
 * Inicializa a conexão com o banco de dados e cria a tabela 'user_profile' se ela não existir.
 * Deve ser chamado uma vez na inicialização do aplicativo.
 */
const initDB = async (): Promise<void> => {
  db = await SQLite.openDatabaseAsync('ironflow.db')
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      goal TEXT,
      height_cm REAL,
      current_weight_kg REAL,
      bmi REAL,
      bmi_category TEXT,
      onboarding_completed INTEGER,
      sync_status TEXT NOT NULL,
      last_modified_locally INTEGER NOT NULL
    );
  `)
  console.log('Database and user_profile table initialized.')
}

/**
 * Insere um novo perfil de usuário. Assume que só haverá um perfil, mas não impõe isso.
 * @param profile - O objeto de perfil do usuário a ser inserido.
 * @returns O ID do registro inserido.
 */
const insertUserProfile = async (
  profile: Omit<UserProfile, 'id'>,
): Promise<number> => {
  const onboardingCompleted =
    profile.onboardingCompleted === undefined
      ? null
      : profile.onboardingCompleted
        ? 1
        : 0

  const result = await db.runAsync(
    'INSERT INTO user_profile (goal, height_cm, current_weight_kg, bmi, bmi_category, onboarding_completed, sync_status, last_modified_locally) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    profile.goal ?? null,
    profile.heightCm ?? null,
    profile.currentWeightKg ?? null,
    profile.bmi ?? null,
    profile.bmiCategory ?? null,
    onboardingCompleted,
    profile.syncStatus,
    profile.lastModifiedLocally,
  )
  return result.lastInsertRowId
}

/**
 * Atualiza o perfil do usuário existente.
 * @param id - O ID do perfil a ser atualizado.
 * @param profile - Um objeto contendo os campos a serem atualizados.
 */
const updateUserProfile = async (
  id: number,
  profile: Partial<Omit<UserProfile, 'id'>>,
): Promise<void> => {
  const fields = Object.keys(profile).filter((key) => key !== 'id')

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

/**
 * Retorna todos os registros da tabela 'user_profile' que não estão sincronizados (status 'dirty').
 * @returns Uma lista de perfis de usuário 'dirty'.
 */
const getDirtyRecords = async (): Promise<UserProfile[]> => {
  const dirtyRecords = await db.getAllAsync<UserProfileFromDB>(
    "SELECT * FROM user_profile WHERE sync_status = 'dirty'",
  )

  // Mapeia os nomes de coluna (snake_case) para nomes de propriedade (camelCase)
  return dirtyRecords.map((record) => ({
    id: record.id,
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
  }))
}

export const DatabaseService = {
  initDB,
  insertUserProfile,
  updateUserProfile,
  getDirtyRecords,
}
