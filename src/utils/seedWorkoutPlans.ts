import { DatabaseService } from '../db/DatabaseService'
import { PRESET_WORKOUT_PLANS } from './presetData'
import * as Crypto from 'expo-crypto'

export const seedWorkoutPlans = async () => {
  try {
    console.log(
      'Verificando se os planos de treino padrão precisam ser populados...',
    )
    const existingPlans = await DatabaseService.getWorkoutPlans()
    const existingPlanNames = new Set(existingPlans.map((p) => p.name))

    let plansAdded = 0
    for (const presetPlan of PRESET_WORKOUT_PLANS) {
      if (!existingPlanNames.has(presetPlan.name)) {
        console.log(`Adicionando plano: ${presetPlan.name}...`)
        // Adiciona o firestoreId que é esperado pelo serviço do banco de dados
        const planToAdd = {
          ...presetPlan,
          firestoreId: Crypto.randomUUID(),
        }
        await DatabaseService.addWorkoutPlan(planToAdd)
        plansAdded++
      }
    }

    if (plansAdded > 0) {
      console.log(`${plansAdded} plano(s) de treino populado(s) com sucesso!`)
    } else {
      console.log(
        'Todos os planos de treino padrão já existem. Nenhuma ação necessária.',
      )
    }
  } catch (error) {
    console.error('Erro ao popular os planos de treino:', error)
  }
}
