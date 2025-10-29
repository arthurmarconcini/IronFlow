import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import { AppRouteProp } from '../../navigation/types'

// Tipos provisórios para a tela
type Exercise = {
  id: string
  name: string
  sets: number
  reps: number
}

type WorkoutDetails = {
  id: string
  name: string
  exercises: Exercise[]
}

// Função de busca simulada
const fetchWorkoutDetails = async (
  id: string,
): Promise<WorkoutDetails | null> => {
  console.log(`Buscando detalhes para o treino com id: ${id}`)
  // Simula uma chamada de API ou busca no DB
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: `Treino ${id.substring(0, 4)}`,
        exercises: [], // Vazio por agora
      })
    }, 1500) // 1.5s de delay
  })
}

export default function WorkoutExecutionScreen() {
  const route = useRoute<AppRouteProp<'WorkoutExecution'>>()
  const { workoutId } = route.params

  const [workout, setWorkout] = useState<WorkoutDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        setLoading(true)
        const details = await fetchWorkoutDetails(workoutId)
        setWorkout(details)
      } catch (error) {
        console.error('Erro ao buscar detalhes do treino:', error)
        // Aqui poderíamos ter um estado de erro
      } finally {
        setLoading(false)
      }
    }

    loadWorkout()
  }, [workoutId])

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando treino...</Text>
        </View>
      </ScreenContainer>
    )
  }

  if (!workout) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Treino não encontrado.</Text>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>{workout.name}</Text>
        {/* O resto da UI virá aqui */}
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    color: theme.colors.text,
    fontSize: theme.fontSizes.medium,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.medium,
  },
})
