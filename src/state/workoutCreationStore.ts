import { create } from 'zustand'
import { Exercise } from '../db/useDatabase'

interface WorkoutCreationState {
  workoutName: string
  muscleGroup: string
  exercises: Exercise[]
  setWorkoutName: (name: string) => void
  setMuscleGroup: (group: string) => void
  addExercise: (exercise: Exercise) => void
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
  reset: () => set({ workoutName: '', muscleGroup: '', exercises: [] }),
}))
