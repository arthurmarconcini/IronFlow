import { create } from 'zustand'
import { Workout, StrengthExercise } from '../types/database'
import { DatabaseService } from '../db/DatabaseService'
import { useAuthStore } from './authStore'

export interface SetData {
  weightKg: number
  reps: number
  rir?: number
}

interface RestTimer {
  isActive: boolean
  duration: number
  remaining: number
}

interface WorkoutExecutionState {
  workout: Workout | null
  logId: number | null // Renomeado de workoutLogId para consistência
  currentExerciseIndex: number
  currentSetIndex: number
  completedSets: { [key: string]: SetData } // key: `${exerciseIndex}-${setIndex}`
  restTimer: RestTimer
  isFinished: boolean

  initializeWorkout: (workoutId: string) => Promise<void>
  completeSet: (setData: SetData) => void
  startRest: () => void
  tickRestTimer: () => void
  finishRest: () => void
  goToNextExercise: () => void
  goToExercise: (exerciseIndex: number) => void
  finishWorkout: () => void
  reset: () => void
}

const initialState = {
  workout: null,
  logId: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  completedSets: {},
  restTimer: { isActive: false, duration: 0, remaining: 0 },
  isFinished: false,
}

export const useWorkoutExecutionStore = create<WorkoutExecutionState>(
  (set, get) => ({
    ...initialState,

    initializeWorkout: async (workoutId) => {
      // Previne recarregamento se o treino já estiver ativo
      if (get().workout?.firestoreId === workoutId && get().logId) {
        return
      }

      const userId = useAuthStore.getState().user?.uid
      if (!userId) return

      const workoutData = await DatabaseService.getWorkoutById(workoutId)
      if (workoutData) {
        const newLogId = await DatabaseService.startWorkoutLog(
          workoutData.firestoreId,
          userId,
        )
        set({
          workout: workoutData,
          logId: newLogId,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          completedSets: {},
          isFinished: false,
          restTimer: { isActive: false, duration: 0, remaining: 0 },
        })
      }
    },

    completeSet: (setData) => {
      const {
        workout,
        currentExerciseIndex,
        currentSetIndex,
        completedSets,
        logId,
      } = get()
      if (!workout || !logId) return

      const exercise = workout.exercises[
        currentExerciseIndex
      ] as StrengthExercise
      const key = `${currentExerciseIndex}-${currentSetIndex}`
      const newCompletedSets = { ...completedSets, [key]: setData }

      // Loga os dados da série ANTES de avançar o índice
      const userId = useAuthStore.getState().user?.uid
      if (userId) {
        DatabaseService.logSetData({
          workoutLogId: logId,
          exerciseName: exercise.name,
          exerciseDbId: exercise.exerciseId || null,
          setIndex: currentSetIndex, // Usa o índice atual
          targetReps: parseInt(exercise.reps, 10) || 0,
          actualReps: setData.reps, // Corrigido de actualRps
          targetWeight: exercise.weight || null,
          actualWeight: setData.weightKg,
          restTime: exercise.rest,
          rir: setData.rir ?? null,
          completedAt: Date.now(),
        })
        DatabaseService.saveOrUpdateExerciseRecord({
          userId,
          exerciseName: exercise.name,
          actualWeight: setData.weightKg,
          actualReps: setData.reps,
        })
      }

      // Avança para a próxima série DEPOIS de logar
      set({
        completedSets: newCompletedSets,
        currentSetIndex: currentSetIndex + 1,
      })
    },

    startRest: () => {
      const { workout, currentExerciseIndex } = get()
      if (!workout) return
      const exercise = workout.exercises[
        currentExerciseIndex
      ] as StrengthExercise
      set({
        restTimer: {
          isActive: true,
          duration: exercise.rest,
          remaining: exercise.rest,
        },
      })
    },

    tickRestTimer: () => {
      set((state) => {
        if (state.restTimer.isActive && state.restTimer.remaining > 0) {
          return {
            restTimer: {
              ...state.restTimer,
              remaining: state.restTimer.remaining - 1,
            },
          }
        } else if (state.restTimer.isActive) {
          get().finishRest()
          return { restTimer: { ...state.restTimer, isActive: false } }
        }
        return {}
      })
    },

    finishRest: () => {
      const { workout, currentExerciseIndex, currentSetIndex } = get()
      if (!workout) return

      set({ restTimer: { isActive: false, duration: 0, remaining: 0 } })

      const exercise = workout.exercises[
        currentExerciseIndex
      ] as StrengthExercise
      const isLastSetOfExercise = currentSetIndex >= exercise.sets

      if (isLastSetOfExercise) {
        const isLastExercise =
          currentExerciseIndex === workout.exercises.length - 1
        if (isLastExercise) {
          // A finalização agora é tratada na UI para chamar o hook
          get().finishWorkout()
        } else {
          get().goToNextExercise()
        }
      }
    },

    goToNextExercise: () => {
      set((state) => ({
        currentExerciseIndex: state.currentExerciseIndex + 1,
        currentSetIndex: 0,
      }))
    },

    goToExercise: (exerciseIndex: number) => {
      const { workout, completedSets } = get()
      if (!workout) return

      const exercise = workout.exercises[exerciseIndex] as StrengthExercise
      let nextSetIndex = 0
      for (let i = 0; i < exercise.sets; i++) {
        if (!completedSets[`${exerciseIndex}-${i}`]) {
          nextSetIndex = i
          break
        }
        nextSetIndex = i + 1
      }

      set({
        currentExerciseIndex: exerciseIndex,
        currentSetIndex: nextSetIndex,
        restTimer: { isActive: false, duration: 0, remaining: 0 },
      })
    },

    finishWorkout: () => {
      // A lógica do DB foi movida para o hook useWorkouts
      set({ isFinished: true })
    },

    reset: () => {
      set(initialState)
    },
  }),
)
