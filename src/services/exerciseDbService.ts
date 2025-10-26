// src/services/exerciseDbService.ts

const API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY
const API_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST
const BASE_URL = process.env.EXPO_PUBLIC_EXERCISEDB_BASE_URL

export interface ExerciseAPIResponse {
  id: string
  name: string
  bodyPart: string
  equipment: string
  gifUrl: string
  target: string
}

const headers = {
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': API_HOST,
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  console.log(`Fetching from: ${url}`)

  try {
    const response = await fetch(url, { headers })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `API Error: ${response.status} ${response.statusText}`,
        errorText,
      )
      throw new Error(
        `Failed to fetch data from ExerciseDB. Status: ${response.status}`,
      )
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error('Network or fetch error:', error)
    throw error
  }
}

export const searchExercises = async (
  query: string,
): Promise<ExerciseAPIResponse[]> => {
  if (!query) return []
  return fetchFromAPI<ExerciseAPIResponse[]>(
    `/exercises/name/${encodeURIComponent(query)}`,
  )
}

export const fetchExercisesByBodyPart = async (
  bodyPart: string,
): Promise<ExerciseAPIResponse[]> => {
  if (!bodyPart) return []
  return fetchFromAPI<ExerciseAPIResponse[]>(
    `/exercises/bodyPart/${encodeURIComponent(bodyPart)}`,
  )
}
