export const parseRepTarget = (reps: string): number => {
  if (!reps) {
    return 0
  }

  const repsStr = reps.toString()

  if (repsStr.includes('-')) {
    const parts = repsStr.split('-')
    // Retorna a parte final (o número maior), convertida para inteiro.
    return parseInt(parts[1].trim(), 10)
  }

  return parseInt(repsStr.trim(), 10)
}
