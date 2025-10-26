import axios from 'axios'
import { z } from 'zod'

const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  bodyPart: z.string(),
  target: z.string(),
  gifUrl: z.string(),
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

export const exerciseDB = {
  getAll: async (): Promise<Exercise[]> => {
    try {
      const response = await apiClient.get('/exercises')
      return exerciseResponseSchema.parse(response.data)
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
      throw new Error('Failed to fetch exercises from ExerciseDB.')
    }
  },
  getByBodyPart: async (bodyPart: string): Promise<Exercise[]> => {
    try {
      const response = await apiClient.get(`/exercises/bodyPart/${bodyPart}`)
      return exerciseResponseSchema.parse(response.data)
    } catch (error) {
      console.error(
        `Failed to fetch exercises for body part ${bodyPart}:`,
        error,
      )
      throw new Error(`Failed to fetch exercises for body part ${bodyPart}.`)
    }
  },
}
