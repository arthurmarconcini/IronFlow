import React, { useEffect, useCallback, useRef } from 'react'
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  View,
  TouchableOpacity,
  Animated, // Import Animated from react-native
} from 'react-native'
import { useWorkouts } from '../../db/useWorkouts'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import {
  Exercise,
  useWorkoutCreationStore,
  StrengthExercise,
  CardioExercise,
} from '../../state/workoutCreationStore'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import { AppNavigationProp, AppStackParamList } from '../../navigation/types'
import Toast from 'react-native-toast-message'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'

type CreateWorkoutScreenRouteProp = RouteProp<
  AppStackParamList,
  'CreateWorkout'
>

export default function CreateWorkoutScreen() {
  const { createWorkout, updateWorkout, getWorkoutById, isLoading } =
    useWorkouts()
  const navigation = useNavigation<AppNavigationProp>()
  const route = useRoute<CreateWorkoutScreenRouteProp>()
  const { workoutId } = route.params || {}

  const {
    workoutName,
    muscleGroup,
    exercises,
    setWorkoutName,
    setMuscleGroup,
    setExercises,
    removeExercise,
    reset,
  } = useWorkoutCreationStore()

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map())

  useEffect(() => {
    if (workoutId) {
      const fetchAndSetWorkout = async () => {
        const workout = await getWorkoutById(workoutId)
        if (workout) {
          setWorkoutName(workout.name)
          setMuscleGroup(workout.muscleGroup)
          setExercises(workout.exercises)
        }
      }
      fetchAndSetWorkout()
    } else {
      reset()
    }
    return () => {
      reset()
    }
  }, [
    workoutId,
    getWorkoutById,
    setWorkoutName,
    setMuscleGroup,
    setExercises,
    reset,
  ])

  const handleSave = useCallback(async () => {
    if (!workoutName.trim() || !muscleGroup.trim() || exercises.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Campos incompletos',
        text2:
          'Nome, grupo muscular e pelo menos um exercício são necessários.',
      })
      return
    }

    try {
      if (workoutId) {
        await updateWorkout(
          workoutId,
          workoutName,
          muscleGroup,
          exercises,
          Date.now(),
        )
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Treino atualizado com sucesso!',
          visibilityTime: 2000,
          onHide: () => {
            reset()
            navigation.goBack()
          },
        })
      } else {
        await createWorkout(workoutName, muscleGroup, exercises)
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Treino salvo com sucesso!',
          visibilityTime: 2000,
          onHide: () => {
            reset()
            navigation.goBack()
          },
        })
      }
    } catch (error) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar o treino.',
      })
    }
  }, [
    workoutName,
    muscleGroup,
    exercises,
    createWorkout,
    updateWorkout,
    workoutId,
    navigation,
    reset,
  ])

  // Use the signature provided by Swipeable: (progress, dragX)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    onDelete: () => void,
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    })
    return (
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Animated.View
          style={[
            styles.deleteButtonView,
            { transform: [{ translateX: trans }] },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color={theme.colors.white} />
        </Animated.View>
      </TouchableOpacity>
    )
  }

  const renderExercise = ({
    item,
    index,
  }: {
    item: Exercise
    index: number
  }) => {
    const key = `${item.exerciseId}-${index}`
    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current.set(key, ref)
          } else {
            swipeableRefs.current.delete(key)
          }
        }}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, () => {
            swipeableRefs.current.get(key)?.close()
            removeExercise(index)
          })
        }
        overshootRight={false}
        containerStyle={styles.swipeableContainer}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CustomizeExercise', { exercise: item, index })
          }
        >
          <View style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.exerciseDetails}>
              {item.type === 'strength' ? (
                <>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>
                      {(item as StrengthExercise).sets}
                    </Text>
                    <Text style={styles.detailLabel}>Séries</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>
                      {(item as StrengthExercise).reps}
                    </Text>
                    <Text style={styles.detailLabel}>Reps</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>
                      {(item as StrengthExercise).rest ?? 0}
                    </Text>
                    <Text style={styles.detailLabel}>Descanso (s)</Text>
                  </View>
                </>
              ) : (
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>
                    {(item as CardioExercise).durationMinutes}
                  </Text>
                  <Text style={styles.detailLabel}>Duração (min)</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }

  return (
    <ScreenContainer style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {workoutId ? 'Editar Treino' : 'Criar Novo Treino'}
          </Text>
          <StyledInput
            placeholder="Nome do Treino (Ex: Peito e Tríceps)"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
          <StyledInput
            placeholder="Grupo Muscular (Ex: Peitoral)"
            value={muscleGroup}
            onChangeText={setMuscleGroup}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.subtitle}>Exercícios</Text>
          <Text style={styles.exerciseCount}>{exercises.length}</Text>
        </View>

        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item, index) => `${item.exerciseId}-${index}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>
              Nenhum exercício adicionado.
            </Text>
          }
        />

        <View style={styles.footerContainer}>
          <StyledButton
            title="Adicionar Exercício"
            onPress={() => navigation.navigate('AddExercise')}
          />
          <StyledButton
            title={workoutId ? 'Atualizar Treino' : 'Salvar Treino'}
            onPress={handleSave}
            disabled={
              !workoutName.trim() ||
              !muscleGroup.trim() ||
              exercises.length === 0
            }
            isLoading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {},
  keyboardAvoidingContainer: {
    flex: 1,
  },
  formContainer: {
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  subtitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
  },
  exerciseCount: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.small,
  },
  swipeableContainer: {
    marginBottom: theme.spacing.medium,
  },
  exerciseItem: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseName: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  detailLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  emptyListText: {
    textAlign: 'center',
    color: theme.colors.text,
    marginVertical: theme.spacing.medium,
  },
  footerContainer: {
    marginTop: theme.spacing.medium,
  },
  deleteButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  deleteButtonView: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.medium,
  },
})
