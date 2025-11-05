import React, { useEffect, useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppNavigationProp, AppRouteProp } from '../../navigation/types'
import {
  SetData,
  useWorkoutExecutionStore,
} from '../../state/workoutExecutionStore'
import { useWorkouts } from '../../db/useWorkouts' // Importar o hook
import { theme } from '../../theme'
import { StrengthExercise } from '../../types/database'
import ExerciseSetRow from '../../components/ExerciseSetRow'
import ExerciseSelectionModal from '../../components/ExerciseSelectionModal'
import CompletionOverlay from '../../components/CompletionOverlay'

type Props = {
  route: AppRouteProp<'WorkoutExecution'>
}

export default function WorkoutExecutionScreen({ route }: Props) {
  const { workoutId } = route.params
  const navigation = useNavigation<AppNavigationProp>()
  const flatListRef = useRef<FlatList>(null)
  const [isModalVisible, setModalVisible] = useState(false)
  const { finishWorkout } = useWorkouts() // Obter a função do hook

  const {
    workout,
    logId,
    currentExerciseIndex,
    currentSetIndex,
    restTimer,
    isFinished,
    completedSets,
    initializeWorkout, // Usar a nova ação
    completeSet,
    startRest,
    tickRestTimer,
    reset,
    goToExercise,
    goToNextExercise,
  } = useWorkoutExecutionStore()

  const onTimerFinish = useCallback(() => {
    useWorkoutExecutionStore.getState().finishRest()
  }, [])

  useFocusEffect(
    useCallback(() => {
      initializeWorkout(workoutId)
    }, [workoutId, initializeWorkout]),
  )

  useEffect(() => {
    if (restTimer.isActive) {
      const interval = setInterval(() => {
        tickRestTimer()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [restTimer.isActive, tickRestTimer])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isFinished && workout) {
        e.preventDefault()

        Alert.alert(
          'Abandonar Treino?',
          'Você tem um treino em andamento. Tem certeza que deseja abandoná-lo? Seu progresso será perdido.',
          [
            { text: 'Não', style: 'cancel', onPress: () => {} },
            {
              text: 'Sim, Abandonar',
              style: 'destructive',
              onPress: () => {
                reset()
                navigation.dispatch(e.data.action)
              },
            },
          ],
        )
      }
    })

    return unsubscribe
  }, [navigation, isFinished, workout, reset])

  useEffect(() => {
    if (isFinished && logId && workout) {
      // Chamar a nova função aqui
      finishWorkout(logId, workout.firestoreId).then(() => {
        Alert.alert(
          'Treino Concluído!',
          'Você finalizou seu treino com sucesso.',
          [
            {
              text: 'OK',
              onPress: () => {
                reset()
                navigation.navigate('AppTabs', { screen: 'HomeTab' })
              },
            },
          ],
        )
      })
    }
  }, [isFinished, logId, workout, finishWorkout, navigation, reset])

  useEffect(() => {
    if (workout && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: currentExerciseIndex,
        animated: true,
      })
    }
  }, [currentExerciseIndex, workout])

  const handleCompleteSet = (setIndex: number, setData: SetData) => {
    completeSet(setData)
    const currentExercise = workout!.exercises[
      currentExerciseIndex
    ] as StrengthExercise
    if (
      currentExerciseIndex < workout!.exercises.length - 1 ||
      setIndex < currentExercise.sets - 1
    ) {
      startRest()
    } else {
      useWorkoutExecutionStore.getState().finishWorkout()
    }
  }

  const handleSelectExercise = (index: number) => {
    goToExercise(index)
    setModalVisible(false)
  }

  const getItemLayout = (
    data: ArrayLike<StrengthExercise> | null | undefined,
    index: number,
  ) => ({
    length: theme.screenWidth,
    offset: theme.screenWidth * index,
    index,
  })

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Carregando treino...</Text>
      </SafeAreaView>
    )
  }

  const renderExercise = ({
    item: exercise,
    index,
  }: {
    item: StrengthExercise
    index: number
  }) => {
    const setsArray = Array.from({ length: exercise.sets }, (_, i) => i)
    const lastCompletedSet =
      completedSets[`${index}-${currentSetIndex - 1}`] ||
      completedSets[`${index - 1}-${exercise.sets - 1}`]

    const isExerciseCompleted =
      index < currentExerciseIndex ||
      (index === currentExerciseIndex && currentSetIndex >= exercise.sets)

    const isLastExercise = index === workout!.exercises.length - 1

    return (
      <View style={styles.exerciseContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Ionicons
                name="chevron-down-outline"
                size={24}
                color={theme.colors.secondary}
              />
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsText}>Séries: {exercise.sets}</Text>
              <Text style={styles.detailsText}>Reps Alvo: {exercise.reps}</Text>
              <Text style={styles.detailsText}>Descanso: {exercise.rest}s</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View>
          {isExerciseCompleted && (
            <CompletionOverlay
              onPressNext={!isLastExercise ? goToNextExercise : undefined}
            />
          )}
          {setsArray.map((setIndex) => {
            const setData = completedSets[`${index}-${setIndex}`]
            const isCompleted = !!setData
            const isActive =
              index === currentExerciseIndex && setIndex === currentSetIndex

            const isResting =
              restTimer.isActive &&
              index === currentExerciseIndex &&
              setIndex === currentSetIndex - 1

            return (
              <ExerciseSetRow
                key={setIndex}
                setNumber={setIndex + 1}
                targetReps={setData?.reps ?? exercise.reps}
                targetWeight={setData?.weightKg ?? lastCompletedSet?.weightKg}
                isCompleted={isCompleted}
                isActive={isActive}
                isResting={isResting}
                restDuration={exercise.rest}
                onComplete={(data) => handleCompleteSet(setIndex, data)}
                onTimerFinish={onTimerFinish}
              />
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <Text style={styles.progressText}>
          Exercício {currentExerciseIndex + 1} de {workout.exercises.length}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={workout.exercises as StrengthExercise[]}
        renderItem={renderExercise}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        getItemLayout={getItemLayout}
      />

      <ExerciseSelectionModal
        isVisible={isModalVisible}
        exercises={workout.exercises}
        currentExerciseIndex={currentExerciseIndex}
        onClose={() => setModalVisible(false)}
        onSelectExercise={handleSelectExercise}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.medium,
  },
  workoutName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  progressText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.small / 2,
  },
  exerciseContainer: {
    width: theme.screenWidth,
    paddingHorizontal: theme.spacing.medium,
  },
  exerciseCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.medium,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.small,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailsText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
  },
})
