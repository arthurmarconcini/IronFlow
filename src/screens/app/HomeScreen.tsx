import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useWorkouts } from '../../db/useWorkouts'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppNavigationProp } from '../../navigation/types'
import { theme } from '../../theme'
import WorkoutCard from '../../components/WorkoutCard'

export default function HomeScreen() {
  const { user } = useAuth()
  const {
    workouts,
    isLoading,
    syncWorkouts,
    fetchLocalWorkouts,
    deleteWorkout,
  } = useWorkouts()
  const navigation = useNavigation<AppNavigationProp>()
  const insets = useSafeAreaInsets()

  // Sincroniza com o Firestore apenas uma vez ao carregar o app
  useEffect(() => {
    syncWorkouts()
  }, [])

  // Recarrega os treinos do banco local toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchLocalWorkouts()
    }, [fetchLocalWorkouts]),
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.userName}>
            {user?.displayName || user?.email}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Workout List */}
      <Text style={styles.sectionTitle}>Meus Treinos</Text>
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
                navigation.navigate('WorkoutDetail', { workoutId: item.id })
              }
              onDelete={() => deleteWorkout(item.firestoreId)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Você ainda não criou nenhum treino.
              </Text>
              <Text style={styles.emptySubText}>
                Clique no botão '+' para começar.
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('CreateWorkout')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  greeting: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.secondary,
  },
  userName: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileIcon: {
    fontSize: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  listContent: {
    paddingBottom: 100, // Aumenta o espaço para o FAB não sobrepor o último item
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40%',
  },
  emptyText: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
  },
  fab: {
    position: 'absolute',
    right: 20,
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
