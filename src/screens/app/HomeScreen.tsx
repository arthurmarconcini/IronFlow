import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useWorkouts } from '../../db/useWorkouts'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { AppNavigationProp } from '../../navigation/types'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import WorkoutCard from '../../components/WorkoutCard'
import PlanSummaryCard from '../../components/PlanSummaryCard'
import { useProfileStore } from '../../state/profileStore'
import { useWorkoutExecutionStore } from '../../state/workoutExecutionStore'
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus'
import AdBanner from '../../components/ads/BannerAd'
import { format } from 'date-fns'
import { ScheduledWorkout } from '../../types/database'
import { DatabaseService } from '../../db/DatabaseService'

export default function HomeScreen() {
  const { user } = useAuth()
  const profile = useProfileStore((state) => state.profile)
  const { workouts, isLoading, syncWorkouts, fetchLocalWorkouts } =
    useWorkouts()
  const navigation = useNavigation<AppNavigationProp>()
  const activeWorkout = useWorkoutExecutionStore((state) => state.workout)
  const resetWorkout = useWorkoutExecutionStore((state) => state.reset)
  const { isPremium } = useSubscriptionStatus()
  const [lastCompletedWorkoutId, setLastCompletedWorkoutId] = useState<
    string | null
  >(null)
  const [todaysWorkouts, setTodaysWorkouts] = useState<ScheduledWorkout[]>([])

  useEffect(() => {
    syncWorkouts()
  }, [syncWorkouts])

  useFocusEffect(
    useCallback(() => {
      fetchLocalWorkouts()
      if (user) {
        DatabaseService.getLastCompletedWorkout(user.uid).then((result) => {
          setLastCompletedWorkoutId(result?.workout_firestore_id || null)
        })
        const todayStr = format(new Date(), 'yyyy-MM-dd')
        DatabaseService.getScheduleForDate(user.uid, todayStr).then(
          setTodaysWorkouts,
        )
      }
    }, [fetchLocalWorkouts, user]),
  )

  const { splitType, nextWorkout, otherWorkouts } = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return { splitType: 'N/A', nextWorkout: null, otherWorkouts: [] }
    }

    let type = 'Personalizado'
    if (workouts.length <= 2) type = 'Full Body'
    else if (workouts.length === 3) type = 'ABC'
    else if (workouts.length === 4) type = 'Upper/Lower'
    else if (workouts.length >= 5) type = 'Push/Pull/Legs'

    // Prioridade 1: Treino agendado para hoje que não está completo
    const scheduledButNotCompleted = todaysWorkouts.find(
      (w) => w.status !== 'completed',
    )
    if (scheduledButNotCompleted) {
      const others = workouts.filter(
        (w) => w.firestoreId !== scheduledButNotCompleted.firestoreId,
      )
      return {
        splitType: type,
        nextWorkout: scheduledButNotCompleted,
        otherWorkouts: others,
      }
    }

    // Prioridade 2: Lógica de sequência normal
    let nextWorkoutIndex = 0
    if (lastCompletedWorkoutId) {
      const lastIndex = workouts.findIndex(
        (w) => w.firestoreId === lastCompletedWorkoutId,
      )
      if (lastIndex !== -1) {
        nextWorkoutIndex = (lastIndex + 1) % workouts.length
      }
    }

    const next = workouts[nextWorkoutIndex]
    const others = workouts.filter((_, index) => index !== nextWorkoutIndex)

    return { splitType: type, nextWorkout: next, otherWorkouts: others }
  }, [workouts, lastCompletedWorkoutId, todaysWorkouts])

  const handlePlayWorkout = (workoutId: string) => {
    if (activeWorkout && activeWorkout.firestoreId !== workoutId) {
      Alert.alert(
        'Treino em Andamento',
        `Você já tem um treino "${activeWorkout.name}" em andamento. O que deseja fazer?`,
        [
          {
            text: 'Continuar Treino',
            onPress: () =>
              navigation.navigate('WorkoutExecution', {
                workoutId: activeWorkout.firestoreId,
              }),
          },
          {
            text: 'Abandonar e Iniciar Novo',
            style: 'destructive',
            onPress: () => {
              resetWorkout()
              navigation.navigate('WorkoutExecution', { workoutId })
            },
          },
          { text: 'Cancelar', style: 'cancel' },
        ],
      )
    } else {
      navigation.navigate('WorkoutExecution', { workoutId })
    }
  }

  const renderHeader = () => (
    <>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons
            name="person-circle-outline"
            size={42}
            color={theme.colors.darkGray}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting} numberOfLines={2} ellipsizeMode="tail">
          Olá,{' '}
          <Text style={styles.userName}>
            {profile?.displayName || user?.email}
          </Text>
        </Text>
      </View>
      {!isPremium && <AdBanner />}
      <PlanSummaryCard profile={profile} splitType={splitType} />
      {nextWorkout && (
        <View style={styles.nextWorkoutContainer}>
          <Text style={styles.sectionTitle}>Próximo Treino</Text>
          <WorkoutCard
            workout={nextWorkout}
            onPress={() =>
              navigation.navigate('WorkoutDetails', {
                workoutId: nextWorkout.firestoreId,
              })
            }
            onPlay={() => handlePlayWorkout(nextWorkout.firestoreId)}
          />
        </View>
      )}
      {otherWorkouts.length > 0 && (
        <Text style={styles.sectionTitle}>Outros Treinos</Text>
      )}
    </>
  )

  return (
    <ScreenContainer>
      <StatusBar style="dark" />
      {isLoading && workouts.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={otherWorkouts}
          keyExtractor={(item) => item.firestoreId}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() =>
                navigation.navigate('WorkoutDetails', {
                  workoutId: item.firestoreId,
                })
              }
              onPlay={() => handlePlayWorkout(item.firestoreId)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={() =>
            !nextWorkout && ( // Só mostra se não houver NENHUM treino
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="barbell-outline"
                  size={80}
                  color={theme.colors.lightGray}
                />
                <Text style={styles.emptyText}>Nenhum treino encontrado</Text>
                <Text style={styles.emptySubText}>
                  Crie um treino ou explore planos para começar.
                </Text>
              </View>
            )
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WorkoutPlans')}
        >
          <Ionicons
            name="compass-outline"
            size={24}
            color={theme.colors.white}
          />
          <Text style={styles.actionButtonText}>Explorar Planos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateWorkout', {})}
        >
          <Ionicons name="add-outline" size={24} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Criar Treino</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: theme.spacing.small,
  },
  profileButton: {
    padding: 5,
  },
  greetingContainer: {
    marginBottom: theme.spacing.large,
  },
  greeting: {
    fontSize: 32,
    color: theme.colors.text,
  },
  userName: {
    fontWeight: 'bold',
  },
  nextWorkoutContainer: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  listContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
    minHeight: 200,
  },
  emptyText: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginTop: theme.spacing.medium,
  },
  emptySubText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    marginLeft: theme.spacing.small,
  },
})
