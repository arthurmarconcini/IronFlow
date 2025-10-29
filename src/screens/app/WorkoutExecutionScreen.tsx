import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import { AppNavigationProp, AppRouteProp } from '../../navigation/types'
import { useWorkoutExecutionStore } from '../../state/workoutExecutionStore'
import { useWorkouts } from '../../db/useWorkouts'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import { DatabaseService, ExerciseRecord } from '../../db/DatabaseService'
import { useAuth } from '../../hooks/useAuth'
import CircularProgress from '../../components/CircularProgress' // <-- Importado

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
  const navigation = useNavigation<AppNavigationProp>()
  const { user } = useAuth()
  const { workoutId } = route.params

  const { getWorkoutById, isLoading } = useWorkouts()
  const {
    startWorkout,
    endWorkout,
    currentWorkout,
    currentExerciseIndex,
    currentSetIndex,
    setLogs,
    nextSet,
    previousSet,
    logSet,
    timerState,
    timerValue,
    restTimeTarget, // <-- Obtido da store
    startTimer,
    pauseTimer,
    resumeTimer,
    startRestTimer,
    tickTimer,
    resetTimer,
  } = useWorkoutExecutionStore()

  const [currentRepsInput, setCurrentRepsInput] = useState('')
  const [currentWeightInput, setCurrentWeightInput] = useState('')
  const [workoutLogId, setWorkoutLogId] = useState<number | null>(null)
  const [currentExerciseRecord, setCurrentExerciseRecord] =
    useState<ExerciseRecord | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ... (Toda a lógica de useEffects e handleNextPress permanece a mesma) ...
  useEffect(() => {
    const loadWorkout = async () => {
      if (!user) return
      const workoutDetails = await getWorkoutById(workoutId)
      if (workoutDetails) {
        startWorkout(workoutDetails)
        const newLogId = await DatabaseService.startWorkoutLog(
          workoutDetails.firestoreId,
          user.uid,
        )
        setWorkoutLogId(newLogId)
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do treino.')
        navigation.goBack()
      }
    }
    loadWorkout()
    return () => {
      endWorkout()
    }
  }, [workoutId, getWorkoutById, startWorkout, endWorkout, user, navigation])

  useEffect(() => {
    if (timerState === 'running' || timerState === 'resting') {
      intervalRef.current = setInterval(() => {
        tickTimer()
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, tickTimer])

  useEffect(() => {
    if (timerState === 'resting' && timerValue < 1) {
      resetTimer()
      nextSet()
    }
  }, [timerValue, timerState, resetTimer, nextSet])

  const completedLog = setLogs.find(
    (log) =>
      log.exerciseIndex === currentExerciseIndex &&
      log.setIndex === currentSetIndex,
  )
  const isSetCompleted = !!completedLog

  useEffect(() => {
    const fetchRecord = async () => {
      if (currentWorkout && user) {
        const exercise = currentWorkout.exercises[currentExerciseIndex]
        const record = await DatabaseService.getExerciseRecord(
          user.uid,
          exercise.name,
        )
        setCurrentExerciseRecord(record)
      }
    }
    fetchRecord()
  }, [currentExerciseIndex, currentWorkout, user])

  useEffect(() => {
    if (currentWorkout) {
      if (isSetCompleted) {
        setCurrentRepsInput(completedLog.reps?.toString() ?? '')
        setCurrentWeightInput(completedLog.weight?.toString() ?? '')
      } else {
        const exercise = currentWorkout.exercises[currentExerciseIndex]
        setCurrentRepsInput(exercise.reps?.toString() ?? '')
        setCurrentWeightInput(exercise.weight?.toString() ?? '')
      }
    }
  }, [
    currentExerciseIndex,
    currentSetIndex,
    currentWorkout,
    isSetCompleted,
    completedLog,
  ])

  if (isLoading || !currentWorkout || !user) {
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

  const handleNextPress = async () => {
    if (isSetCompleted) {
      if (!isLastSet) nextSet()
      else Alert.alert('Treino já finalizado.')
      return
    }

    if (!workoutLogId) {
      Alert.alert('Erro', 'ID do log de treino não encontrado.')
      return
    }

    const actualReps = parseInt(currentRepsInput, 10)
    const actualWeight = parseFloat(currentWeightInput)
    const logData = {
      reps: !isNaN(actualReps) ? actualReps : null,
      weight: !isNaN(actualWeight) ? actualWeight : null,
    }

    logSet(logData)
    await DatabaseService.logSetData({
      workoutLogId,
      exerciseName: currentExercise.name,
      exerciseDbId: currentExercise.dbId ?? null,
      setIndex: currentSetIndex,
      targetReps: currentExercise.reps ?? null,
      actualReps: logData.reps,
      targetWeight: currentExercise.weight ?? null,
      actualWeight: logData.weight,
      restTime: currentExercise.rest ?? null,
      completedAt: Date.now(),
    })

    if (logData.weight && logData.reps) {
      await DatabaseService.saveOrUpdateExerciseRecord({
        userId: user.uid,
        exerciseName: currentExercise.name,
        actualWeight: logData.weight,
        actualReps: logData.reps,
      })
      // Re-fetch record to show potential new record immediately
      const record = await DatabaseService.getExerciseRecord(
        user.uid,
        currentExercise.name,
      )
      setCurrentExerciseRecord(record)
    }

    if (isLastSet) {
      await DatabaseService.finishWorkoutLog(workoutLogId)
      Alert.alert('Treino Finalizado!', 'Parabéns!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } else {
      startRestTimer()
    }
  }

  const renderTimerControls = () => {
    if (timerState === 'resting') {
      const progress = restTimeTarget > 0 ? timerValue / restTimeTarget : 0
      return (
        <View style={styles.timerContainer}>
          <CircularProgress size={200} strokeWidth={15} progress={progress} />
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerTextLabel}>Descanso</Text>
            <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
          </View>
        </View>
      )
    }

    // Painel de Controle para série ativa
    return (
      <View style={styles.controlPanel}>
        <View style={styles.logInputContainer}>
          <StyledInput
            label="Repetições"
            value={currentRepsInput}
            onChangeText={setCurrentRepsInput}
            keyboardType="numeric"
            containerStyle={styles.input}
            editable={!isSetCompleted}
          />
          <StyledInput
            label="Peso (kg)"
            value={currentWeightInput}
            onChangeText={setCurrentWeightInput}
            keyboardType="numeric"
            containerStyle={styles.input}
            editable={!isSetCompleted}
          />
        </View>
        <View style={styles.timerActionContainer}>
          <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
          {timerState === 'idle' && !isSetCompleted && (
            <StyledButton title="Iniciar Série" onPress={startTimer} />
          )}
          {timerState === 'running' && (
            <StyledButton
              title="Pausar"
              onPress={pauseTimer}
              type="secondary"
            />
          )}
          {timerState === 'paused' && (
            <StyledButton title="Retomar" onPress={resumeTimer} />
          )}
        </View>
      </View>
    )
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.exerciseInfoContainer}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          {currentExerciseRecord && (
            <Text style={styles.recordText}>
              Recorde: {currentExerciseRecord.weight}kg para{' '}
              {currentExerciseRecord.reps} reps
            </Text>
          )}
          <Text style={styles.setText}>
            Série {currentSetIndex + 1} de {currentExercise.sets}
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
            title={
              isLastSet && isSetCompleted
                ? 'Finalizado'
                : isLastSet
                  ? 'Finalizar Treino'
                  : isSetCompleted
                    ? 'Próximo'
                    : 'Finalizar Série'
            }
            onPress={handleNextPress}
            type="primary"
            containerStyle={styles.navButton}
            disabled={timerState === 'resting' || (isLastSet && isSetCompleted)}
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
    marginBottom: theme.spacing.medium, // Reduzido
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
  recordText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.small,
  },
  // Estilos do Painel de Controle
  controlPanel: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginVertical: theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  input: {
    flex: 1,
    marginHorizontal: theme.spacing.small,
  },
  timerActionContainer: {
    marginTop: theme.spacing.medium,
    alignItems: 'center',
  },
  // Estilos do Timer Circular
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.large,
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextLabel: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  // Estilos da Navegação
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
