import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { FreeWorkoutOfferScreenRouteProp } from '../../navigation/types'
import { WorkoutGeneratorService } from '../../services/WorkoutGeneratorService'
import { UserProfile } from '../../types/database'
import { useAuth } from '../../hooks/useAuth'
import { useProfileStore } from '../../state/profileStore'
import { useWorkouts } from '../../db/useWorkouts'
import { DatabaseService } from '../../db/DatabaseService'
import { SyncService } from '../../sync/SyncService'

type Props = {
  route: FreeWorkoutOfferScreenRouteProp
}

const FreeWorkoutOfferScreen = ({ route }: Props) => {
  const { user } = useAuth()
  const setProfile = useProfileStore((state) => state.setProfile)
  const { createWorkout } = useWorkouts()
  const [isLoading, setIsLoading] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const userProfileData = route.params

  const previewWorkouts = useMemo(() => {
    if (!user) return null
    const tempProfileForPreview: UserProfile = {
      id: 0,
      userId: user.uid,
      planType: 'free',
      onboardingCompleted: true,
      syncStatus: 'synced',
      lastModifiedLocally: Date.now(),
      ...userProfileData,
      currentWeightKg: userProfileData.weightKg,
    }
    return WorkoutGeneratorService.generatePreviewWorkout(tempProfileForPreview)
  }, [userProfileData, user])

  const handleToggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const handleAccept = async () => {
    if (!user || !previewWorkouts) return
    setIsLoading(true)
    try {
      // Constrói o objeto de perfil explicitamente para garantir que todos os campos sejam incluídos
      const finalProfileData: Omit<UserProfile, 'id'> = {
        userId: user.uid,
        planType: 'free',
        displayName: userProfileData.displayName,
        dob: userProfileData.dob,
        sex: userProfileData.sex,
        experienceLevel: userProfileData.experienceLevel,
        availability: userProfileData.availability,
        goal: userProfileData.goal, // Garante que o 'goal' seja incluído
        heightCm: userProfileData.heightCm,
        currentWeightKg: userProfileData.weightKg,
        bmi: userProfileData.bmi,
        bmiCategory: userProfileData.bmiCategory,
        onboardingCompleted: true,
        syncStatus: 'dirty',
        lastModifiedLocally: Date.now(),
      }

      const newId = await DatabaseService.saveUserProfile(finalProfileData)
      const finalProfile = { ...finalProfileData, id: newId }

      for (const workout of previewWorkouts) {
        await createWorkout(
          workout.name,
          workout.muscleGroup,
          workout.exercises,
        )
      }
      setProfile(finalProfile)
      SyncService.syncUserProfile(user)
    } catch (error) {
      console.error('Erro ao aceitar a oferta de treino:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // Constrói o objeto de perfil explicitamente também aqui
      const finalProfileData: Omit<UserProfile, 'id'> = {
        userId: user.uid,
        planType: 'free',
        displayName: userProfileData.displayName,
        dob: userProfileData.dob,
        sex: userProfileData.sex,
        experienceLevel: userProfileData.experienceLevel,
        availability: userProfileData.availability,
        goal: userProfileData.goal, // Garante que o 'goal' seja incluído
        heightCm: userProfileData.heightCm,
        currentWeightKg: userProfileData.weightKg,
        bmi: userProfileData.bmi,
        bmiCategory: userProfileData.bmiCategory,
        onboardingCompleted: true,
        syncStatus: 'dirty',
        lastModifiedLocally: Date.now(),
      }
      const newId = await DatabaseService.saveUserProfile(finalProfileData)
      const finalProfile = { ...finalProfileData, id: newId }
      setProfile(finalProfile)
      SyncService.syncUserProfile(user)
    } catch (error) {
      console.error('Erro ao recusar a oferta de treino:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Ionicons
            name="trophy-outline"
            size={80}
            color={theme.colors.primary}
          />
          <Text style={styles.title}>Seu Plano de Treino Gratuito!</Text>
          <Text style={styles.subtitle}>
            Com base nas suas respostas, preparamos um plano inicial
            personalizado para você.
          </Text>
        </View>

        <View style={styles.card}>
          {previewWorkouts && previewWorkouts.length > 0 ? (
            <>
              <Text style={styles.cardTitle}>Seu Plano de Treino Semanal</Text>
              <View style={styles.divider} />
              {previewWorkouts.map((workout, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleToggleExpand(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.workoutItem}>
                    <View style={styles.workoutHeader}>
                      <Ionicons
                        name="barbell-outline"
                        size={24}
                        color={theme.colors.primary}
                        style={styles.workoutIcon}
                      />
                      <View style={styles.workoutDetails}>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        <Text style={styles.workoutSubtext}>
                          {workout.muscleGroup} • {workout.exercises.length}{' '}
                          exercícios
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          expandedIndex === index
                            ? 'chevron-up-outline'
                            : 'chevron-down-outline'
                        }
                        size={24}
                        color={theme.colors.secondary}
                      />
                    </View>
                    {expandedIndex === index && (
                      <View style={styles.exerciseList}>
                        {workout.exercises.map((exercise, exIndex) => (
                          <View key={exIndex} style={styles.exerciseRow}>
                            <Text style={styles.exerciseName}>
                              {exercise.name}
                            </Text>
                            <Text style={styles.exerciseSetsReps}>
                              {exercise.type === 'strength'
                                ? `${exercise.sets}x ${exercise.reps} reps`
                                : `${exercise.durationMinutes} min`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <Text style={styles.loadingText}>
              Gerando seu plano de treino...
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <StyledButton
            title="Aceitar e Começar"
            onPress={handleAccept}
            isLoading={isLoading}
          />
          <TouchableOpacity
            onPress={handleDecline}
            style={styles.declineButton}
            disabled={isLoading}
          >
            <Text style={styles.declineButtonText}>Agora não, obrigado</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.medium,
  },
  subtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.small,
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.lightGray,
    marginBottom: theme.spacing.medium,
  },
  workoutItem: {
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutIcon: {
    marginRight: theme.spacing.medium,
  },
  workoutDetails: {
    flex: 1,
  },
  workoutName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  workoutSubtext: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  exerciseList: {
    marginTop: theme.spacing.medium,
    paddingLeft: theme.spacing.large,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.small / 2,
  },
  exerciseName: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    flex: 1,
  },
  exerciseSetsReps: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
  },
  footer: {
    alignItems: 'center',
  },
  declineButton: {
    marginTop: theme.spacing.medium,
    padding: theme.spacing.small,
  },
  declineButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
  },
  loadingText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.large,
  },
})

export default FreeWorkoutOfferScreen
