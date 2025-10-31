import { create } from 'zustand'
import { Workout, StrengthExercise } from '../types/database'
import { DatabaseService } from '../db/DatabaseService'
import { useAuthStore } from './authStore'

// Define o formato de um log de série individual
export interface SetLog {
  setIndex: number
  weightKg: number | null
  reps: number | null
  completed: boolean
}

// Define o estado do cronômetro de descanso
interface RestTimer {
  isActive: boolean
  duration: number
  remaining: number
}

// Define a estrutura completa do estado de execução do treino
interface WorkoutExecutionState {
  workout: Workout | null
  currentExerciseIndex: number
  currentSetIndex: number
  setLogs: { [exerciseName: string]: SetLog[] }
  restTimer: RestTimer
  workoutLogId: number | null // ID do log principal no DB
  isFinished: boolean

  // Ações para controlar o fluxo do treino
  startWorkout: (workout: Workout) => Promise<void>
  completeSet: (log: { weightKg: number; reps: number }) => void
  startRest: () => void
  tickRestTimer: () => void
  finishRest: () => void
  nextExercise: () => void
  finishWorkout: () => void
  reset: () => void
}

const initialState = {
  workout: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  setLogs: {},
  restTimer: { isActive: false, duration: 0, remaining: 0 },
  workoutLogId: null,
  isFinished: false,
}

export const useWorkoutExecutionStore = create<WorkoutExecutionState>(
  (set, get) => ({
    ...initialState,

    startWorkout: async (workout) => {
      const userId = useAuthStore.getState().user?.uid
      if (!userId) {
        console.error(
          'Usuário não autenticado, não é possível iniciar o log do treino.',
        )
        return
      }

      // Inicia o log no banco de dados
      const workoutLogId = await DatabaseService.startWorkoutLog(
        workout.firestoreId,
        userId,
      )

      // Prepara os logs para cada exercício do treino
      const initialLogs: { [exerciseName: string]: SetLog[] } = {}
      workout.exercises.forEach((exercise) => {
        if (exercise.type === 'strength') {
          initialLogs[exercise.name] = Array.from(
            { length: exercise.sets },
            (_, i) => ({
              setIndex: i + 1,
              weightKg: null,
              reps: null,
              completed: false,
            }),
          )
        }
      })
      set({
        workout,
        setLogs: initialLogs,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        isFinished: false,
        workoutLogId, // Armazena o ID do log
      })
    },

    completeSet: (log) => {
      const {
        workout,
        currentExerciseIndex,
        currentSetIndex,
        setLogs,
        workoutLogId,
      } = get()
      if (!workout || !workoutLogId) return

      const exercise = workout.exercises[
        currentExerciseIndex
      ] as StrengthExercise
      const newLogs = { ...setLogs }
      newLogs[exercise.name][currentSetIndex] = {
        ...newLogs[exercise.name][currentSetIndex],
        weightKg: log.weightKg,
        reps: log.reps,
        completed: true,
      }

      set({ setLogs: newLogs })

      // Salva o log da série no banco de dados
      const userId = useAuthStore.getState().user?.uid
      if (userId) {
        DatabaseService.logSetData({
          workoutLogId,
          exerciseName: exercise.name,
          exerciseDbId: exercise.dbId || null,
          setIndex: currentSetIndex + 1,
          targetReps: exercise.reps,
          actualReps: log.reps,
          targetWeight: exercise.weight || null,
          actualWeight: log.weightKg,
          restTime: exercise.rest,
          completedAt: Date.now(),
        })

        // Salva o recorde do exercício
        DatabaseService.saveOrUpdateExerciseRecord({
          userId,
          exerciseName: exercise.name,
          actualWeight: log.weightKg,
          actualReps: log.reps,
        })
      }
    },

    startRest: () => {
      const { workout, currentExerciseIndex } = get()
      if (!workout) return
      const exercise = workout.exercises[currentExerciseIndex]
      if (exercise.type === 'strength') {
        set({
          restTimer: {
            isActive: true,
            duration: exercise.rest,
            remaining: exercise.rest,
          },
        })
      }
    },

    tickRestTimer: () => {
      const { restTimer } = get()
      if (restTimer.isActive && restTimer.remaining > 0) {
        set({
          restTimer: { ...restTimer, remaining: restTimer.remaining - 1 },
        })
      } else if (restTimer.isActive) {
        get().finishRest()
      }
    },

    finishRest: () => {
      const { workout, currentExerciseIndex, currentSetIndex } = get()
      if (!workout) return

      const exercise = workout.exercises[
        currentExerciseIndex
      ] as StrengthExercise
      const isLastSetOfExercise = currentSetIndex === exercise.sets - 1

      if (isLastSetOfExercise) {
        get().nextExercise()
      } else {
        set({
          currentSetIndex: currentSetIndex + 1,
          restTimer: { isActive: false, duration: 0, remaining: 0 },
        })
      }
    },

    nextExercise: () => {
      const { workout, currentExerciseIndex } = get()
      if (!workout) return

      const isLastExercise =
        currentExerciseIndex === workout.exercises.length - 1
      if (isLastExercise) {
        get().finishWorkout()
      } else {
        set({
          currentExerciseIndex: currentExerciseIndex + 1,
          currentSetIndex: 0,
          restTimer: { isActive: false, duration: 0, remaining: 0 },
        })
      }
    },

    finishWorkout: () => {
      const { workoutLogId } = get()
      if (workoutLogId) {
        DatabaseService.finishWorkoutLog(workoutLogId)
      }
      set({ isFinished: true })
    },
    reset: () => {
      set(initialState)
    },
  }),
)
