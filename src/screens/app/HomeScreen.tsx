import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useDatabase, Workout } from '../../db/useDatabase'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { AppNavigationProp } from '../../navigation/types'
import { theme } from '../../theme'
import WorkoutCard from '../../components/WorkoutCard'

export default function HomeScreen() {
  const { user } = useAuth()
  const { getWorkouts } = useDatabase()
  const navigation = useNavigation<AppNavigationProp>()
  const [workouts, setWorkouts] = useState<Workout[]>([])

  const loadWorkouts = useCallback(async () => {
    const data = await getWorkouts()
    setWorkouts(data)
  }, [getWorkouts])

  useFocusEffect(loadWorkouts)

  return (
    <SafeAreaView style={styles.container}>
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
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <WorkoutCard
            workout={item}
            onPress={() =>
              navigation.navigate('WorkoutDetail', { workoutId: item.id })
            }
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

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateWorkout')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background,
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
    fontWeight: 'bold',
    color: theme.palette.text,
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
    color: theme.palette.text,
    marginBottom: theme.spacing.medium,
  },
  featuredCard: {
    backgroundColor: theme.palette.primary,
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
    color: theme.palette.secondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: theme.palette.primary,
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
