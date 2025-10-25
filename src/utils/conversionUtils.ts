/**
 * Converte centímetros para uma string formatada em pés e polegadas.
 * @param cm - A altura em centímetros.
 * @returns Uma string formatada como '5 ft 11 in'.
 */
export const convertCmToFtIn = (cm: number): string => {
  if (isNaN(cm) || cm < 0) {
    return 'N/A'
  }
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet} ft ${inches} in`
}

/**
 * Converte quilogramas para libras (lbs).
 * @param kg - O peso em quilogramas.
 * @returns O peso convertido em libras, com uma casa decimal.
 */
export const convertKgToLbs = (kg: number): number => {
  if (isNaN(kg) || kg < 0) {
    return 0
  }
  return kg * 2.20462
}
