import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus'
import AdRewarded from '../../components/ads/RewardedAd'
import PremiumBadge from '../../components/PremiumBadge'

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
  const { workouts, createWorkout, isLoading: isCreating } = useWorkouts() // Obter workouts do usuário
  const { planId } = route.params

  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const { isPremium } = useSubscriptionStatus()
  const [rewardGranted, setRewardGranted] = useState(false)
  const [isAlreadyImported, setIsAlreadyImported] = useState(false) // Novo estado

  // Efeito para verificar se o plano já foi importado
  useEffect(() => {
    if (plan && workouts.length > 0) {
      const planWorkoutNames = new Set(plan.workouts.map((w) => w.name))
      const userWorkoutNames = new Set(workouts.map((w) => w.name))

      const isImported = [...planWorkoutNames].every((name) =>
        userWorkoutNames.has(name),
      )
      setIsAlreadyImported(isImported)
    }
  }, [plan, workouts])

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

  const handleImportPlan = useCallback(async () => {
    if (!plan) {
      console.log('handleImportPlan chamado, mas o plano é nulo.')
      return
    }

    Toast.show({
      type: 'info',
      text1: 'Processando sua recompensa...',
    })

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
  }, [plan, createWorkout, navigation])

  useEffect(() => {
    if (rewardGranted) {
      handleImportPlan()
      setRewardGranted(false)
    }
  }, [rewardGranted, handleImportPlan])

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

  const renderFooter = () => {
    const buttonTitle = isAlreadyImported
      ? 'Plano já Adicionado'
      : `Importar ${plan?.workouts.length ?? 0} Treino(s)`

    if (isPremium) {
      return (
        <View style={styles.footer}>
          <StyledButton
            title={buttonTitle}
            onPress={handleImportPlan}
            isLoading={isCreating}
            disabled={!plan || isAlreadyImported}
          />
        </View>
      )
    }

    const adButtonTitle = isAlreadyImported
      ? 'Plano já Adicionado'
      : 'Importar com Anúncio'

    return (
      <View style={styles.footer}>
        <AdRewarded
          onRewarded={() => setRewardGranted(true)}
          buttonTitle={adButtonTitle}
          disabled={isCreating || !plan || isAlreadyImported}
        />
        <TouchableOpacity
          style={styles.premiumButton}
          onPress={() => navigation.navigate('Premium')}
        >
          <Text style={styles.premiumButtonText}>
            Vire Premium para importar sem anúncios
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

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
          <View style={styles.titleContainer}>
            <Text style={styles.planName}>{plan.name}</Text>
            {plan.isPremium && <PremiumBadge />}
          </View>
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
      {renderFooter()}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  planName: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: theme.spacing.small,
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
  premiumButton: {
    marginTop: theme.spacing.medium,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
})
