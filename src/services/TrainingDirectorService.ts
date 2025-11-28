import {
  UserProfile,
  WorkoutPlan,
  StrengthExercise,
  WorkoutTemplate,
  CardioExercise,
} from '../types/database'

// --- CONSTANTS & TYPES ---

type Goal = 'STRENGTH' | 'FAT_LOSS' | 'MAINTAIN' | 'GAIN_MASS'

type Availability = '1-2' | '3-4' | '5+'

interface VolumeGuidelines {
  sets: number
  reps: string
  rest: number
  intensity: 'low' | 'moderate' | 'high'
}

// Science-based volume guidelines
const VOLUME_GUIDELINES: Record<Goal, VolumeGuidelines> = {
  STRENGTH: { sets: 5, reps: '3-5', rest: 180, intensity: 'high' },
  GAIN_MASS: { sets: 4, reps: '8-12', rest: 90, intensity: 'moderate' },
  FAT_LOSS: { sets: 3, reps: '12-15', rest: 60, intensity: 'moderate' },
  MAINTAIN: { sets: 3, reps: '10-12', rest: 90, intensity: 'low' },
}

const getVolume = (goal: Goal | null): VolumeGuidelines => {
  return VOLUME_GUIDELINES[goal || 'MAINTAIN']
}

const createExercise = (
  id: string,
  name: string,
  volume: VolumeGuidelines,
): StrengthExercise => ({
  exerciseId: id,
  name: name, // In a real app, we'd fetch the name from DB based on ID
  type: 'strength',
  sets: volume.sets,
  reps: volume.reps,
  rest: volume.rest,
})

const createCardioSession = (duration: number): CardioExercise => ({
  exerciseId: 'cardio_generic',
  name: 'Sessão de Cardio',
  type: 'cardio',
  durationMinutes: duration,
})

// --- CORE GENERATION LOGIC ---

const generateWorkoutPlan = (
  profile: UserProfile,
): Omit<WorkoutPlan, 'id' | 'firestoreId'> => {
  const {
    availability,
    experienceLevel,
    goal,
    sex,
    cardioPreference,
    stretchingPreference,
  } = profile

  const volume = getVolume(goal)
  let workouts: WorkoutTemplate[] = []
  let planName = ''
  let planDescription = ''

  // 1. Determine Split based on Availability & Experience
  if (availability === '1-2' || experienceLevel === 'beginner') {
    planName = 'Fundamentos Full Body'
    planDescription = 'Treinos de corpo inteiro focados em grandes movimentos.'

    // Workout A
    const workoutA: WorkoutTemplate = {
      name: 'Full Body A',
      muscleGroup: 'Corpo Inteiro',
      exercises: [
        createExercise('0783', 'Agachamento Livre', volume),
        createExercise('0025', 'Supino Reto', volume),
        createExercise('remada_curvada', 'Remada Curvada', volume),
        createExercise('0603', 'Desenvolvimento Militar', volume),
      ],
    }

    // Workout B
    const workoutB: WorkoutTemplate = {
      name: 'Full Body B',
      muscleGroup: 'Corpo Inteiro',
      exercises: [
        createExercise('0007', 'Levantamento Terra', volume),
        createExercise('0564', 'Leg Press 45º', volume),
        createExercise('puxada_vertical', 'Puxada Vertical', volume),
        createExercise('supino_inclinado_halteres', 'Supino Inclinado', volume),
      ],
    }

    // Biology Adjustment: Female users often benefit from/prefer more glute volume
    if (sex === 'female') {
      workoutA.exercises.push(
        createExercise('elevacao_pelvica', 'Elevação Pélvica', {
          ...volume,
          sets: 3,
          reps: '12-15',
        }),
      )
      workoutB.exercises.push(
        createExercise('agachamento_bulgaro', 'Agachamento Búlgaro', {
          ...volume,
          sets: 3,
          reps: '10-12',
        }),
      )
    }

    workouts = [workoutA, workoutB]
  } else if (availability === '3-4') {
    planName = 'Divisão Upper/Lower'
    planDescription = 'Equilíbrio ideal entre frequência e recuperação.'

    const upper: WorkoutTemplate = {
      name: 'Superiores',
      muscleGroup: 'Peito, Costas, Ombros, Braços',
      exercises: [
        createExercise('0025', 'Supino Reto', volume),
        createExercise('remada_curvada', 'Remada Curvada', volume),
        createExercise('0603', 'Desenvolvimento Militar', volume),
        createExercise('puxada_vertical', 'Puxada Vertical', volume),
        createExercise('0297', 'Rosca Direta', { ...volume, sets: 3 }),
        createExercise('triceps_pulley_corda', 'Tríceps Corda', {
          ...volume,
          sets: 3,
        }),
      ],
    }

    const lower: WorkoutTemplate = {
      name: 'Inferiores',
      muscleGroup: 'Pernas e Glúteos',
      exercises: [
        createExercise('0783', 'Agachamento Livre', volume),
        createExercise('0007', 'Levantamento Terra', volume),
        createExercise('0564', 'Leg Press', volume),
        createExercise('cadeira_extensora', 'Cadeira Extensora', {
          ...volume,
          sets: 3,
          reps: '12-15',
        }),
        createExercise('cadeira_flexora', 'Cadeira Flexora', {
          ...volume,
          sets: 3,
          reps: '12-15',
        }),
      ],
    }

    if (sex === 'female') {
      lower.exercises.splice(
        2,
        0,
        createExercise('elevacao_pelvica', 'Elevação Pélvica', volume),
      ) // Add Hip Thrust early in Lower day
    }

    workouts = [upper, lower]
  } else {
    // 5+
    planName = 'PPL (Push/Pull/Legs)'
    planDescription = 'Alta frequência e volume para resultados máximos.'

    const push: WorkoutTemplate = {
      name: 'Push',
      muscleGroup: 'Empurrar',
      exercises: [
        createExercise('0025', 'Supino Reto', volume),
        createExercise('0603', 'Desenvolvimento', volume),
        createExercise('supino_inclinado_halteres', 'Supino Inclinado', volume),
        createExercise('elevacao_lateral', 'Elevação Lateral', {
          ...volume,
          sets: 4,
          reps: '12-15',
        }),
        createExercise('triceps_pulley_corda', 'Tríceps Corda', {
          ...volume,
          sets: 3,
        }),
      ],
    }

    const pull: WorkoutTemplate = {
      name: 'Pull',
      muscleGroup: 'Puxar',
      exercises: [
        createExercise('0007', 'Levantamento Terra', volume),
        createExercise('puxada_vertical', 'Puxada Vertical', volume),
        createExercise('remada_curvada', 'Remada Curvada', volume),
        createExercise('crucifixo_inverso', 'Crucifixo Inverso', {
          ...volume,
          sets: 3,
        }),
        createExercise('0297', 'Rosca Direta', { ...volume, sets: 3 }),
      ],
    }

    const legs: WorkoutTemplate = {
      name: 'Legs',
      muscleGroup: 'Pernas',
      exercises: [
        createExercise('0783', 'Agachamento Livre', volume),
        createExercise('0564', 'Leg Press', volume),
        createExercise('cadeira_extensora', 'Extensora', {
          ...volume,
          sets: 3,
        }),
        createExercise('cadeira_flexora', 'Flexora', { ...volume, sets: 3 }),
        createExercise('panturrilha', 'Panturrilha', {
          ...volume,
          sets: 4,
          reps: '15-20',
        }),
      ],
    }

    if (sex === 'female') {
      legs.exercises.splice(
        1,
        0,
        createExercise('elevacao_pelvica', 'Elevação Pélvica', volume),
      )
    }

    workouts = [push, pull, legs]
  }

  // 2. Preferences Integration
  if (cardioPreference) {
    // Add a dedicated cardio day or append to workouts depending on goal
    if (goal === 'FAT_LOSS') {
      workouts.forEach((w) => {
        w.exercises.push(createCardioSession(20)) // 20 min cardio after lifting
      })
    } else {
      // Separate cardio day
      workouts.push({
        name: 'Cardio & Recovery',
        muscleGroup: 'Cardio',
        exercises: [createCardioSession(30)],
      })
    }
  }

  if (stretchingPreference) {
    // Append stretching to the end of each workout
    workouts.forEach((w) => {
      w.exercises.push({
        exerciseId: 'stretching_generic',
        name: 'Alongamento / Mobilidade',
        type: 'cardio', // Using cardio type for duration-based activity
        durationMinutes: 10,
      } as CardioExercise)
    })
  }

  return {
    name: planName,
    description: planDescription,
    category: experienceLevel || 'beginner',
    isPremium: true,
    workouts,
  }
}

// --- SCHEDULING LOGIC ---

/**
 * Distributes workouts across the week based on availability.
 * Returns a map of Date string (YYYY-MM-DD) -> Workout Index in the plan
 */
const schedulePlan = (
  startDate: Date,
  availability: Availability,
  numberOfWorkouts: number,
): { date: string; workoutIndex: number }[] => {
  const schedule: { date: string; workoutIndex: number }[] = []
  const daysToSchedule =
    availability === '1-2' ? 2 : availability === '3-4' ? 4 : 6

  // Day distribution pattern (0=Sun, 1=Mon)
  let dayPattern: number[] = []

  if (daysToSchedule === 2) {
    dayPattern = [1, 4] // Mon, Thu
  } else if (daysToSchedule === 4) {
    dayPattern = [1, 2, 4, 5] // Mon, Tue, Thu, Fri
  } else {
    dayPattern = [1, 2, 3, 4, 5, 6] // Mon-Sat
  }

  let currentWorkoutIndex = 0

  // Schedule for the next 4 weeks
  for (let week = 0; week < 4; week++) {
    dayPattern.forEach((dayOffset) => {
      const date = new Date(startDate)
      // Calculate date for the specific day of the week
      const currentDay = date.getDay()
      const distance = dayOffset - currentDay + week * 7
      date.setDate(date.getDate() + distance)

      // Ensure we don't schedule in the past if starting mid-week
      if (date >= startDate) {
        // Use local date string YYYY-MM-DD
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateString = `${year}-${month}-${day}`

        schedule.push({
          date: dateString,
          workoutIndex: currentWorkoutIndex % numberOfWorkouts,
        })
        currentWorkoutIndex++
      }
    })
  }

  return schedule
}

export const TrainingDirectorService = {
  generateWorkoutPlan,
  schedulePlan,
}
