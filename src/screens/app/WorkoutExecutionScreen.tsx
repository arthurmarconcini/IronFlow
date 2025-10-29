import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import { AppRouteProp } from '../../navigation/types'
import { useWorkoutExecutionStore } from '../../state/workoutExecutionStore'
import { useWorkouts } from '../../db/useWorkouts'
import StyledButton from '../../components/StyledButton'

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
  } = useWorkoutExecutionStore()

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

    // Cleanup function to end workout when the screen is left
    return () => {
      endWorkout()
    }
  }, [workoutId, getWorkoutById, startWorkout, endWorkout])

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

        {/* Inputs for reps and weight will go here later */}

        <View style={styles.navigationContainer}>
          <StyledButton
            title="Anterior"
            onPress={previousSet}
            disabled={isFirstSet}
            type="secondary"
            containerStyle={styles.navButton}
          />
          <StyledButton
            title={isLastSet ? 'Finalizar Treino' : 'Próximo'}
            onPress={nextSet} // Finalize logic will be added later
            type="primary"
            containerStyle={styles.navButton}
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
