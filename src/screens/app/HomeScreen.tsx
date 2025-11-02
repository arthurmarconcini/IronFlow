import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useCallback } from 'react'
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

export default function HomeScreen() {
  const { user } = useAuth()
  const { profile } = useProfileStore()
  const { workouts, isLoading, syncWorkouts, fetchLocalWorkouts } =
    useWorkouts()
  const navigation = useNavigation<AppNavigationProp>()
  const isOnline = useNetworkStore((state) => state.isOnline)
  const activeWorkout = useWorkoutExecutionStore((state) => state.workout)
  const resetWorkout = useWorkoutExecutionStore((state) => state.reset)

  useEffect(() => {
    syncWorkouts()
  }, [syncWorkouts])

  useFocusEffect(
    useCallback(() => {
      fetchLocalWorkouts()
    }, [fetchLocalWorkouts]),
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
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ],
      )
    } else {
      navigation.navigate('WorkoutExecution', { workoutId })
    }
  }

  return (
    <ScreenContainer style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() =>
            navigation.navigate('AppTabs', { screen: 'ProfileTab' })
          }
        >
          <Ionicons
            name="person-circle-outline"
            size={42}
            color={theme.colors.darkGray}
          />
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting} numberOfLines={2} ellipsizeMode="tail">
          Olá,{' '}
          <Text style={styles.userName}>
            {profile?.displayName || user?.email}
          </Text>
        </Text>
      </View>

      {/* Workout List Title */}
      <View style={styles.listTitleContainer}>
        <Text style={styles.listTitle}>Meus Treinos</Text>
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

      {/* Workout List */}
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
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="barbell-outline"
                size={80}
                color={theme.colors.lightGray}
              />
              <Text style={styles.emptyText}>Nenhum treino encontrado</Text>
              <Text style={styles.emptySubText}>
                Clique no botão '+' para criar seu primeiro treino.
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateWorkout', {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {},
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
    fontSize: 32, // Aumenta o tamanho da fonte base da saudação
    color: theme.colors.text,
  },
  userName: {
    fontWeight: 'bold', // Mantém apenas o nome em negrito
  },
  listTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    marginBottom: theme.spacing.medium,
  },
  listTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    paddingBottom: theme.spacing.small,
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
    flexGrow: 1, // Garante que o container possa crescer
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 30,
    color: '#FFFFFF',
  },
})
