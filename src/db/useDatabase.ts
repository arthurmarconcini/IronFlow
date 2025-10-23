import { useEffect, useState, useCallback } from 'react'
import * as SQLite from 'expo-sqlite'

export interface Exercise {
  name: string
  sets: number
  reps: number
  rest?: number // Tempo de descanso em segundos
}

export interface Workout {
  id: number // ID local do SQLite
  firestoreId: string // ID do Firestore, a fonte da verdade
  name: string
  muscleGroup: string // Novo campo para o grupo muscular
  exercises: Exercise[]
}

interface WorkoutFromDb {
  id: number
  firestore_id: string
  name: string
  muscle_group: string // Novo campo
  exercises_json: string
}

export function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null)
  const [isDbLoading, setIsDbLoading] = useState(true)

  useEffect(() => {
    let database: SQLite.SQLiteDatabase
    async function setupDatabase() {
      setIsDbLoading(true)
      database = await SQLite.openDatabaseAsync('ironflow.db')
      setDb(database)
      setIsDbLoading(false)

      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY NOT NULL,
          firestore_id TEXT UNIQUE NOT NULL,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          muscle_group TEXT NOT NULL,
          exercises_json TEXT NOT NULL
        );
      `)
    }

    setupDatabase()
  }, [])

  const addWorkout = useCallback(
    async (
      firestoreId: string,
      userId: string,
      name: string,
      muscleGroup: string,
      exercises: Exercise[],
    ): Promise<void> => {
      if (!db) return

      const exercisesJson = JSON.stringify(exercises)
      await db.runAsync(
        'INSERT INTO workouts (firestore_id, user_id, name, muscle_group, exercises_json) VALUES (?, ?, ?, ?, ?)',
        firestoreId,
        userId,
        name,
        muscleGroup,
        exercisesJson,
      )
    },
    [db],
  )

  const getWorkouts = useCallback(
    async (userId: string): Promise<Workout[]> => {
      if (!db) return []

      const allRows = await db.getAllAsync<WorkoutFromDb>(
        'SELECT * FROM workouts WHERE user_id = ?',
        userId,
      )
      return allRows.map((row) => ({
        id: row.id,
        firestoreId: row.firestore_id,
        name: row.name,
        muscleGroup: row.muscle_group,
        exercises: JSON.parse(row.exercises_json),
      }))
    },
    [db],
  )

  const deleteWorkoutLocal = useCallback(
    async (firestoreId: string): Promise<void> => {
      if (!db) return
      // A exclusão ainda pode usar apenas o firestoreId, pois ele é globalmente único,
      // mas a busca (get) é a principal barreira de segurança.
      await db.runAsync(
        'DELETE FROM workouts WHERE firestore_id = ?',
        firestoreId,
      )
    },
    [db],
  )

  return { db, isDbLoading, addWorkout, getWorkouts, deleteWorkoutLocal }
}
