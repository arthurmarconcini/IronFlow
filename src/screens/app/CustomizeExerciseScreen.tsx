import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import {
  CustomizeExerciseScreenRouteProp,
  AppNavigationProp,
} from '../../navigation/types'
import {
  useWorkoutCreationStore,
  Exercise,
} from '../../state/workoutCreationStore'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'

type FormState = {
  sets: string
  reps: string
  rest: string
  weight: string
  durationMinutes: string
}

export default function CustomizeExerciseScreen() {
  const route = useRoute<CustomizeExerciseScreenRouteProp>()
  const navigation = useNavigation<AppNavigationProp>()
  const { updateExercise } = useWorkoutCreationStore()

  const { exercise, index } = route.params

  const [formState, setFormState] = useState<FormState>(() => {
    if (exercise.type === 'strength') {
      return {
        sets: String(exercise.sets),
        reps: String(exercise.reps),
        rest: String(exercise.rest),
        weight: String(exercise.weight ?? 0),
        durationMinutes: '0',
      }
    }
    if (exercise.type === 'cardio') {
      return {
        sets: '0',
        reps: '0',
        rest: '0',
        weight: '0',
        durationMinutes: String(exercise.durationMinutes),
      }
    }
    return {
      sets: '3',
      reps: '10',
      rest: '60',
      weight: '0',
      durationMinutes: '0',
    }
  })

  const handleUpdateField = (field: keyof FormState, value: string) => {
    const cleanedValue = value.replace(/[^0-9]/g, '')
    setFormState((prev) => ({ ...prev, [field]: cleanedValue }))
  }

  const handleUpdate = () => {
    let updatedExercise: Exercise

    if (exercise.type === 'strength') {
      const sets = parseInt(formState.sets, 10)
      const reps = formState.reps
      const rest = parseInt(formState.rest, 10)
      const weight = parseInt(formState.weight, 10)

      if (!sets || !reps.trim() || isNaN(rest) || isNaN(weight)) {
        Toast.show({
          type: 'error',
          text1: 'Preencha todos os campos de força.',
        })
        return
      }
      if (sets <= 0) {
        Toast.show({ type: 'error', text1: 'Séries devem ser maior que zero.' })
        return
      }

      updatedExercise = {
        ...exercise,
        sets,
        reps,
        rest,
        weight,
      }
    } else if (exercise.type === 'cardio') {
      const durationMinutes = parseInt(formState.durationMinutes, 10)
      if (!durationMinutes || durationMinutes <= 0) {
        Toast.show({ type: 'error', text1: 'Duração deve ser maior que zero.' })
        return
      }
      updatedExercise = {
        ...exercise,
        durationMinutes,
      }
    } else {
      return
    }

    updateExercise(index, updatedExercise)
    Toast.show({ type: 'success', text1: 'Exercício atualizado!' })
    navigation.goBack()
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        {exercise.type === 'strength' ? (
          <View style={styles.inputsContainer}>
            <Text style={styles.label}>Séries</Text>
            <StyledInput
              value={formState.sets}
              onChangeText={(val) => handleUpdateField('sets', val)}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Repetições (ex: 8-12)</Text>
            <StyledInput
              value={formState.reps}
              onChangeText={(val) =>
                setFormState((fs) => ({ ...fs, reps: val }))
              }
            />
            <Text style={styles.label}>Descanso (s)</Text>
            <StyledInput
              value={formState.rest}
              onChangeText={(val) => handleUpdateField('rest', val)}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Peso (kg)</Text>
            <StyledInput
              value={formState.weight}
              onChangeText={(val) => handleUpdateField('weight', val)}
              keyboardType="numeric"
            />
          </View>
        ) : (
          <View style={styles.inputsContainer}>
            <Text style={styles.label}>Duração (min)</Text>
            <StyledInput
              value={formState.durationMinutes}
              onChangeText={(val) => handleUpdateField('durationMinutes', val)}
              keyboardType="numeric"
            />
          </View>
        )}

        <StyledButton title="Atualizar Exercício" onPress={handleUpdate} />
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.medium,
  },
  exerciseName: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    color: theme.colors.text,
  },
  inputsContainer: {
    marginBottom: theme.spacing.large,
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    marginTop: theme.spacing.small,
  },
})
