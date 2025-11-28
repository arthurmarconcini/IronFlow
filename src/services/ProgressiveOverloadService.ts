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
    return null
  }

  let bestSet = lastPerformance[0]
  for (const set of lastPerformance) {
    const currentWeight = set.actual_weight_kg ?? 0
    const currentReps = set.actual_reps ?? 0
    const bestWeight = bestSet.actual_weight_kg ?? 0
    const bestReps = bestSet.actual_reps ?? 0

    if (currentWeight > bestWeight) {
      bestSet = set
    } else if (currentWeight === bestWeight && currentReps > bestReps) {
      bestSet = set
    }
  }

  const lastWeight = bestSet.actual_weight_kg ?? 0
  const lastReps = bestSet.actual_reps ?? 0
  const lastRir = bestSet.rir

  const maxTargetReps = parseInt(targetRepsRange.split('-')[1], 10)

  // Rule 1: Weight Progression
  // Increase weight if user hit top of rep range with good RIR (>= 2)
  if (lastReps >= maxTargetReps && lastRir !== null && lastRir >= 2) {
    return {
      targetWeight: lastWeight + WEIGHT_INCREMENT_KG,
      targetReps: targetRepsRange,
      notes: `Sua melhor série foi excelente! Aumentamos o peso para ${
        lastWeight + WEIGHT_INCREMENT_KG
      } kg.`,
    }
  }

  // Rule 2: Rep Progression / Maintenance
  if (lastReps < maxTargetReps || (lastRir !== null && lastRir < 2)) {
    return {
      targetWeight: lastWeight,
      targetReps: targetRepsRange,
      notes: `Mantenha o peso em ${lastWeight} kg e tente aumentar as repetições (alvo: ${maxTargetReps}).`,
    }
  }

  // Rule 3: Default Maintenance
  return {
    targetWeight: lastWeight,
    targetReps: targetRepsRange,
    notes: `Mantenha a carga de ${lastWeight} kg para consolidar a força.`,
  }
}

export const ProgressiveOverloadService = {
  calculateNextSessionTarget,
}
