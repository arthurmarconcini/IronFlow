import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import { AppNavigationProp, AppRouteProp } from '../../navigation/types'
import { useWorkoutExecutionStore } from '../../state/workoutExecutionStore'
import { useWorkouts } from '../../db/useWorkouts'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import { DatabaseService, ExerciseRecord } from '../../db/DatabaseService'
import { useAuth } from '../../hooks/useAuth'
import CircularProgress from '../../components/CircularProgress'
import { StrengthExercise, CardioExercise } from '../../types/database'

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
    nextExercise,
    previousExercise,
    skipRest,
    logSet,
    timerState,
    timerValue,
    restTimeTarget,
    startTimer,
    pauseTimer,
    resumeTimer,
    startRestTimer,
    tickTimer,
  } = useWorkoutExecutionStore()

  const [currentRepsInput, setCurrentRepsInput] = useState('')
  const [currentWeightInput, setCurrentWeightInput] = useState('')
  const [workoutLogId, setWorkoutLogId] = useState<number | null>(null)
  const [currentExerciseRecord, setCurrentExerciseRecord] =
    useState<ExerciseRecord | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar os detalhes do treino.',
        })
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
      skipRest()
    }
  }, [timerValue, timerState, skipRest])

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
        if (exercise.type === 'strength') {
          const record = await DatabaseService.getExerciseRecord(
            user.uid,
            exercise.name,
          )
          setCurrentExerciseRecord(record)
        } else {
          setCurrentExerciseRecord(null)
        }
      }
    }
    fetchRecord()
  }, [currentExerciseIndex, currentWorkout, user])

  useEffect(() => {
    if (currentWorkout) {
      const exercise = currentWorkout.exercises[
        currentExerciseIndex
      ] as StrengthExercise
      if (exercise.type === 'strength') {
        if (isSetCompleted) {
          setCurrentRepsInput(completedLog.reps?.toString() ?? '')
          setCurrentWeightInput(completedLog.weight?.toString() ?? '')
        } else {
          setCurrentRepsInput(exercise.reps?.toString() ?? '')
          setCurrentWeightInput(exercise.weight?.toString() ?? '')
        }
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
    (currentExercise.type === 'strength'
      ? currentSetIndex === (currentExercise as StrengthExercise).sets - 1
      : true)

  const handleNextPress = async () => {
    if (isSetCompleted) {
      if (!isLastSet) nextSet()
      else
        Toast.show({
          type: 'info',
          text1: 'Treino já finalizado.',
        })
      return
    }

    if (!workoutLogId) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'ID do log de treino não encontrado.',
      })
      return
    }

    if (currentExercise.type === 'strength') {
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
        targetReps: (currentExercise as StrengthExercise).reps ?? null,
        actualReps: logData.reps,
        targetWeight: (currentExercise as StrengthExercise).weight ?? null,
        actualWeight: logData.weight,
        restTime: (currentExercise as StrengthExercise).rest ?? null,
        completedAt: Date.now(),
      })

      if (logData.weight && logData.reps) {
        await DatabaseService.saveOrUpdateExerciseRecord({
          userId: user.uid,
          exerciseName: currentExercise.name,
          actualWeight: logData.weight,
          actualReps: logData.reps,
        })
        const record = await DatabaseService.getExerciseRecord(
          user.uid,
          currentExercise.name,
        )
        setCurrentExerciseRecord(record)
      }
    } else {
      // Lógica para cardio
      logSet({ reps: null, weight: null }) // Log vazio para marcar como completo
    }

    if (isLastSet) {
      await DatabaseService.finishWorkoutLog(workoutLogId)
      Toast.show({
        type: 'success',
        text1: 'Treino Finalizado!',
        text2: 'Parabéns por completar seu treino.',
        visibilityTime: 3000,
        onHide: () => navigation.goBack(),
      })
    } else {
      if (currentExercise.type === 'strength') {
        startRestTimer()
      } else {
        nextSet() // Cardio não tem descanso, vai para o próximo
      }
    }
  }

  const renderStrengthControls = () => (
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
          <StyledButton title="Pausar" onPress={pauseTimer} type="secondary" />
        )}
        {timerState === 'paused' && (
          <StyledButton title="Retomar" onPress={resumeTimer} />
        )}
      </View>
    </View>
  )

  const renderCardioControls = () => {
    const exercise = currentExercise as CardioExercise
    const progress =
      exercise.durationMinutes > 0
        ? timerValue / (exercise.durationMinutes * 60)
        : 0
    return (
      <View style={styles.timerContainer}>
        <View style={styles.circularProgressWrapper}>
          <CircularProgress size={200} strokeWidth={15} progress={progress} />
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerTextLabel}>Duração</Text>
            <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
          </View>
        </View>
        <View style={styles.cardioActions}>
          {timerState === 'idle' && !isSetCompleted && (
            <StyledButton title="Iniciar" onPress={startTimer} />
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

  const renderTimerControls = () => {
    if (timerState === 'resting') {
      const progress = restTimeTarget > 0 ? 1 - timerValue / restTimeTarget : 0
      return (
        <View style={styles.timerContainer}>
          <View style={styles.circularProgressWrapper}>
            <CircularProgress size={200} strokeWidth={15} progress={progress} />
            <View style={styles.timerTextContainer}>
              <Text style={styles.timerTextLabel}>Descanso</Text>
              <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return currentExercise.type === 'strength'
      ? renderStrengthControls()
      : renderCardioControls()
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View>
          <View style={styles.exerciseNavContainer}>
            <TouchableOpacity
              onPress={previousExercise}
              disabled={currentExerciseIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={32}
                color={
                  currentExerciseIndex === 0
                    ? theme.colors.lightGray
                    : theme.colors.primary
                }
              />
            </TouchableOpacity>
            <Text style={styles.exerciseNavText}>
              Exercício {currentExerciseIndex + 1} de{' '}
              {currentWorkout.exercises.length}
            </Text>
            <TouchableOpacity
              onPress={nextExercise}
              disabled={
                currentExerciseIndex === currentWorkout.exercises.length - 1
              }
            >
              <Ionicons
                name="chevron-forward"
                size={32}
                color={
                  currentExerciseIndex === currentWorkout.exercises.length - 1
                    ? theme.colors.lightGray
                    : theme.colors.primary
                }
              />
            </TouchableOpacity>
          </View>

          <View style={styles.exerciseInfoContainer}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            {currentExercise.type === 'strength' && currentExerciseRecord && (
              <Text style={styles.recordText}>
                Recorde: {currentExerciseRecord.weight}kg para{' '}
                {currentExerciseRecord.reps} reps
              </Text>
            )}
            {currentExercise.type === 'strength' && (
              <Text style={styles.setText}>
                Série {currentSetIndex + 1} de{' '}
                {(currentExercise as StrengthExercise).sets}
              </Text>
            )}
          </View>
        </View>

        {renderTimerControls()}

        <View style={styles.navigationContainer}>
          {!isFirstSet && (
            <StyledButton
              title="Anterior"
              onPress={previousSet}
              type="secondary"
              containerStyle={styles.navButton}
            />
          )}
          <StyledButton
            title={
              isLastSet && isSetCompleted
                ? 'Finalizado'
                : isLastSet
                  ? 'Finalizar Treino'
                  : isSetCompleted
                    ? 'Próximo'
                    : 'Finalizar'
            }
            onPress={handleNextPress}
            type="primary"
            containerStyle={[styles.navButton, isFirstSet && styles.fullWidth]}
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
  exerciseNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  exerciseNavText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  exerciseInfoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
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
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.large,
  },
  circularProgressWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  skipButton: {
    marginTop: theme.spacing.medium,
  },
  skipButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  cardioActions: {
    marginTop: theme.spacing.medium,
    width: '60%',
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
  fullWidth: {
    flex: 1,
    marginHorizontal: 0,
  },
})
