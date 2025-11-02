import { create } from 'zustand'
import { Workout, StrengthExercise } from '../types/database'
import { DatabaseService } from '../db/DatabaseService'
import { useAuthStore } from './authStore'

export interface SetData {
  weightKg: number
  reps: number
}

interface RestTimer {
  isActive: boolean
  duration: number
  remaining: number
}

interface WorkoutExecutionState {
  workout: Workout | null
  currentExerciseIndex: number
  currentSetIndex: number
  completedSets: { [key: string]: SetData } // key: `${exerciseIndex}-${setIndex}`
  restTimer: RestTimer
  workoutLogId: number | null
  isFinished: boolean

  startWorkout: (workout: Workout) => Promise<void>
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
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  completedSets: {},
  restTimer: { isActive: false, duration: 0, remaining: 0 },
  workoutLogId: null,
  isFinished: false,
}

export const useWorkoutExecutionStore = create<WorkoutExecutionState>(
  (set, get) => ({
    ...initialState,

    startWorkout: async (workout) => {
      const userId = useAuthStore.getState().user?.uid
      if (!userId) return

      const workoutLogId = await DatabaseService.startWorkoutLog(
        workout.firestoreId,
        userId,
      )
      set({
        workout,
        workoutLogId,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        completedSets: {},
        isFinished: false,
      })
    },

    completeSet: (setData) => {
      const {
        workout,
        currentExerciseIndex,
        currentSetIndex,
        completedSets,
        workoutLogId,
      } = get()
      if (!workout || !workoutLogId) return

      const exercise = workout.exercises[
        currentExerciseIndex
      ] as StrengthExercise
      const key = `${currentExerciseIndex}-${currentSetIndex}`
      const newCompletedSets = { ...completedSets, [key]: setData }

      set({
        completedSets: newCompletedSets,
        currentSetIndex: currentSetIndex + 1,
      })

      const userId = useAuthStore.getState().user?.uid
      if (userId) {
        DatabaseService.logSetData({
          workoutLogId,
          exerciseName: exercise.name,
          exerciseDbId: exercise.dbId || null,
          setIndex: currentSetIndex + 1,
          targetReps: exercise.reps,
          actualReps: setData.reps,
          targetWeight: exercise.weight || null,
          actualWeight: setData.weightKg,
          restTime: exercise.rest,
          completedAt: Date.now(),
        })
        DatabaseService.saveOrUpdateExerciseRecord({
          userId,
          exerciseName: exercise.name,
          actualWeight: setData.weightKg,
          actualReps: setData.reps,
        })
      }
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
      const isLastSetOfExercise = currentSetIndex === exercise.sets

      if (isLastSetOfExercise) {
        const isLastExercise =
          currentExerciseIndex === workout.exercises.length - 1
        if (isLastExercise) {
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
      set({
        currentExerciseIndex: exerciseIndex,
        currentSetIndex: 0,
        restTimer: { isActive: false, duration: 0, remaining: 0 },
      })
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
