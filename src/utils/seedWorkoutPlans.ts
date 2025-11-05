import { DatabaseService } from '../db/DatabaseService'
import { WorkoutPlan } from '../types/database'
import * as Crypto from 'expo-crypto'

const beginnerPlan: Omit<WorkoutPlan, 'id'> = {
  firestoreId: Crypto.randomUUID(),
  name: 'Iniciante: Foco em Força',
  description:
    'Um plano de corpo inteiro (Full Body) para 3 dias na semana, focado em construir uma base sólida de força com exercícios compostos.',
  category: 'beginner',
  workouts: [
    {
      name: 'Full Body A',
      muscleGroup: 'Corpo Inteiro',
      exercises: [
        {
          exerciseId: '0002',
          name: 'Agachamento Livre',
          type: 'strength',
          sets: 3,
          reps: '5-8',
          rest: 90,
        },
        {
          exerciseId: '0001',
          name: 'Supino Reto',
          type: 'strength',
          sets: 3,
          reps: '5-8',
          rest: 60,
        },
        {
          exerciseId: '0003',
          name: 'Remada Curvada',
          type: 'strength',
          sets: 3,
          reps: '5-8',
          rest: 60,
        },
      ],
    },
  ],
}

const intermediatePlan: Omit<WorkoutPlan, 'id'> = {
  firestoreId: Crypto.randomUUID(),
  name: 'Intermediário: Push/Pull/Legs (PPL)',
  description:
    'Uma divisão clássica para quem já tem experiência. Foco em volume e hipertrofia.',
  category: 'intermediate',
  workouts: [
    {
      name: 'Push (Peito, Ombro, Tríceps)',
      muscleGroup: 'Peitoral',
      exercises: [
        {
          exerciseId: '0001',
          name: 'Supino Reto',
          type: 'strength',
          sets: 4,
          reps: '6-10',
          rest: 75,
        },
        {
          exerciseId: '0005',
          name: 'Supino Inclinado com Halteres',
          type: 'strength',
          sets: 3,
          reps: '8-12',
          rest: 60,
        },
        {
          exerciseId: '0004',
          name: 'Desenvolvimento Militar',
          type: 'strength',
          sets: 3,
          reps: '8-12',
          rest: 75,
        },
      ],
    },
    {
      name: 'Pull (Costas, Bíceps)',
      muscleGroup: 'Costas',
      exercises: [
        {
          exerciseId: '0003',
          name: 'Remada Curvada',
          type: 'strength',
          sets: 4,
          reps: '6-10',
          rest: 75,
        },
        {
          exerciseId: '0006', // Barra Fixa (mock)
          name: 'Barra Fixa',
          type: 'strength',
          sets: 3,
          reps: 'Até a falha',
          rest: 90,
        },
      ],
    },
    {
      name: 'Legs (Pernas, Panturrilha)',
      muscleGroup: 'Pernas',
      exercises: [
        {
          exerciseId: '0002',
          name: 'Agachamento Livre',
          type: 'strength',
          sets: 4,
          reps: '6-10',
          rest: 90,
        },
        {
          exerciseId: '0007', // Leg Press (mock)
          name: 'Leg Press',
          type: 'strength',
          sets: 3,
          reps: '10-15',
          rest: 60,
        },
      ],
    },
  ],
}

export const seedWorkoutPlans = async () => {
  try {
    console.log('Verificando se os planos de treino precisam ser populados...')
    const existingPlans = await DatabaseService.getWorkoutPlans()
    if (existingPlans.length > 0) {
      console.log('Planos de treino já existem. Pulando a população.')
      return
    }

    console.log('Populando o banco de dados com planos de treino padrão...')
    await DatabaseService.addWorkoutPlan(beginnerPlan)
    await DatabaseService.addWorkoutPlan(intermediatePlan)
    console.log('Planos de treino populados com sucesso!')
  } catch (error) {
    console.error('Erro ao popular os planos de treino:', error)
  }
}
