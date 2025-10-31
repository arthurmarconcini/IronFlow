import { UserProfile } from '../types/database'
import {
  Exercise,
  Workout,
  StrengthExercise,
  CardioExercise,
} from '../types/database'

// --- 1. Banco de Dados de Exercícios Predefinidos ---

type PresetExercise =
  | Omit<StrengthExercise, 'sets' | 'reps' | 'rest' | 'weight'>
  | Omit<CardioExercise, 'durationMinutes'>

const PRESET_EXERCISES: { [key: string]: PresetExercise } = {
  // Peito
  supinoReto: { name: 'Supino Reto', type: 'strength' },
  supinoInclinado: { name: 'Supino Inclinado', type: 'strength' },
  crucifixo: { name: 'Crucifixo com Halteres', type: 'strength' },
  flexoes: { name: 'Flexões', type: 'strength' },

  // Costas
  remadaCurvada: { name: 'Remada Curvada', type: 'strength' },
  puxadaVertical: { name: 'Puxada Vertical (Pulley)', type: 'strength' },
  serrote: { name: 'Remada Unilateral (Serrote)', type: 'strength' },
  barraFixa: { name: 'Barra Fixa', type: 'strength' },

  // Pernas
  agachamento: { name: 'Agachamento Livre', type: 'strength' },
  legPress: { name: 'Leg Press 45', type: 'strength' },
  cadeiraExtensora: { name: 'Cadeira Extensora', type: 'strength' },
  mesaFlexora: { name: 'Mesa Flexora', type: 'strength' },
  panturrilha: { name: 'Elevação de Panturrilha', type: 'strength' },

  // Ombros
  desenvolvimento: { name: 'Desenvolvimento com Halteres', type: 'strength' },
  elevacaoLateral: { name: 'Elevação Lateral', type: 'strength' },
  elevacaoFrontal: { name: 'Elevação Frontal', type: 'strength' },

  // Braços
  roscaDireta: { name: 'Rosca Direta com Barra', type: 'strength' },
  roscaAlternada: { name: 'Rosca Alternada com Halteres', type: 'strength' },
  tricepsPulley: { name: 'Tríceps Pulley', type: 'strength' },
  tricepsTesta: { name: 'Tríceps Testa', type: 'strength' },

  // Cardio
  corrida: { name: 'Corrida (Esteira)', type: 'cardio' },
  bicicleta: { name: 'Bicicleta Ergométrica', type: 'cardio' },
}

// --- 2. Funções Auxiliares de Geração ---

/**
 * Gera um treino Full Body, ideal para iniciantes.
 */
const generateFullBodyWorkout = (
  profile: UserProfile,
): Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> => {
  let exercises: Exercise[] = []

  // Regra: Iniciantes focam em compostos básicos
  if (profile.experienceLevel === 'beginner') {
    exercises = [
      {
        ...PRESET_EXERCISES.agachamento,
        sets: 3,
        reps: 10,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.supinoReto,
        sets: 3,
        reps: 10,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.remadaCurvada,
        sets: 3,
        reps: 10,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.desenvolvimento,
        sets: 3,
        reps: 10,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.roscaDireta,
        sets: 2,
        reps: 12,
        rest: 45,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.tricepsPulley,
        sets: 2,
        reps: 12,
        rest: 45,
      } as StrengthExercise,
    ]
  } else {
    // Regra: Intermediários/Avançados em Full Body têm mais volume
    exercises = [
      {
        ...PRESET_EXERCISES.agachamento,
        sets: 4,
        reps: 8,
        rest: 90,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.legPress,
        sets: 3,
        reps: 10,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.supinoInclinado,
        sets: 4,
        reps: 8,
        rest: 90,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.barraFixa,
        sets: 3,
        reps: 8,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.remadaCurvada,
        sets: 3,
        reps: 8,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.desenvolvimento,
        sets: 4,
        reps: 10,
        rest: 60,
      } as StrengthExercise,
    ]
  }

  return {
    name: 'Full Body A',
    muscleGroup: 'Corpo Inteiro',
    exercises,
  }
}

/**
 * Gera treinos divididos (Split), ideais para intermediários/avançados.
 */
const generateSplitWorkout = (
  profile: UserProfile,
): Omit<Workout, 'id' | 'firestoreId' | 'lastModified'>[] => {
  const reps = profile.goal === 'GAIN_MASS' ? 8 : 12
  const sets = profile.experienceLevel === 'advanced' ? 4 : 3

  // Split A: Peito e Tríceps
  const workoutA = {
    name: 'Split A: Peito e Tríceps',
    muscleGroup: 'Peito, Tríceps',
    exercises: [
      {
        ...PRESET_EXERCISES.supinoReto,
        sets,
        reps,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.supinoInclinado,
        sets,
        reps: reps + 2,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.crucifixo,
        sets: 3,
        reps: 12,
        rest: 45,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.tricepsPulley,
        sets,
        reps: 12,
        rest: 45,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.tricepsTesta,
        sets,
        reps: 12,
        rest: 45,
      } as StrengthExercise,
    ],
  }

  // Split B: Costas e Bíceps
  const workoutB = {
    name: 'Split B: Costas e Bíceps',
    muscleGroup: 'Costas, Bíceps',
    exercises: [
      {
        ...PRESET_EXERCISES.barraFixa,
        sets,
        reps: 8,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.remadaCurvada,
        sets,
        reps,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.serrote,
        sets: 3,
        reps: 10,
        rest: 60,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.roscaDireta,
        sets,
        reps: 12,
        rest: 45,
      } as StrengthExercise,
      {
        ...PRESET_EXERCISES.roscaAlternada,
        sets: 3,
        reps: 10,
        rest: 45,
      } as StrengthExercise,
    ],
  }

  // Se for avançado e tiver alta disponibilidade, adiciona o treino C
  if (profile.experienceLevel === 'advanced' && profile.availability === '5+') {
    const workoutC = {
      name: 'Split C: Pernas e Ombros',
      muscleGroup: 'Pernas, Ombros',
      exercises: [
        {
          ...PRESET_EXERCISES.agachamento,
          sets,
          reps,
          rest: 90,
        } as StrengthExercise,
        {
          ...PRESET_EXERCISES.legPress,
          sets,
          reps: 12,
          rest: 60,
        } as StrengthExercise,
        {
          ...PRESET_EXERCISES.cadeiraExtensora,
          sets: 3,
          reps: 15,
          rest: 45,
        } as StrengthExercise,
        {
          ...PRESET_EXERCISES.mesaFlexora,
          sets: 3,
          reps: 12,
          rest: 60,
        } as StrengthExercise,
        {
          ...PRESET_EXERCISES.desenvolvimento,
          sets,
          reps,
          rest: 75,
        } as StrengthExercise,
        {
          ...PRESET_EXERCISES.elevacaoLateral,
          sets: 3,
          reps: 15,
          rest: 45,
        } as StrengthExercise,
      ],
    }
    return [workoutA, workoutB, workoutC]
  }

  // Para os demais (intermediários), retorna um split AB mais consolidado
  workoutA.name = 'Split A: Superiores (Ênfase Peito)'
  workoutA.muscleGroup = 'Peito, Ombro, Tríceps'
  workoutA.exercises = [
    {
      ...PRESET_EXERCISES.supinoReto,
      sets,
      reps,
      rest: 60,
    } as StrengthExercise,
    {
      ...PRESET_EXERCISES.desenvolvimento,
      sets,
      reps,
      rest: 60,
    } as StrengthExercise,
    {
      ...PRESET_EXERCISES.elevacaoLateral,
      sets: 3,
      reps: 15,
      rest: 45,
    } as StrengthExercise,
    {
      ...PRESET_EXERCISES.tricepsPulley,
      sets,
      reps: 12,
      rest: 45,
    } as StrengthExercise,
  ]

  workoutB.name = 'Split B: Inferiores e Costas'
  workoutB.muscleGroup = 'Pernas, Costas, Bíceps'
  workoutB.exercises = [
    {
      ...PRESET_EXERCISES.agachamento,
      sets,
      reps,
      rest: 90,
    } as StrengthExercise,
    {
      ...PRESET_EXERCISES.remadaCurvada,
      sets,
      reps,
      rest: 60,
    } as StrengthExercise,
    {
      ...PRESET_EXERCISES.puxadaVertical,
      sets,
      reps: 12,
      rest: 60,
    } as StrengthExercise,
    {
      ...PRESET_EXERCISES.roscaDireta,
      sets,
      reps: 12,
      rest: 45,
    } as StrengthExercise,
  ]

  return [workoutA, workoutB]
}

// --- 3. Função Principal de Geração ---

/**
 * Gera uma lista de treinos de pré-visualização com base no perfil do usuário.
 */
const generatePreviewWorkout = (
  profile: UserProfile,
): Omit<Workout, 'id' | 'firestoreId' | 'lastModified'>[] => {
  // Regra Principal de Decisão
  if (
    profile.experienceLevel === 'beginner' ||
    profile.availability === '1-2'
  ) {
    // Iniciantes ou pessoas com pouca disponibilidade se beneficiam de Full Body.
    return [generateFullBodyWorkout(profile)]
  } else {
    // Intermediários e avançados com mais disponibilidade se beneficiam de Split.
    return generateSplitWorkout(profile)
  }
}

export const WorkoutGeneratorService = {
  generatePreviewWorkout,
}
