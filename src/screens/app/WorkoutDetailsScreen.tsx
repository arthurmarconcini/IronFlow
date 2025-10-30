import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native'
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native'
import { AppStackParamList, AppNavigationProp } from '../../navigation/types'
import ScreenContainer from '../../components/ScreenContainer'
import { theme } from '../../theme'
import { useWorkouts } from '../../db/useWorkouts'
import { Workout } from '../../types/database'
import StyledButton from '../../components/StyledButton'
import { Ionicons } from '@expo/vector-icons'

type WorkoutDetailsScreenRouteProp = RouteProp<
  AppStackParamList,
  'WorkoutDetails'
>

export default function WorkoutDetailsScreen() {
  const route = useRoute<WorkoutDetailsScreenRouteProp>()
  const navigation = useNavigation<AppNavigationProp>()
  const { workoutId } = route.params

  const { getWorkoutById, deleteWorkout } = useWorkouts()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchWorkoutDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedWorkout = await getWorkoutById(workoutId)
      setWorkout(fetchedWorkout)
    } catch (error) {
      console.error('Erro ao buscar detalhes do treino:', error)
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do treino.')
    } finally {
      setIsLoading(false)
    }
  }, [workoutId, getWorkoutById])

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutDetails()
    }, [fetchWorkoutDetails]),
  )

  const handleDeleteWorkout = useCallback(() => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(workoutId)
              Alert.alert('Sucesso', 'Treino excluído com sucesso.')
              navigation.goBack()
            } catch (error) {
              console.error('Erro ao excluir treino:', error)
              Alert.alert('Erro', 'Não foi possível excluir o treino.')
            }
          },
        },
      ],
    )
  }, [deleteWorkout, workoutId, navigation])

  const handleEditWorkout = useCallback(() => {
    if (workout) {
      navigation.navigate('CreateWorkout', { workoutId: workout.firestoreId })
    }
  }, [navigation, workout])

  const handleStartWorkout = useCallback(() => {
    if (workout) {
      navigation.navigate('WorkoutExecution', {
        workoutId: workout.firestoreId,
      })
    }
  }, [navigation, workout])

  if (isLoading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando treino...</Text>
      </ScreenContainer>
    )
  }

  if (!workout) {
    return (
      <ScreenContainer style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Treino não encontrado.</Text>
        <StyledButton title="Voltar" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <Text style={styles.muscleGroup}>{workout.muscleGroup}</Text>
      </View>

      <Text style={styles.sectionTitle}>Exercícios</Text>
      <FlatList
        data={workout.exercises}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>
              {index + 1}. {item.name}
            </Text>
            <Text style={styles.exerciseDetails}>
              {item.sets} séries de {item.reps} repetições
              {item.weight ? ` com ${item.weight}kg` : ''}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.exercisesList}
      />

      <View style={styles.actionsContainer}>
        <StyledButton
          title="Iniciar Treino"
          onPress={handleStartWorkout}
          icon={
            <Ionicons
              name="play-circle-outline"
              size={20}
              color={theme.colors.white}
            />
          }
          containerStyle={styles.startButton}
        />
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            onPress={handleEditWorkout}
            style={styles.actionButton}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteWorkout}
            style={styles.actionButton}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={theme.colors.error}
            />
            <Text
              style={[styles.actionButtonText, { color: theme.colors.error }]}
            >
              Excluir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
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
    marginBottom: theme.spacing.large,
  },
  header: {
    marginBottom: theme.spacing.large,
    alignItems: 'center',
  },
  workoutName: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  muscleGroup: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    paddingBottom: theme.spacing.small,
  },
  exercisesList: {
    flexGrow: 1,
    paddingBottom: theme.spacing.large,
  },
  exerciseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  exerciseName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  exerciseDetails: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
  },
  actionsContainer: {
    marginTop: theme.spacing.large,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    paddingTop: theme.spacing.large,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    marginBottom: theme.spacing.medium,
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.small,
    marginHorizontal: theme.spacing.small,
  },
  actionButtonText: {
    marginLeft: theme.spacing.small,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
  },
})
