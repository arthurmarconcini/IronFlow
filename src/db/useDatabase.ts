import { useEffect, useState, useCallback } from 'react'
import * as SQLite from 'expo-sqlite'

export interface Exercise {
  name: string
  sets: number
  reps: number
}

export interface Workout {
  id: number // ID local do SQLite
  firestoreId: string // ID do Firestore, a fonte da verdade
  name: string
  exercises: Exercise[]
}

interface WorkoutFromDb {
  id: number
  firestore_id: string
  name: string
  exercises_json: string
}

export function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null)

  useEffect(() => {
    let database: SQLite.SQLiteDatabase
    async function setupDatabase() {
      database = await SQLite.openDatabaseAsync('ironflow.db')
      setDb(database)

      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY NOT NULL,
          firestore_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          exercises_json TEXT NOT NULL
        );
      `)
    }

    setupDatabase()
  }, [])

  const addWorkout = useCallback(
    async (
      firestoreId: string,
      name: string,
      exercises: Exercise[],
    ): Promise<void> => {
      if (!db) return

      const exercisesJson = JSON.stringify(exercises)
      await db.runAsync(
        'INSERT INTO workouts (firestore_id, name, exercises_json) VALUES (?, ?, ?)',
        firestoreId,
        name,
        exercisesJson,
      )
    },
    [db],
  )

  const getWorkouts = useCallback(async (): Promise<Workout[]> => {
    if (!db) return []

    const allRows = await db.getAllAsync<WorkoutFromDb>(
      'SELECT * FROM workouts',
    )
    return allRows.map((row) => ({
      id: row.id,
      firestoreId: row.firestore_id,
      name: row.name,
      exercises: JSON.parse(row.exercises_json),
    }))
  }, [db])

  const deleteWorkoutLocal = useCallback(
    async (firestoreId: string): Promise<void> => {
      if (!db) return
      await db.runAsync(
        'DELETE FROM workouts WHERE firestore_id = ?',
        firestoreId,
      )
    },
    [db],
  )

  return { db, addWorkout, getWorkouts, deleteWorkoutLocal }
}
