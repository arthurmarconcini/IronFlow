import { create } from 'zustand'
import { Workout } from '../types/database'

type TimerState = 'idle' | 'running' | 'paused' | 'resting'

type SetLog = {
  exerciseIndex: number
  setIndex: number
  reps: number | null
  weight: number | null
  completedAt: number // timestamp
}

interface WorkoutExecutionState {
  currentWorkout: Workout | null
  currentExerciseIndex: number
  currentSetIndex: number
  setLogs: SetLog[]
  timerState: TimerState
  timerValue: number // in seconds
  restTimeTarget: number // in seconds

  // Actions
  startWorkout: (workout: Workout) => void
  nextSet: () => void
  previousSet: () => void
  logSet: (log: { reps: number | null; weight: number | null }) => void
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  startRestTimer: () => void
  tickTimer: () => void
  resetTimer: () => void
  endWorkout: () => void
}

const initialState = {
  currentWorkout: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  setLogs: [],
  timerState: 'idle' as TimerState,
  timerValue: 0,
  restTimeTarget: 0,
}

export const useWorkoutExecutionStore = create<WorkoutExecutionState>(
  (set, get) => ({
    ...initialState,

    startWorkout: (workout) => {
      set({
        ...initialState,
        currentWorkout: workout,
      })
    },

    nextSet: () => {
      const { currentWorkout, currentExerciseIndex, currentSetIndex } = get()
      if (!currentWorkout) return

      const currentExercise = currentWorkout.exercises[currentExerciseIndex]

      // Case 1: More sets in the current exercise
      if (currentSetIndex < currentExercise.sets - 1) {
        set({ currentSetIndex: currentSetIndex + 1 })
        return
      }

      // Case 2: Last set, but more exercises left
      if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
        set({
          currentExerciseIndex: currentExerciseIndex + 1,
          currentSetIndex: 0,
        })
        return
      }

      // Case 3: Last set of the last exercise (workout ends)
      // The UI will handle the completion logic
    },

    previousSet: () => {
      const { currentWorkout, currentExerciseIndex, currentSetIndex } = get()
      if (!currentWorkout) return

      // Case 1: Not the first set of the current exercise
      if (currentSetIndex > 0) {
        set({ currentSetIndex: currentSetIndex - 1 })
        return
      }

      // Case 2: First set, but not the first exercise
      if (currentExerciseIndex > 0) {
        const prevExerciseIndex = currentExerciseIndex - 1
        const prevExercise = currentWorkout.exercises[prevExerciseIndex]
        set({
          currentExerciseIndex: prevExerciseIndex,
          currentSetIndex: prevExercise.sets - 1, // Go to the last set of the previous exercise
        })
      }
    },

    logSet: (log) => {
      const { currentExerciseIndex, currentSetIndex } = get()
      const newLog: SetLog = {
        ...log,
        exerciseIndex: currentExerciseIndex,
        setIndex: currentSetIndex,
        completedAt: Date.now(),
      }
      set((state) => ({
        setLogs: [...state.setLogs, newLog],
      }))
    },

    startTimer: () => set({ timerState: 'running' }),
    pauseTimer: () => set({ timerState: 'paused' }),
    resumeTimer: () => set({ timerState: 'running' }),

    startRestTimer: () => {
      const { currentWorkout, currentExerciseIndex } = get()
      if (!currentWorkout) return

      const currentExercise = currentWorkout.exercises[currentExerciseIndex]
      const restTime = currentExercise.rest ?? 60 // Default to 60s if not set

      set({
        timerState: 'resting',
        timerValue: restTime,
        restTimeTarget: restTime,
      })
    },

    tickTimer: () => {
      const { timerValue } = get()
      if (timerValue <= 1) {
        // Timer finished, reset it
        set({ timerState: 'idle', timerValue: 0 })
      } else {
        set({ timerValue: timerValue - 1 })
      }
    },

    resetTimer: () =>
      set({ timerState: 'idle', timerValue: 0, restTimeTarget: 0 }),

    endWorkout: () => {
      set(initialState)
    },
  }),
)
