import { DatabaseService } from '../db/DatabaseService'
import { useAuthStore } from '../state/authStore'

export interface SessionTarget {
  targetWeight: number
  targetReps: string // Ex: "8-12"
  notes?: string // Ex: "Foco na forma!", "Tente bater a semana passada!"
}

const WEIGHT_INCREMENT_KG = 2.5 // Incremento de peso padrão

const calculateNextSessionTarget = async (
  exerciseName: string,
  targetRepsRange: string,
): Promise<SessionTarget | null> => {
  const userId = useAuthStore.getState().user?.uid
  if (!userId) {
    console.error('Usuário não encontrado, não é possível calcular o alvo.')
    return null
  }

  const lastPerformance = await DatabaseService.getLastSessionLogsForExercise(
    userId,
    exerciseName,
  )

  if (lastPerformance.length === 0) {
    console.log(`Sem desempenho anterior para ${exerciseName}.`)
    return null // Sem dados para basear a progressão.
  }

  const lastSet = lastPerformance[lastPerformance.length - 1]
  const lastWeight = lastSet.actual_weight_kg ?? 0
  const lastReps = lastSet.actual_reps ?? 0
  const lastRir = lastSet.rir

  const maxTargetReps = parseInt(targetRepsRange.split('-')[1], 10)

  // REGRA 1: Progressão de Peso
  // Se o usuário completou a última série no topo da faixa de repetições
  // e teve um RIR de 2 ou mais, ele está pronto para mais peso.
  if (lastReps >= maxTargetReps && lastRir !== null && lastRir >= 2) {
    return {
      targetWeight: lastWeight + WEIGHT_INCREMENT_KG,
      targetReps: targetRepsRange,
      notes: `Ótimo trabalho! Aumentamos o peso para ${
        lastWeight + WEIGHT_INCREMENT_KG
      } kg.`,
    }
  }

  // REGRA 2: Progressão de Repetições/Manutenção
  // Se o usuário completou as repetições mas o RIR foi baixo, ou
  // se ele ainda está trabalhando dentro da faixa de repetições.
  if (lastReps < maxTargetReps || (lastRir !== null && lastRir < 2)) {
    return {
      targetWeight: lastWeight,
      targetReps: targetRepsRange,
      notes: `Mantenha o peso em ${lastWeight} kg e foque em atingir o topo da faixa de repetições (${maxTargetReps} reps).`,
    }
  }

  // REGRA 3: Caso Padrão (Manter)
  // Se nenhuma das condições acima for atendida, mantenha os parâmetros.
  return {
    targetWeight: lastWeight,
    targetReps: targetRepsRange,
    notes: `Continue com ${lastWeight} kg e foque na consistência.`,
  }
}

export const ProgressiveOverloadService = {
  calculateNextSessionTarget,
}
