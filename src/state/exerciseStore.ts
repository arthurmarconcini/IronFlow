import { create } from 'zustand'
import { Exercise, exerciseDB } from '../services/exerciseDB'
import { useNetworkStore } from './networkStore'
import { translateTerm } from '../utils/translationUtils'

const PAGE_LIMIT = 20

type ActiveQuery =
  | { type: 'initial' }
  | { type: 'search'; value: string }
  | { type: 'bodyPart'; value: string }

interface ExerciseState {
  exercises: Exercise[]
  loading: boolean // Para a carga inicial ou de uma nova query
  loadingMore: boolean // Para o scroll infinito
  error: string | null
  apiLimitError: boolean // Novo estado para o erro de limite da API
  offset: number
  hasMore: boolean
  activeQuery: ActiveQuery
  fetchInitialList: () => Promise<void>
  searchByName: (name: string) => Promise<void>
  fetchByBodyPart: (bodyPart: string) => Promise<void>
  fetchMore: () => Promise<void>
}

const translateExercises = (exercises: Exercise[]): Exercise[] => {
  return exercises.map((exercise) => ({
    ...exercise,
    bodyPart: translateTerm(exercise.bodyPart, 'bodyPart'),
    equipment: translateTerm(exercise.equipment, 'equipment'),
  }))
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  loading: false,
  loadingMore: false,
  error: null,
  apiLimitError: false, // Inicialização do novo estado
  offset: 0,
  hasMore: true,
  activeQuery: { type: 'initial' },

  // --- Ações que iniciam uma nova busca (resetam o estado) ---

  fetchInitialList: async () => {
    const { isOnline } = useNetworkStore.getState()
    if (!isOnline) {
      return set({
        error: 'Você está offline. Conecte-se para buscar exercícios.',
        exercises: [],
      })
    }
    set({
      loading: true,
      error: null,
      apiLimitError: false, // Resetar o erro de limite
      exercises: [],
      offset: 0,
      hasMore: true,
      activeQuery: { type: 'initial' },
    })
    try {
      const newExercises = await exerciseDB.getAll(PAGE_LIMIT, 0)
      set((state) => ({
        exercises: translateExercises(newExercises),
        offset: state.offset + PAGE_LIMIT,
        hasMore: newExercises.length > 0,
      }))
    } catch (e) {
      if (e instanceof Error && e.message === 'API_LIMIT_REACHED') {
        set({ apiLimitError: true })
      } else {
        set({ error: e instanceof Error ? e.message : 'Erro desconhecido' })
      }
    } finally {
      set({ loading: false })
    }
  },

  searchByName: async (name: string) => {
    const { isOnline } = useNetworkStore.getState()
    if (!isOnline) {
      return set({
        error: 'Você está offline. Conecte-se para buscar exercícios.',
        exercises: [],
      })
    }
    if (!name) {
      return get().fetchInitialList()
    }
    set({
      loading: true,
      error: null,
      apiLimitError: false, // Resetar o erro de limite
      exercises: [],
      offset: 0,
      hasMore: true,
      activeQuery: { type: 'search', value: name },
    })
    try {
      const newExercises = await exerciseDB.searchByName(
        name.toLowerCase(),
        PAGE_LIMIT,
        0,
      )
      set((state) => ({
        exercises: translateExercises(newExercises),
        offset: state.offset + PAGE_LIMIT,
        hasMore: newExercises.length > 0,
      }))
    } catch (e) {
      if (e instanceof Error && e.message === 'API_LIMIT_REACHED') {
        set({ apiLimitError: true })
      } else {
        set({ error: e instanceof Error ? e.message : 'Erro desconhecido' })
      }
    } finally {
      set({ loading: false })
    }
  },

  fetchByBodyPart: async (bodyPart: string) => {
    const { isOnline } = useNetworkStore.getState()
    if (!isOnline) {
      return set({
        error: 'Você está offline. Conecte-se para buscar exercícios.',
        exercises: [],
      })
    }
    set({
      loading: true,
      error: null,
      apiLimitError: false, // Resetar o erro de limite
      exercises: [],
      offset: 0,
      hasMore: true,
      activeQuery: { type: 'bodyPart', value: bodyPart },
    })
    try {
      const newExercises = await exerciseDB.getByBodyPart(
        bodyPart.toLowerCase(),
        PAGE_LIMIT,
        0,
      )
      set((state) => ({
        exercises: translateExercises(newExercises),
        offset: state.offset + PAGE_LIMIT,
        hasMore: newExercises.length > 0,
      }))
    } catch (e) {
      if (e instanceof Error && e.message === 'API_LIMIT_REACHED') {
        set({ apiLimitError: true })
      } else {
        set({ error: e instanceof Error ? e.message : 'Erro desconhecido' })
      }
    } finally {
      set({ loading: false })
    }
  },

  // --- Ação para carregar mais resultados (scroll infinito) ---

  fetchMore: async () => {
    const { loadingMore, hasMore, offset, activeQuery, exercises } = get()
    if (loadingMore || !hasMore) return

    set({ loadingMore: true, apiLimitError: false }) // Resetar o erro de limite
    try {
      let newExercises: Exercise[] = []
      const { isOnline } = useNetworkStore.getState()
      if (!isOnline) {
        set({ hasMore: false })
        return
      }

      switch (activeQuery.type) {
        case 'initial':
          newExercises = await exerciseDB.getAll(PAGE_LIMIT, offset)
          break
        case 'search':
          newExercises = await exerciseDB.searchByName(
            activeQuery.value.toLowerCase(),
            PAGE_LIMIT,
            offset,
          )
          break
        case 'bodyPart':
          newExercises = await exerciseDB.getByBodyPart(
            activeQuery.value.toLowerCase(),
            PAGE_LIMIT,
            offset,
          )
          break
      }

      if (newExercises.length > 0) {
        set({
          exercises: [...exercises, ...translateExercises(newExercises)],
          offset: offset + PAGE_LIMIT,
          hasMore: newExercises.length > 0,
        })
      } else {
        set({ hasMore: false })
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'API_LIMIT_REACHED') {
        set({ apiLimitError: true, hasMore: false }) // Para o scroll se o limite for atingido
      } else {
        set({ error: e instanceof Error ? e.message : 'Erro desconhecido' })
      }
    } finally {
      set({ loadingMore: false })
    }
  },
}))
