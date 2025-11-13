import { WorkoutPlan } from '../types/database'

export const PRESET_WORKOUT_PLANS: Omit<WorkoutPlan, 'id' | 'firestoreId'>[] = [
  {
    name: 'Iniciante: Foco em Força',
    description:
      'Um plano de corpo inteiro (Full Body) para 3 dias na semana, focado em construir uma base sólida de força com exercícios compostos.',
    category: 'beginner',
    isPremium: false,
    workouts: [
      {
        name: 'Full Body A',
        muscleGroup: 'Corpo Inteiro',
        exercises: [
          {
            exerciseId: 'agachamento_livre',
            name: 'Agachamento Livre',
            type: 'strength',
            sets: 3,
            reps: '5-8',
            rest: 90,
          },
          {
            exerciseId: 'supino_reto_barra',
            name: 'Supino Reto (Barra)',
            type: 'strength',
            sets: 3,
            reps: '5-8',
            rest: 60,
          },
          {
            exerciseId: 'remada_curvada',
            name: 'Remada Curvada (Barra)',
            type: 'strength',
            sets: 3,
            reps: '5-8',
            rest: 60,
          },
        ],
      },
      {
        name: 'Full Body B',
        muscleGroup: 'Corpo Inteiro',
        exercises: [
          {
            exerciseId: 'levantamento_terra',
            name: 'Levantamento Terra',
            type: 'strength',
            sets: 3,
            reps: '5',
            rest: 120,
          },
          {
            exerciseId: 'desenvolvimento_militar',
            name: 'Desenvolvimento Militar',
            type: 'strength',
            sets: 3,
            reps: '6-10',
            rest: 75,
          },
          {
            exerciseId: 'puxada_vertical',
            name: 'Puxada Vertical',
            type: 'strength',
            sets: 3,
            reps: '8-12',
            rest: 60,
          },
        ],
      },
    ],
  },
  {
    name: 'Intermediário: Push/Pull/Legs (PPL)',
    description:
      'Uma divisão clássica para quem já tem experiência. Foco em volume e hipertrofia. Requer acesso a mais equipamentos.',
    category: 'intermediate',
    isPremium: true,
    workouts: [
      {
        name: 'Push (Peito, Ombro, Tríceps)',
        muscleGroup: 'Peitoral, Ombros, Tríceps',
        exercises: [
          {
            exerciseId: 'supino_reto_barra',
            name: 'Supino Reto (Barra)',
            type: 'strength',
            sets: 4,
            reps: '6-10',
            rest: 75,
          },
          {
            exerciseId: 'supino_inclinado_halteres',
            name: 'Supino Inclinado (Halteres)',
            type: 'strength',
            sets: 3,
            reps: '8-12',
            rest: 60,
          },
          {
            exerciseId: 'desenvolvimento_militar',
            name: 'Desenvolvimento Militar',
            type: 'strength',
            sets: 3,
            reps: '8-12',
            rest: 75,
          },
          {
            exerciseId: 'triceps_pulley_corda',
            name: 'Tríceps Pulley (Corda)',
            type: 'strength',
            sets: 3,
            reps: '10-15',
            rest: 45,
          },
        ],
      },
      {
        name: 'Pull (Costas, Bíceps)',
        muscleGroup: 'Costas, Bíceps',
        exercises: [
          {
            exerciseId: 'barra_fixa',
            name: 'Barra Fixa',
            type: 'strength',
            sets: 3,
            reps: 'Até a falha',
            rest: 90,
          },
          {
            exerciseId: 'remada_curvada',
            name: 'Remada Curvada (Barra)',
            type: 'strength',
            sets: 4,
            reps: '6-10',
            rest: 75,
          },
          {
            exerciseId: 'remada_serrote',
            name: 'Remada Serrote',
            type: 'strength',
            sets: 3,
            reps: '8-12',
            rest: 60,
          },
          {
            exerciseId: 'rosca_direta_w',
            name: 'Rosca Direta (Barra W)',
            type: 'strength',
            sets: 3,
            reps: '10-12',
            rest: 45,
          },
        ],
      },
      {
        name: 'Legs (Pernas, Panturrilha)',
        muscleGroup: 'Pernas',
        exercises: [
          {
            exerciseId: 'agachamento_livre',
            name: 'Agachamento Livre',
            type: 'strength',
            sets: 4,
            reps: '6-10',
            rest: 90,
          },
          {
            exerciseId: 'leg_press_45',
            name: 'Leg Press 45º',
            type: 'strength',
            sets: 3,
            reps: '10-15',
            rest: 60,
          },
          {
            exerciseId: 'cadeira_extensora',
            name: 'Cadeira Extensora',
            type: 'strength',
            sets: 3,
            reps: '12-15',
            rest: 45,
          },
          {
            exerciseId: 'cadeira_flexora',
            name: 'Cadeira Flexora',
            type: 'strength',
            sets: 3,
            reps: '12-15',
            rest: 45,
          },
        ],
      },
    ],
  },
]

export const PRESET_BODY_PARTS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Panturrilhas',
  'Abdômen',
  'Cardio',
  'Outro',
]

export const PRESET_EQUIPMENTS = [
  'Barra',
  'Haltere',
  'Peso Corporal',
  'Máquina',
  'Cabo',
  'Kettlebell',
  'Faixa de Resistência',
  'Outro',
]
