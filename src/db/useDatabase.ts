import { useEffect, useState } from 'react'
import * as SQLite from 'expo-sqlite'

export interface Exercise {
  name: string
  sets: number
  reps: number
}

export interface Workout {
  id: number
  name: string
  exercises: Exercise[] // JSON-stringified array of exercises
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
          name TEXT NOT NULL,
          exercises_json TEXT NOT NULL
        );
      `)
    }

    setupDatabase()
  }, [])

  const addWorkout = async (
    name: string,
    exercises: Exercise[],
  ): Promise<void> => {
    if (!db) return

    const exercisesJson = JSON.stringify(exercises)
    await db.runAsync(
      'INSERT INTO workouts (name, exercises_json) VALUES (?, ?)',
      name,
      exercisesJson,
    )
  }

  const getWorkouts = async (): Promise<Workout[]> => {
    if (!db) return []

    const allRows = await db.getAllAsync<Workout>('SELECT * FROM workouts')
    return allRows.map((row) => ({
      ...row,
      exercises: JSON.parse(row.exercises_json),
    }))
  }

  return { db, addWorkout, getWorkouts }
}
