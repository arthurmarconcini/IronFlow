import { create } from 'zustand'

// Base interface for all exercises
interface BaseExercise {
  name: string
  dbId?: string // ID from ExerciseDB
}

// Exercise type for strength-based activities
export interface StrengthExercise extends BaseExercise {
  type: 'strength'
  sets: number
  reps: string
  rest: number
  weight?: number
}

// Exercise type for cardio-based activities
export interface CardioExercise extends BaseExercise {
  type: 'cardio'
  durationMinutes: number
}

// Union type for any exercise
export type Exercise = StrengthExercise | CardioExercise

interface WorkoutCreationState {
  workoutName: string
  muscleGroup: string
  exercises: Exercise[]
  setWorkoutName: (name: string) => void
  setMuscleGroup: (group: string) => void
  addExercise: (exercise: Exercise) => void
  setExercises: (exercises: Exercise[]) => void
  reset: () => void
}

export const useWorkoutCreationStore = create<WorkoutCreationState>((set) => ({
  workoutName: '',
  muscleGroup: '',
  exercises: [],
  setWorkoutName: (name) => set({ workoutName: name }),
  setMuscleGroup: (group) => set({ muscleGroup: group }),
  addExercise: (exercise) =>
    set((state) => ({ exercises: [...state.exercises, exercise] })),
  setExercises: (exercises) => set({ exercises }),
  reset: () => set({ workoutName: '', muscleGroup: '', exercises: [] }),
}))
