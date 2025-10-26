import { create } from 'zustand'
import { Exercise, exerciseDB } from '../services/exerciseDB'

interface ExerciseState {
  exercises: Exercise[]
  filteredExercises: Exercise[]
  loading: boolean
  error: string | null
  fetchExercises: () => Promise<void>
  filterExercises: (
    searchTerm: string,
    filterType: 'bodyPart' | 'name' | 'equipment',
  ) => void
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  filteredExercises: [],
  loading: false,
  error: null,
  fetchExercises: async () => {
    set({ loading: true, error: null })
    try {
      const exercises = await exerciseDB.getAll()
      set({ exercises, filteredExercises: exercises, loading: false })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred'
      set({ error: errorMessage, loading: false })
    }
  },
  filterExercises: (
    searchTerm: string,
    filterType: 'bodyPart' | 'name' | 'equipment',
  ) => {
    const { exercises } = get()
    if (!searchTerm) {
      set({ filteredExercises: exercises })
      return
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = exercises.filter((exercise) => {
      const valueToFilter = exercise[filterType].toLowerCase()
      return valueToFilter.includes(lowercasedSearchTerm)
    })

    set({ filteredExercises: filtered })
  },
}))
