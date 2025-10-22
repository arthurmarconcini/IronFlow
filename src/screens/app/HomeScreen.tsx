import React, { useEffect, useCallback } from 'react' // Adiciona useCallback
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
import { useNavigation, useFocusEffect } from '@react-navigation/native' // Adiciona useFocusEffect
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.email}!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Workout */}
      <View style={styles.featuredContainer}>
        <Text style={styles.sectionTitle}>Meu Próximo Treino</Text>
        <View style={styles.featuredCard}>
          <Text style={styles.featuredTitle}>Treino de Peito e Tríceps</Text>
          <Text style={styles.featuredSubtitle}>Clique para começar</Text>
        </View>
      </View>

      {/* Workout List */}
      <Text style={styles.sectionTitle}>Meus Planos de Treino</Text>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={workouts} // Usa a lista de treinos do hook
          keyExtractor={(item) => item.firestoreId} // Usa firestoreId como chave
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() =>
                navigation.navigate('WorkoutDetail', { workoutId: item.id })
              }
              onDelete={() => deleteWorkout(item.firestoreId)} // Passa a função de deletar
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Você ainda não criou nenhum treino.
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
    padding: theme.spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  greeting: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
  },
  profileIcon: {
    fontSize: 28,
  },
  featuredContainer: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  featuredCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.medium,
    padding: theme.spacing.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  featuredSubtitle: {
    fontSize: theme.fontSizes.medium,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: theme.spacing.small,
  },
  listContent: {
    paddingBottom: 80, // To avoid FAB overlap
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 30,
    color: '#FFFFFF',
  },
})
