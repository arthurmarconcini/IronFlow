import { create } from 'zustand'
import { Exercise, exerciseDB } from '../services/exerciseDB'
import { translateTerm } from '../utils/translationUtils'
import { DatabaseService } from '../db/DatabaseService'

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
    // Evita buscas repetidas se já estiver carregando ou já tiver exercícios.
    if (get().loading || get().exercises.length > 0) return

    set({ loading: true, error: null })
    try {
      // 1. Tenta buscar do cache primeiro
      const cachedExercises = await DatabaseService.getCachedExercises()

      if (cachedExercises && cachedExercises.length > 0) {
        // 2. Se o cache existir, usa os dados cacheados (já estão traduzidos)
        set({
          exercises: cachedExercises,
          filteredExercises: cachedExercises,
          loading: false,
        })
        console.log('Exercises loaded from local cache.')
      } else {
        // 3. Se o cache estiver vazio, busca da API
        console.log('Local cache is empty. Fetching exercises from API...')
        const exercisesFromAPI = await exerciseDB.getAll()

        // 4. Traduz os dados antes de salvar e de exibir
        const translatedExercises = exercisesFromAPI.map((exercise) => ({
          ...exercise,
          bodyPart: translateTerm(exercise.bodyPart, 'bodyPart'),
          equipment: translateTerm(exercise.equipment, 'equipment'),
        }))

        // 5. Salva os dados traduzidos no cache para uso futuro
        await DatabaseService.saveExercises(translatedExercises)

        // 6. Atualiza o estado com os novos dados
        set({
          exercises: translatedExercises,
          filteredExercises: translatedExercises,
          loading: false,
        })
      }
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
      const valueToFilter = exercise[filterType]?.toLowerCase() || ''
      return valueToFilter.includes(lowercasedSearchTerm)
    })

    set({ filteredExercises: filtered })
  },
}))
