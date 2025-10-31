import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Modal, ScrollView, Alert } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppRouteProp } from '../../navigation/types'
import { useWorkoutExecutionStore } from '../../state/workoutExecutionStore'
import { DatabaseService } from '../../db/DatabaseService'
import { theme } from '../../theme'
import { StrengthExercise } from '../../types/database'
import ScreenContainer from '../../components/ScreenContainer'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import CircularProgress from '../../components/CircularProgress'

type Props = {
  route: AppRouteProp<'WorkoutExecution'>
}

export default function WorkoutExecutionScreen({ route }: Props) {
  const { workoutId } = route.params
  const navigation = useNavigation()

  // Local state for user inputs
  const [weightInput, setWeightInput] = useState('')
  const [repsInput, setRepsInput] = useState('')

  // Zustand store state and actions
  const {
    workout,
    currentExerciseIndex,
    currentSetIndex,
    restTimer,
    isFinished,
    startWorkout,
    completeSet,
    startRest,
    tickRestTimer,
    reset,
  } = useWorkoutExecutionStore()

  // Effect to initialize the workout in the store
  useFocusEffect(
    useCallback(() => {
      const loadWorkout = async () => {
        const workoutData = await DatabaseService.getWorkoutById(workoutId)
        if (workoutData) {
          startWorkout(workoutData)
        }
      }
      loadWorkout()

      // Reset the store when the screen loses focus
      return () => reset()
    }, [workoutId, startWorkout, reset]),
  )

  // Effect for the rest timer countdown
  useEffect(() => {
    if (restTimer.isActive) {
      const interval = setInterval(() => {
        tickRestTimer()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [restTimer.isActive, tickRestTimer])

  // Effect to handle workout completion
  useEffect(() => {
    if (isFinished) {
      Alert.alert(
        'Treino Concluído!',
        'Você finalizou seu treino com sucesso.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      )
    }
  }, [isFinished, navigation])

  const handleCompleteSet = () => {
    const weight = parseFloat(weightInput)
    const reps = parseInt(repsInput, 10)

    if (isNaN(weight) || isNaN(reps)) {
      Alert.alert(
        'Erro',
        'Por favor, insira valores válidos para peso e repetições.',
      )
      return
    }

    completeSet({ weightKg: weight, reps })
    startRest()
    // Clear inputs for the next set
    setWeightInput('')
    setRepsInput('')
  }

  if (!workout) {
    return (
      <ScreenContainer>
        <Text>Carregando treino...</Text>
      </ScreenContainer>
    )
  }

  const currentExercise = workout.exercises[
    currentExerciseIndex
  ] as StrengthExercise

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.progressText}>
            Exercício {currentExerciseIndex + 1} de {workout.exercises.length}
          </Text>
        </View>

        {/* Current Exercise */}
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsText}>
              Série: {currentSetIndex + 1} / {currentExercise.sets}
            </Text>
            <Text style={styles.detailsText}>
              Reps Alvo: {currentExercise.reps}
            </Text>
            <Text style={styles.detailsText}>
              Descanso: {currentExercise.rest}s
            </Text>
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <StyledInput
            label="Peso (kg)"
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="numeric"
            containerStyle={styles.input}
          />
          <StyledInput
            label="Repetições"
            value={repsInput}
            onChangeText={setRepsInput}
            keyboardType="numeric"
            containerStyle={styles.input}
          />
        </View>

        {/* Action Button */}
        <StyledButton
          title="Concluir Série"
          onPress={handleCompleteSet}
          containerStyle={styles.actionButton}
        />

        {/* Rest Timer Modal */}
        <Modal
          visible={restTimer.isActive}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.timerTitle}>Descanso</Text>
              <CircularProgress
                size={150}
                strokeWidth={15}
                progress={(restTimer.remaining / restTimer.duration) * 100}
              >
                <Text style={styles.timerText}>{restTimer.remaining}</Text>
              </CircularProgress>
              <StyledButton
                title="Pular Descanso"
                onPress={() => useWorkoutExecutionStore.getState().finishRest()}
                type="secondary"
                containerStyle={{ marginTop: 20 }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.medium,
  },
  header: {
    marginBottom: theme.spacing.large,
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
  exerciseCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailsText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    width: '48%',
  },
  actionButton: {
    marginTop: theme.spacing.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: theme.spacing.large,
    alignItems: 'center',
    width: '80%',
  },
  timerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.large,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})
