import { create } from 'zustand'
import { StrengthExercise, CardioExercise, Exercise } from '../types/database'

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

// Exporta os tipos para que a CreateWorkoutScreen possa usá-los
export type { StrengthExercise, CardioExercise, Exercise }
