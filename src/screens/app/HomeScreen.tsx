import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useCallback, useState } from 'react'
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
import { useNetworkStore } from '../../state/networkStore'
import { useProfileStore } from '../../state/profileStore'
import { useWorkoutExecutionStore } from '../../state/workoutExecutionStore'
import { DatabaseService } from '../../db/DatabaseService'
import { ScheduledWorkout } from '../../types/database'
import { format } from 'date-fns'
import AdBanner from '../../components/ads/BannerAd' // Importar o componente de anúncio

export default function HomeScreen() {
  const { user } = useAuth()
  const profile = useProfileStore((state) => state.profile)
  const { workouts, isLoading, syncWorkouts, fetchLocalWorkouts } =
    useWorkouts()
  const navigation = useNavigation<AppNavigationProp>()
  const isOnline = useNetworkStore((state) => state.isOnline)
  const activeWorkout = useWorkoutExecutionStore((state) => state.workout)
  const resetWorkout = useWorkoutExecutionStore((state) => state.reset)

  const [todaysWorkouts, setTodaysWorkouts] = useState<ScheduledWorkout[]>([])

  const fetchTodaysWorkout = useCallback(async () => {
    if (!user) return
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const scheduled = await DatabaseService.getScheduleForDate(
        user.uid,
        todayStr,
      )
      setTodaysWorkouts(scheduled)
    } catch (error) {
      console.error("Failed to fetch today's workout:", error)
    }
  }, [user])

  useEffect(() => {
    syncWorkouts()
  }, [syncWorkouts])

  useFocusEffect(
    useCallback(() => {
      fetchLocalWorkouts()
      fetchTodaysWorkout()
    }, [fetchLocalWorkouts, fetchTodaysWorkout]),
  )

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

  const renderTodaysWorkouts = () => {
    if (todaysWorkouts.length === 0) return null

    return (
      <View style={styles.todaysWorkoutContainer}>
        <Text style={styles.sectionTitle}>Treino de Hoje</Text>
        {todaysWorkouts.map((scheduledWorkout) => (
          <WorkoutCard
            key={scheduledWorkout.scheduleId}
            workout={scheduledWorkout}
            onPress={() =>
              navigation.navigate('WorkoutDetails', {
                workoutId: scheduledWorkout.firestoreId,
              })
            }
            onPlay={() => handlePlayWorkout(scheduledWorkout.firestoreId)}
            isCompleted={scheduledWorkout.status === 'completed'}
          />
        ))}
      </View>
    )
  }

  return (
    <ScreenContainer>
      <StatusBar style="dark" />
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

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={workouts}
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
          ListHeaderComponent={
            <>
              <AdBanner />
              {renderTodaysWorkouts()}
              <View style={styles.listTitleContainer}>
                <Text style={styles.sectionTitle}>Meus Treinos</Text>
                <View
                  style={[
                    styles.networkIndicator,
                    {
                      backgroundColor: isOnline
                        ? theme.colors.primary
                        : theme.colors.error,
                    },
                  ]}
                />
              </View>
            </>
          }
          ListEmptyComponent={() => (
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
          )}
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
  todaysWorkoutContainer: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    paddingBottom: theme.spacing.small,
  },
  listTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    marginBottom: theme.spacing.medium,
  },
  networkIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: theme.spacing.small,
    marginBottom: theme.spacing.small,
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
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
    textAlign: 'center',
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
