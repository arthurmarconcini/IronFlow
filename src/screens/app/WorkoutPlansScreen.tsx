import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AppNavigationProp } from '../../navigation/types'
import { DatabaseService } from '../../db/DatabaseService'
import { WorkoutPlan } from '../../types/database'
import ScreenContainer from '../../components/ScreenContainer'
import { theme } from '../../theme'

export default function WorkoutPlansScreen() {
  const navigation = useNavigation<AppNavigationProp>()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await DatabaseService.getWorkoutPlans()
        setPlans(fetchedPlans)
      } catch (error) {
        console.error('Failed to fetch workout plans:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const renderPlan = ({ item }: { item: WorkoutPlan }) => (
    <TouchableOpacity
      style={styles.planCard}
      onPress={() =>
        navigation.navigate('WorkoutPlanDetails', { planId: item.firestoreId })
      }
    >
      <Text style={styles.planName}>{item.name}</Text>
      <Text style={styles.planDescription}>{item.description}</Text>
      <View style={styles.planMeta}>
        <Text style={styles.planCategory}>{item.category}</Text>
        <Text style={styles.planExerciseCount}>
          {item.workouts.length}{' '}
          {item.workouts.length > 1 ? 'treinos' : 'treino'}
        </Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <ScreenContainer style={styles.center}>
        <Text>Carregando planos...</Text>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <FlatList
        data={plans}
        renderItem={renderPlan}
        keyExtractor={(item) => item.firestoreId}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.title}>Explorar Planos de Treino</Text>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>Nenhum plano de treino encontrado.</Text>
          </View>
        }
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
  },
  planCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  planName: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  planDescription: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textMuted,
    marginVertical: theme.spacing.small,
  },
  planMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.medium,
  },
  planCategory: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  planExerciseCount: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
  },
})
