import {
  UserProfile,
  WorkoutPlan,
  StrengthExercise,
  WorkoutTemplate,
} from '../types/database'

// --- TIPOS AUXILIARES ---
type Goal = 'STRENGTH' | 'FAT_LOSS' | 'MAINTAIN' | 'GAIN_MASS'
type ExercisePool = {
  [key: string]: StrengthExercise[]
}

// --- BANCO DE DADOS DE EXERCÍCIOS ADAPTADO ---
// Mapeado para IDs consistentes e compatível com a interface StrengthExercise
const EXERCISE_DB: { full: ExercisePool; limited: ExercisePool } = {
  full: {
    // Peito
    peitoComposto: [
      {
        exerciseId: '0025',
        name: 'Supino Reto (Barra)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'supino_inclinado_halteres',
        name: 'Supino Inclinado (Halteres)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    peitoIsolado: [
      {
        exerciseId: 'crucifixo_cabos',
        name: 'Crucifixo (Cabos)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'paralelas',
        name: 'Paralelas (Foco Peito)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Costas
    costasComposto: [
      {
        exerciseId: '0652',
        name: 'Barra Fixa',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'remada_curvada',
        name: 'Remada Curvada (Barra)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: '0007',
        name: 'Levantamento Terra',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    costasIsolado: [
      {
        exerciseId: 'remada_serrote',
        name: 'Remada Serrote',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'puxada_vertical',
        name: 'Puxada Vertical',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Pernas
    pernasComposto: [
      {
        exerciseId: '0783',
        name: 'Agachamento Livre',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: '0564',
        name: 'Leg Press 45º',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    pernasIsolado: [
      {
        exerciseId: 'cadeira_extensora',
        name: 'Cadeira Extensora',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'cadeira_flexora',
        name: 'Cadeira Flexora',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Ombros
    ombrosComposto: [
      {
        exerciseId: '0603',
        name: 'Desenvolvimento Militar',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    ombrosIsolado: [
      {
        exerciseId: 'elevacao_lateral',
        name: 'Elevação Lateral',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Bíceps
    biceps: [
      {
        exerciseId: '0297',
        name: 'Rosca Direta (Halteres)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'rosca_martelo',
        name: 'Rosca Martelo',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Tríceps
    triceps: [
      {
        exerciseId: 'triceps_pulley_corda',
        name: 'Tríceps Pulley (Corda)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'triceps_testa',
        name: 'Tríceps Testa',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
  },
  limited: {
    // Peito
    peitoComposto: [
      {
        exerciseId: 'flexao_braco',
        name: 'Flexão de Braço',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'supino_chao_halteres',
        name: 'Supino no Chão (Halteres)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    peitoIsolado: [
      {
        exerciseId: 'crucifixo_halteres',
        name: 'Crucifixo (Halteres)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Costas
    costasComposto: [
      {
        exerciseId: 'remada_curvada_halteres',
        name: 'Remada Curvada (Halteres)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'remada_serrote',
        name: 'Remada Serrote',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    costasIsolado: [
      {
        exerciseId: 'pull-over_haltere',
        name: 'Pull-over com Haltere',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Pernas
    pernasComposto: [
      {
        exerciseId: 'agachamento_taca',
        name: 'Agachamento Taça',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'agachamento_bulgaro',
        name: 'Agachamento Búlgaro',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    pernasIsolado: [
      {
        exerciseId: 'afundo',
        name: 'Afundo (Passada)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
      {
        exerciseId: 'elevacao_pelvica',
        name: 'Elevação Pélvica',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Ombros
    ombrosComposto: [
      {
        exerciseId: 'desenvolvimento_halteres',
        name: 'Desenvolvimento (Halteres)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    ombrosIsolado: [
      {
        exerciseId: 'elevacao_lateral',
        name: 'Elevação Lateral',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Bíceps
    biceps: [
      {
        exerciseId: '0297',
        name: 'Rosca Direta (Halteres)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
    // Tríceps
    triceps: [
      {
        exerciseId: 'triceps_frances_haltere',
        name: 'Tríceps Francês (Haltere)',
        type: 'strength',
        sets: 0,
        reps: '',
        rest: 0,
      },
    ],
  },
}

// --- LÓGICA DE VOLUME E INTENSIDADE ---
const getVolume = (
  goal: Goal | null,
): { sets: number; reps: string; rest: number } => {
  switch (goal) {
    case 'STRENGTH':
      return { sets: 5, reps: '3-5', rest: 180 }
    case 'GAIN_MASS':
      return { sets: 4, reps: '8-12', rest: 75 }
    case 'FAT_LOSS':
      return { sets: 3, reps: '12-15', rest: 60 }
    case 'MAINTAIN':
    default:
      return { sets: 3, reps: '10-12', rest: 90 }
  }
}

// --- FUNÇÕES AUXILIARES ---
const getRandomExercise = (
  pool: StrengthExercise[],
  usedIds: Set<string>,
): StrengthExercise | null => {
  const available = pool.filter((ex) => !usedIds.has(ex.exerciseId))
  if (available.length === 0) return null
  const exercise = available[Math.floor(Math.random() * available.length)]
  usedIds.add(exercise.exerciseId)
  return { ...exercise } // Retorna uma cópia
}

const createWorkout = (
  name: string,
  muscleGroup: string,
  exerciseCategories: string[],
  db: ExercisePool,
  goal: Goal | null,
  usedIds: Set<string>,
): WorkoutTemplate => {
  const volume = getVolume(goal)
  const exercises: StrengthExercise[] = []

  exerciseCategories.forEach((category) => {
    const exercise = getRandomExercise(db[category], usedIds)
    if (exercise) {
      exercise.sets = volume.sets
      exercise.reps = volume.reps
      exercise.rest = volume.rest
      exercises.push(exercise)
    }
  })

  return { name, muscleGroup, exercises }
}

// --- LÓGICA DE GERAÇÃO DO PLANO ---
const generateWorkoutPlan = (
  profile: UserProfile,
): Omit<WorkoutPlan, 'id' | 'firestoreId'> => {
  const { availability, experienceLevel, equipment, goal } = profile
  const selectedDB = EXERCISE_DB[equipment || 'full']
  const usedExerciseIds = new Set<string>()
  let workouts: WorkoutTemplate[] = []
  let planName = ''
  let planDescription = ''

  // 1. Decidir a Divisão (Split)
  if (availability === '1-2' || experienceLevel === 'beginner') {
    // Full Body
    planName = 'Plano Full Body'
    planDescription = 'Treinos de corpo inteiro para maximizar a frequência.'
    const workoutA = createWorkout(
      'Full Body A',
      'Corpo Inteiro',
      ['pernasComposto', 'peitoComposto', 'costasComposto', 'ombrosComposto'],
      selectedDB,
      goal,
      usedExerciseIds,
    )
    const workoutB = createWorkout(
      'Full Body B',
      'Corpo Inteiro',
      ['pernasIsolado', 'peitoIsolado', 'costasIsolado', 'biceps', 'triceps'],
      selectedDB,
      goal,
      usedExerciseIds,
    )
    workouts = [workoutA, workoutB]
  } else if (availability === '3-4') {
    // Upper/Lower
    planName = 'Plano Upper/Lower'
    planDescription =
      'Divisão clássica de treinos para superiores e inferiores.'
    const upper = createWorkout(
      'Superiores',
      'Peito, Costas, Ombros, Braços',
      [
        'peitoComposto',
        'costasComposto',
        'ombrosComposto',
        'biceps',
        'triceps',
      ],
      selectedDB,
      goal,
      usedExerciseIds,
    )
    const lower = createWorkout(
      'Inferiores',
      'Pernas',
      ['pernasComposto', 'pernasIsolado', 'pernasIsolado'],
      selectedDB,
      goal,
      usedExerciseIds,
    )
    workouts = [upper, lower]
  } else {
    // 5+ dias: Push/Pull/Legs
    planName = 'Plano Push/Pull/Legs'
    planDescription = 'Divisão de alta frequência para atletas avançados.'
    const push = createWorkout(
      'Push (Empurrar)',
      'Peito, Ombros, Tríceps',
      ['peitoComposto', 'ombrosComposto', 'peitoIsolado', 'triceps'],
      selectedDB,
      goal,
      usedExerciseIds,
    )
    const pull = createWorkout(
      'Pull (Puxar)',
      'Costas, Bíceps',
      ['costasComposto', 'costasComposto', 'costasIsolado', 'biceps'],
      selectedDB,
      goal,
      usedExerciseIds,
    )
    const legs = createWorkout(
      'Legs (Pernas)',
      'Pernas',
      ['pernasComposto', 'pernasComposto', 'pernasIsolado', 'pernasIsolado'],
      selectedDB,
      goal,
      usedExerciseIds,
    )
    workouts = [push, pull, legs]
  }

  return {
    name: planName,
    description: planDescription,
    category: experienceLevel || 'beginner',
    isPremium: true, // Planos gerados são premium
    workouts,
  }
}

export const WorkoutGeneratorService = {
  generateWorkoutPlan,
}
