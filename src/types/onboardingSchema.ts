import { z } from 'zod'

const twelveYearsAgo = new Date()
twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 12)

const oneHundredYearsAgo = new Date()
oneHundredYearsAgo.setFullYear(oneHundredYearsAgo.getFullYear() - 100)

/**
 * Parses a date string in DD/MM/YYYY format into a Date object.
 * @param dateString The date string to parse.
 * @returns A Date object.
 */
const parseDDMMYYYY = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number)
  // JavaScript months are 0-indexed, so we subtract 1.
  return new Date(year, month - 1, day)
}

export const demographicsSchema = z.object({
  displayName: z
    .string()
    .min(3, 'O nome de exibição deve ter pelo menos 3 caracteres.')
    .max(20, 'O nome de exibição não pode ter mais de 20 caracteres.'),
  dob: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato DD/MM/AAAA.')
    .refine((dateStr) => {
      const date = parseDDMMYYYY(dateStr)
      const [day, month, year] = dateStr.split('/').map(Number)
      // Check if the parsed date is a valid calendar date
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      )
    }, 'Data inválida (ex: 31/02/2023).')
    .refine(
      (dateStr) => parseDDMMYYYY(dateStr) <= twelveYearsAgo,
      'Você deve ter pelo menos 12 anos.',
    )
    .refine(
      (dateStr) => parseDDMMYYYY(dateStr) >= oneHundredYearsAgo,
      'A data de nascimento parece ser inválida.',
    ),
  sex: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Por favor, selecione seu sexo.' }),
  }),
})

export const biometricsSchema = z.object({
  heightCm: z
    .number({ invalid_type_error: 'Por favor, insira sua altura.' })
    .min(100, 'A altura deve ser de no mínimo 100 cm.')
    .max(240, 'A altura deve ser de no máximo 240 cm.'),
  weightKg: z
    .number({ invalid_type_error: 'Por favor, insira seu peso.' })
    .min(30, 'O peso deve ser de no mínimo 30 kg.')
    .max(330, 'O peso deve ser de no máximo 330 kg.'),
})

export const goalSchema = z.object({
  goal: z.enum(['GAIN_MASS', 'FAT_LOSS', 'STRENGTH', 'MAINTAIN'], {
    errorMap: () => ({ message: 'Por favor, selecione um objetivo.' }),
  }),
})

export const experienceSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({
      message: 'Por favor, selecione seu nível de experiência.',
    }),
  }),
  availability: z.enum(['1-2', '3-4', '5+'], {
    errorMap: () => ({ message: 'Por favor, selecione sua disponibilidade.' }),
  }),
})

export type DemographicsData = z.infer<typeof demographicsSchema>
export type BiometricsData = z.infer<typeof biometricsSchema>
export type GoalData = z.infer<typeof goalSchema>
export type ExperienceData = z.infer<typeof experienceSchema>
