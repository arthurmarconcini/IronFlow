import { UserProfile, Workout, StrengthExercise } from '../types/database'

// --- BANCO DE DADOS DE EXERCÍCIOS ---
const PRESET_EXERCISES = {
  // Compostos de Força
  agachamentoLivre: { name: 'Agachamento Livre', type: 'strength' },
  levantamentoTerra: { name: 'Levantamento Terra', type: 'strength' },
  supinoRetoBarra: { name: 'Supino Reto (Barra)', type: 'strength' },
  desenvolvimentoMilitar: {
    name: 'Desenvolvimento Militar (em pé)',
    type: 'strength',
  },
  remadaCurvada: { name: 'Remada Curvada (Barra)', type: 'strength' },
  barraFixa: { name: 'Barra Fixa', type: 'strength' },

  // Acessórios e Isoladores
  agachamentoTaca: { name: 'Agachamento Taça', type: 'strength' },
  legPress45: { name: 'Leg Press 45º', type: 'strength' },
  cadeiraExtensora: { name: 'Cadeira Extensora', type: 'strength' },
  levantamentoTerraRomeno: {
    name: 'Levantamento Terra Romeno (RDL)',
    type: 'strength',
  },
  cadeiraFlexora: { name: 'Cadeira Flexora', type: 'strength' },
  elevacaoPelvica: { name: 'Elevação Pélvica', type: 'strength' },
  agachamentoBulgaro: { name: 'Agachamento Búlgaro', type: 'strength' },
  afundo: { name: 'Afundo (Passada)', type: 'strength' },
  panturrilhaPe: { name: 'Panturrilha (em pé)', type: 'strength' },
  panturrilhaSentado: { name: 'Panturrilha (sentado)', type: 'strength' },
  supinoInclinadoHalteres: {
    name: 'Supino Inclinado (Halteres)',
    type: 'strength',
  },
  crucifixoCabos: { name: 'Crucifixo (Cabos)', type: 'strength' },
  paralelas: { name: 'Paralelas', type: 'strength' },
  puxadaVertical: { name: 'Puxada Vertical (Pulldown)', type: 'strength' },
  remadaSerrote: { name: 'Remada Serrote', type: 'strength' },
  pulldownBracosEstendidos: {
    name: 'Pulldown (Braços Estendidos)',
    type: 'strength',
  },
  desenvolvimentoHalteres: {
    name: 'Desenvolvimento (Halteres)',
    type: 'strength',
  },
  elevacaoLateral: { name: 'Elevação Lateral', type: 'strength' },
  crucifixoInvertido: { name: 'Crucifixo Invertido', type: 'strength' },
  encolhimento: { name: 'Encolhimento (Halteres)', type: 'strength' },
  roscaDiretaW: { name: 'Rosca Direta (Barra W)', type: 'strength' },
  roscaMartelo: { name: 'Rosca Martelo', type: 'strength' },
  tricepsTesta: { name: 'Tríceps Testa', type: 'strength' },
  tricepsPulleyCorda: { name: 'Tríceps Pulley (Corda)', type: 'strength' },
  abdominalPolia: { name: 'Abdominal na Polia (Corda)', type: 'strength' },
  elevacaoPernas: { name: 'Elevação de Pernas', type: 'strength' },
  prancha: { name: 'Prancha Abdominal', type: 'strength' },
  flexaoBraco: { name: 'Flexão de Braço', type: 'strength' },
} as const // 'as const' ajuda a inferir os tipos literais

const createExercise = (
  exercise: { name: string; type: 'strength' },
  sets: number,
  reps: number | string,
  rest: number,
): StrengthExercise => ({
  ...exercise,
  sets,
  reps: Number(reps), // Garante que reps seja um número
  rest,
})

// --- LÓGICA DE GERAÇÃO POR NÍVEL ---

const generateBeginnerPlan = (
  profile: UserProfile,
): Omit<Workout, 'id' | 'firestoreId' | 'lastModified'>[] => {
  const reps = profile.goal === 'STRENGTH' ? '8-10' : '10-15'
  const rest = 90

  const treinoA: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Full Body A',
    muscleGroup: 'Corpo Inteiro',
    exercises: [
      createExercise(PRESET_EXERCISES.agachamentoTaca, 3, reps, rest),
      createExercise(PRESET_EXERCISES.supinoRetoBarra, 3, reps, rest),
      createExercise(PRESET_EXERCISES.remadaCurvada, 3, reps, rest),
      createExercise(PRESET_EXERCISES.desenvolvimentoHalteres, 3, reps, rest),
      createExercise(PRESET_EXERCISES.prancha, 3, '30-60s', rest),
    ],
  }

  const treinoB: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Full Body B',
    muscleGroup: 'Corpo Inteiro',
    exercises: [
      profile.sex === 'female'
        ? createExercise(PRESET_EXERCISES.elevacaoPelvica, 3, reps, rest)
        : createExercise(
            PRESET_EXERCISES.levantamentoTerraRomeno,
            3,
            reps,
            rest,
          ),
      createExercise(PRESET_EXERCISES.legPress45, 3, reps, rest),
      createExercise(PRESET_EXERCISES.puxadaVertical, 3, reps, rest),
      createExercise(PRESET_EXERCISES.flexaoBraco, 3, 'falha', rest),
      createExercise(PRESET_EXERCISES.roscaDiretaW, 2, reps, 60),
      createExercise(PRESET_EXERCISES.tricepsPulleyCorda, 2, reps, 60),
    ],
  }
  return [treinoA, treinoB]
}

const generateIntermediatePlan = (
  profile: UserProfile,
): Omit<Workout, 'id' | 'firestoreId' | 'lastModified'>[] => {
  const repsComp = profile.goal === 'STRENGTH' ? '4-6' : '8-12'
  const repsIso = '10-15'
  const restComp = 120
  const restIso = 75

  const upperA: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Superior A (Força/Peito)',
    muscleGroup: 'Superiores',
    exercises: [
      createExercise(PRESET_EXERCISES.supinoRetoBarra, 4, repsComp, restComp),
      createExercise(PRESET_EXERCISES.remadaCurvada, 4, '8-10', restComp),
      createExercise(
        PRESET_EXERCISES.desenvolvimentoHalteres,
        3,
        '8-10',
        restIso,
      ),
      createExercise(PRESET_EXERCISES.puxadaVertical, 3, '10-12', restIso),
      createExercise(PRESET_EXERCISES.tricepsTesta, 3, repsIso, restIso),
      createExercise(PRESET_EXERCISES.roscaDiretaW, 3, repsIso, restIso),
    ],
  }

  const lowerA: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Inferior A (Foco Quadríceps)',
    muscleGroup: 'Inferiores',
    exercises: [
      createExercise(PRESET_EXERCISES.agachamentoLivre, 4, repsComp, restComp),
      createExercise(PRESET_EXERCISES.legPress45, 3, '10-12', restIso),
      createExercise(PRESET_EXERCISES.cadeiraExtensora, 3, repsIso, restIso),
      createExercise(
        PRESET_EXERCISES.levantamentoTerraRomeno,
        3,
        '10-12',
        restIso,
      ),
      createExercise(PRESET_EXERCISES.panturrilhaPe, 4, '15-20', 60),
    ],
  }

  const upperB: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Superior B (Volume/Costas)',
    muscleGroup: 'Superiores',
    exercises: [
      createExercise(PRESET_EXERCISES.barraFixa, 4, 'falha', restComp),
      createExercise(
        PRESET_EXERCISES.supinoInclinadoHalteres,
        4,
        '10-12',
        restIso,
      ),
      createExercise(PRESET_EXERCISES.remadaSerrote, 3, '8-10', restIso),
      createExercise(PRESET_EXERCISES.elevacaoLateral, 4, repsIso, 60),
      createExercise(PRESET_EXERCISES.paralelas, 3, 'falha', restIso),
      createExercise(PRESET_EXERCISES.roscaMartelo, 3, '10-12', restIso),
    ],
  }

  let lowerB: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'>
  if (profile.sex === 'female') {
    lowerB = {
      name: 'Inferior B (Foco Glúteo/Posterior)',
      muscleGroup: 'Inferiores',
      exercises: [
        createExercise(PRESET_EXERCISES.elevacaoPelvica, 4, '8-12', restComp),
        createExercise(
          PRESET_EXERCISES.agachamentoBulgaro,
          3,
          '10-12',
          restIso,
        ),
        createExercise(PRESET_EXERCISES.cadeiraFlexora, 3, repsIso, restIso),
        createExercise(
          PRESET_EXERCISES.levantamentoTerraRomeno,
          3,
          '10-12',
          restIso,
        ),
        createExercise(PRESET_EXERCISES.panturrilhaSentado, 4, '15-20', 60),
      ],
    }
  } else {
    lowerB = {
      name: 'Inferior B (Foco Posterior)',
      muscleGroup: 'Inferiores',
      exercises: [
        createExercise(PRESET_EXERCISES.levantamentoTerra, 4, '8-10', restComp),
        createExercise(PRESET_EXERCISES.afundo, 3, '10-12', restIso),
        createExercise(PRESET_EXERCISES.cadeiraFlexora, 3, repsIso, restIso),
        createExercise(PRESET_EXERCISES.elevacaoPelvica, 4, '10-12', restIso),
        createExercise(PRESET_EXERCISES.panturrilhaSentado, 4, '15-20', 60),
      ],
    }
  }

  return [upperA, lowerA, upperB, lowerB]
}

const generateAdvancedPlan = (
  profile: UserProfile,
): Omit<Workout, 'id' | 'firestoreId' | 'lastModified'>[] => {
  const repsComp = profile.goal === 'STRENGTH' ? '3-5' : '6-8'
  const repsIso = '12-15'
  const restComp = 180
  const restIso = 90

  if (profile.sex === 'female') {
    // Split com 2x perna para mulheres
    const dia1: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
      name: 'Dia 1: Pernas (Foco Quadríceps)',
      muscleGroup: 'Pernas',
      exercises: [
        createExercise(
          PRESET_EXERCISES.agachamentoLivre,
          4,
          repsComp,
          restComp,
        ),
        createExercise(PRESET_EXERCISES.legPress45, 4, '10-12', restIso),
        createExercise(PRESET_EXERCISES.cadeiraExtensora, 4, repsIso, restIso),
        createExercise(PRESET_EXERCISES.afundo, 3, '10-12', restIso),
        createExercise(PRESET_EXERCISES.panturrilhaPe, 5, '10-15', 60),
      ],
    }
    const dia2: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
      name: 'Dia 2: Superiores (Push)',
      muscleGroup: 'Peito, Ombro, Tríceps',
      exercises: [
        createExercise(
          PRESET_EXERCISES.supinoInclinadoHalteres,
          4,
          '8-10',
          restIso,
        ),
        createExercise(
          PRESET_EXERCISES.desenvolvimentoHalteres,
          4,
          '8-10',
          restIso,
        ),
        createExercise(PRESET_EXERCISES.elevacaoLateral, 4, repsIso, 60),
        createExercise(
          PRESET_EXERCISES.tricepsPulleyCorda,
          4,
          repsIso,
          restIso,
        ),
      ],
    }
    const dia3: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
      name: 'Dia 3: Superiores (Pull)',
      muscleGroup: 'Costas, Bíceps',
      exercises: [
        createExercise(PRESET_EXERCISES.barraFixa, 4, 'falha', restComp),
        createExercise(PRESET_EXERCISES.remadaCurvada, 4, '8-10', restIso),
        createExercise(PRESET_EXERCISES.remadaSerrote, 3, '10-12', restIso),
        createExercise(PRESET_EXERCISES.roscaMartelo, 4, '10-12', restIso),
      ],
    }
    const dia4: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
      name: 'Dia 4: Pernas (Foco Glúteo/Posterior)',
      muscleGroup: 'Pernas',
      exercises: [
        createExercise(PRESET_EXERCISES.elevacaoPelvica, 5, '8-12', restComp),
        createExercise(
          PRESET_EXERCISES.levantamentoTerraRomeno,
          4,
          '8-10',
          restIso,
        ),
        createExercise(
          PRESET_EXERCISES.agachamentoBulgaro,
          3,
          '10-12',
          restIso,
        ),
        createExercise(PRESET_EXERCISES.cadeiraFlexora, 4, repsIso, restIso),
        createExercise(PRESET_EXERCISES.panturrilhaSentado, 5, '15-20', 60),
      ],
    }
    return [dia1, dia2, dia3, dia4]
  }

  // "Bro Split" Clássico para homens
  const dia1: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Dia 1: Peito',
    muscleGroup: 'Peito',
    exercises: [
      createExercise(PRESET_EXERCISES.supinoRetoBarra, 4, repsComp, restComp),
      createExercise(
        PRESET_EXERCISES.supinoInclinadoHalteres,
        4,
        '8-10',
        restIso,
      ),
      createExercise(PRESET_EXERCISES.crucifixoCabos, 3, repsIso, restIso),
      createExercise(PRESET_EXERCISES.paralelas, 3, 'falha', restIso),
    ],
  }

  const dia2: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Dia 2: Costas',
    muscleGroup: 'Costas',
    exercises: [
      createExercise(PRESET_EXERCISES.levantamentoTerra, 4, repsComp, restComp),
      createExercise(PRESET_EXERCISES.puxadaVertical, 4, '8-10', restIso),
      createExercise(PRESET_EXERCISES.remadaCurvada, 4, '8-10', restIso),
      createExercise(
        PRESET_EXERCISES.pulldownBracosEstendidos,
        3,
        repsIso,
        restIso,
      ),
    ],
  }

  const dia3: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Dia 3: Pernas',
    muscleGroup: 'Pernas',
    exercises: [
      createExercise(PRESET_EXERCISES.agachamentoLivre, 5, repsComp, restComp),
      createExercise(PRESET_EXERCISES.legPress45, 4, '10-15', restIso),
      createExercise(PRESET_EXERCISES.cadeiraExtensora, 4, repsIso, restIso),
      createExercise(PRESET_EXERCISES.cadeiraFlexora, 4, repsIso, restIso),
      createExercise(PRESET_EXERCISES.panturrilhaPe, 5, '10-15', 60),
    ],
  }

  const dia4: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Dia 4: Ombros',
    muscleGroup: 'Ombros',
    exercises: [
      createExercise(
        PRESET_EXERCISES.desenvolvimentoMilitar,
        4,
        repsComp,
        restComp,
      ),
      createExercise(PRESET_EXERCISES.elevacaoLateral, 5, repsIso, restIso),
      createExercise(PRESET_EXERCISES.crucifixoInvertido, 4, repsIso, restIso),
      createExercise(PRESET_EXERCISES.encolhimento, 4, '10-12', 60),
    ],
  }

  const dia5: Omit<Workout, 'id' | 'firestoreId' | 'lastModified'> = {
    name: 'Dia 5: Braços e Abdômen',
    muscleGroup: 'Braços, Abdômen',
    exercises: [
      createExercise(PRESET_EXERCISES.roscaDiretaW, 4, '8-10', restIso),
      createExercise(PRESET_EXERCISES.tricepsTesta, 4, '8-10', restIso),
      createExercise(PRESET_EXERCISES.roscaMartelo, 3, '10-12', restIso),
      createExercise(PRESET_EXERCISES.tricepsPulleyCorda, 3, repsIso, restIso),
      createExercise(PRESET_EXERCISES.abdominalPolia, 4, '15-20', 60),
      createExercise(PRESET_EXERCISES.elevacaoPernas, 4, 'falha', 60),
    ],
  }

  return [dia1, dia2, dia3, dia4, dia5]
}

// --- FUNÇÃO PRINCIPAL ---

const generatePreviewWorkout = (
  profile: UserProfile,
): Omit<Workout, 'id' | 'firestoreId' | 'lastModified'>[] => {
  switch (profile.experienceLevel) {
    case 'beginner':
      return generateBeginnerPlan(profile)
    case 'intermediate':
      return generateIntermediatePlan(profile)
    case 'advanced':
      return generateAdvancedPlan(profile)
    default:
      return []
  }
}

export const WorkoutGeneratorService = {
  generatePreviewWorkout,
}
