import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  UIManager,
  LayoutAnimation,
  Platform,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { AppRouteProp, AppNavigationProp } from '../../navigation/types'
import { DatabaseService } from '../../db/DatabaseService'
import { useWorkouts } from '../../db/useWorkouts'
import { WorkoutPlan, Exercise } from '../../types/database'
import ScreenContainer from '../../components/ScreenContainer'
import StyledButton from '../../components/StyledButton'
import { theme } from '../../theme'

// Habilita LayoutAnimation no Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function WorkoutPlanDetailsScreen() {
  const route = useRoute<AppRouteProp<'WorkoutPlanDetails'>>()
  const navigation = useNavigation<AppNavigationProp>()
  const { createWorkout, isLoading: isCreating } = useWorkouts()
  const { planId } = route.params

  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const fetchedPlan = await DatabaseService.getWorkoutPlanById(planId)
        setPlan(fetchedPlan)
      } catch (error) {
        console.error('Failed to fetch workout plan details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlan()
  }, [planId])

  const handleImportPlan = async () => {
    if (!plan) return

    Alert.alert(
      'Importar Plano',
      `Você está prestes a adicionar ${plan.workouts.length} novo(s) treino(s) à sua lista. Deseja continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              for (const workoutTemplate of plan.workouts) {
                await createWorkout(
                  workoutTemplate.name,
                  workoutTemplate.muscleGroup,
                  workoutTemplate.exercises,
                )
              }

              Toast.show({
                type: 'success',
                text1: 'Plano Importado!',
                text2: `${plan.workouts.length} treino(s) adicionado(s) com sucesso.`,
              })

              navigation.navigate('AppTabs', { screen: 'HomeTab' })
            } catch (error) {
              console.error('Failed to import workout plan:', error)
              Toast.show({
                type: 'error',
                text1: 'Erro ao Importar',
                text2: 'Não foi possível adicionar o plano aos seus treinos.',
              })
            }
          },
        },
      ],
    )
  }

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const renderExercise = (item: Exercise, index: number) => (
    <View key={index} style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      {item.type === 'strength' && (
        <Text style={styles.exerciseDetails}>
          {item.sets} séries de {item.reps} reps
        </Text>
      )}
      {item.type === 'cardio' && (
        <Text style={styles.exerciseDetails}>
          {item.durationMinutes} minutos
        </Text>
      )}
    </View>
  )

  if (isLoading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenContainer>
    )
  }

  if (!plan) {
    return (
      <ScreenContainer style={styles.center}>
        <Text>Plano de treino não encontrado.</Text>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          <Text style={styles.workoutsTitle}>Treinos do Plano</Text>
        </View>

        {plan.workouts.map((workout, index) => {
          const isExpanded = expandedIndex === index
          return (
            <TouchableOpacity
              key={index}
              style={styles.workoutCard}
              onPress={() => toggleExpand(index)}
              activeOpacity={0.8}
            >
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutMuscleGroup}>
                    {workout.muscleGroup}
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              {isExpanded && (
                <View style={styles.exercisesList}>
                  {workout.exercises.map(renderExercise)}
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
      <View style={styles.footer}>
        <StyledButton
          title={`Importar ${plan.workouts.length} Treino(s)`}
          onPress={handleImportPlan}
          isLoading={isCreating}
        />
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: theme.spacing.medium,
    paddingBottom: 100,
  },
  header: {
    marginBottom: theme.spacing.medium,
  },
  planName: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  planDescription: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.large,
  },
  workoutsTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  workoutCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    overflow: 'hidden',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  workoutMuscleGroup: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small / 2,
    fontStyle: 'italic',
  },
  exercisesList: {
    marginTop: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.medium,
  },
  exerciseContainer: {
    marginBottom: theme.spacing.small,
  },
  exerciseName: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    fontWeight: '500',
  },
  exerciseDetails: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
  },
  footer: {
    padding: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
})
