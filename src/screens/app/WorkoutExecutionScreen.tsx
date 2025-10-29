import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import { AppRouteProp } from '../../navigation/types'
import { useWorkoutExecutionStore } from '../../state/workoutExecutionStore'
import { useWorkouts } from '../../db/useWorkouts'
import StyledButton from '../../components/StyledButton'

// Helper para formatar o tempo
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

export default function WorkoutExecutionScreen() {
  const route = useRoute<AppRouteProp<'WorkoutExecution'>>()
  const { workoutId } = route.params

  const { getWorkoutById, isLoading } = useWorkouts()
  const {
    startWorkout,
    endWorkout,
    currentWorkout,
    currentExerciseIndex,
    currentSetIndex,
    nextSet,
    previousSet,
    logSet,
    timerState,
    timerValue,
    startTimer,
    pauseTimer,
    resumeTimer,
    startRestTimer,
    tickTimer,
    resetTimer,
  } = useWorkoutExecutionStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadWorkout = async () => {
      const workoutDetails = await getWorkoutById(workoutId)
      if (workoutDetails) {
        startWorkout(workoutDetails)
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do treino.')
      }
    }
    loadWorkout()
    return () => {
      endWorkout()
    }
  }, [workoutId, getWorkoutById, startWorkout, endWorkout])

  // Efeito para o cronômetro principal
  useEffect(() => {
    if (timerState === 'running' || timerState === 'resting') {
      intervalRef.current = setInterval(() => {
        tickTimer()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, tickTimer])

  // Efeito para avançar após o descanso
  useEffect(() => {
    if (timerState === 'resting' && timerValue < 1) {
      resetTimer()
      nextSet()
    }
  }, [timerValue, timerState, resetTimer, nextSet])

  if (isLoading || !currentWorkout) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    )
  }

  const currentExercise = currentWorkout.exercises[currentExerciseIndex]
  const isFirstSet = currentExerciseIndex === 0 && currentSetIndex === 0
  const isLastSet =
    currentExerciseIndex === currentWorkout.exercises.length - 1 &&
    currentSetIndex === currentExercise.sets - 1

  const handleNextPress = () => {
    logSet({ reps: null, weight: null }) // Log com valores nulos por enquanto
    if (!isLastSet) {
      startRestTimer()
    } else {
      // Lógica para finalizar o treino virá aqui
      Alert.alert('Treino Finalizado!', 'Parabéns!')
    }
  }

  const renderTimerControls = () => {
    if (timerState === 'resting') {
      return (
        <View style={styles.timerContainer}>
          <Text style={styles.timerTextLabel}>Descansando...</Text>
          <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
        </View>
      )
    }

    return (
      <View style={styles.timerControlContainer}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
        </View>
        {timerState === 'idle' && (
          <StyledButton title="Iniciar Série" onPress={startTimer} />
        )}
        {timerState === 'running' && (
          <StyledButton title="Pausar" onPress={pauseTimer} type="secondary" />
        )}
        {timerState === 'paused' && (
          <StyledButton title="Retomar" onPress={resumeTimer} />
        )}
      </View>
    )
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.exerciseInfoContainer}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.setText}>
            Série {currentSetIndex + 1} de {currentExercise.sets}
          </Text>
          <Text style={styles.repsText}>
            Repetições Alvo: {currentExercise.reps}
          </Text>
        </View>

        {renderTimerControls()}

        <View style={styles.navigationContainer}>
          <StyledButton
            title="Anterior"
            onPress={previousSet}
            disabled={isFirstSet}
            type="secondary"
            containerStyle={styles.navButton}
          />
          <StyledButton
            title={isLastSet ? 'Finalizar Treino' : 'Próximo Set'}
            onPress={handleNextPress}
            type="primary"
            containerStyle={styles.navButton}
            disabled={timerState === 'resting'}
          />
        </View>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: theme.spacing.medium,
    justifyContent: 'space-between',
  },
  exerciseInfoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  exerciseName: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  setText: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.primary,
    marginTop: theme.spacing.small,
  },
  repsText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.small,
  },
  timerControlContainer: {
    marginVertical: theme.spacing.large,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  timerTextLabel: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textMuted,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.medium,
  },
  navButton: {
    flex: 1,
    marginHorizontal: theme.spacing.small,
  },
})
