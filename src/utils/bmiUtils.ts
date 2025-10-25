/**
 * Tipos de categoria de IMC (Índice de Massa Corporal).
 */
export type BMICategory =
  | 'UNDERWEIGHT'
  | 'HEALTHY_WEIGHT'
  | 'OVERWEIGHT'
  | 'OBESITY'

/**
 * Calcula o Índice de Massa Corporal (IMC).
 * @param weightKg - O peso da pessoa em quilogramas (kg).
 * @param heightCm - A altura da pessoa em centímetros (cm).
 * @returns O valor do IMC calculado. Retorna 0 se a altura for 0 para evitar divisão por zero.
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (heightCm === 0) {
    return 0
  }
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return bmi
}

/**
 * Determina a categoria do IMC com base no seu valor.
 * @param bmi - O valor do IMC.
 * @returns A categoria correspondente do IMC.
 */
export const getBMICategory = (bmi: number): BMICategory => {
  if (bmi < 18.5) {
    return 'UNDERWEIGHT'
  }
  if (bmi >= 18.5 && bmi <= 24.9) {
    return 'HEALTHY_WEIGHT'
  }
  if (bmi >= 25.0 && bmi <= 29.9) {
    return 'OVERWEIGHT'
  }
  return 'OBESITY'
}
