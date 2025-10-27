import axios from 'axios'
import { z } from 'zod'

const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  bodyPart: z.string(),
  target: z.string(),
  gifUrl: z.string().optional(),
  equipment: z.string(),
})

export type Exercise = z.infer<typeof exerciseSchema>

const exerciseResponseSchema = z.array(exerciseSchema)

const BASE_URL = process.env.EXPO_PUBLIC_EXERCISEDB_BASE_URL
const API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY
const API_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST,
  },
})

// Helper para tratamento de erros
const handleError = (error: unknown, context: string): Error => {
  if (axios.isAxiosError(error)) {
    const errorMessage =
      error.response?.data?.message || 'Um erro de API ocorreu.'
    // Verifica por mensagens comuns de limite de taxa
    if (
      typeof errorMessage === 'string' &&
      errorMessage.toLowerCase().includes('limit')
    ) {
      return new Error('API_LIMIT_REACHED')
    }
  }
  console.error(`Failed to ${context}:`, error)
  return new Error(`Failed to ${context} from ExerciseDB.`)
}

export const exerciseDB = {
  getAll: async (
    limit: number = 20,
    offset: number = 0,
  ): Promise<Exercise[]> => {
    try {
      const response = await apiClient.get(
        `https://exercisedb.p.rapidapi.com/exercises?limit=${limit}&offset=${offset}`,
      )
      return exerciseResponseSchema.parse(response.data)
    } catch (error) {
      throw handleError(error, 'fetch exercises')
    }
  },

  searchByName: async (
    name: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Exercise[]> => {
    if (!name) return []
    try {
      const response = await apiClient.get(
        `https://exercisedb.p.rapidapi.com/exercises/name/${name}?limit=${limit}&offset=${offset}`,
      )
      return exerciseResponseSchema.parse(response.data)
    } catch (error) {
      throw handleError(error, `search exercises by name "${name}"`)
    }
  },

  getByBodyPart: async (
    bodyPart: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Exercise[]> => {
    if (!bodyPart) return []
    try {
      const response = await apiClient.get(
        `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=${limit}&offset=${offset}`,
      )
      return exerciseResponseSchema.parse(response.data)
    } catch (error) {
      throw handleError(error, `fetch exercises for body part ${bodyPart}`)
    }
  },
}
