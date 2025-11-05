import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { theme } from '../theme'
import StyledInput from './StyledInput'
import RestTimerBar from './RestTimerBar'
import { SetData } from '../state/workoutExecutionStore'

type ExerciseSetRowProps = {
  setNumber: number
  targetReps: string | number
  targetWeight?: number
  isCompleted: boolean
  isActive: boolean
  isResting: boolean
  restDuration: number
  onComplete: (setData: SetData) => void
  onTimerFinish: () => void
}

const ExerciseSetRow = ({
  setNumber,
  targetReps,
  targetWeight,
  isCompleted,
  isActive,
  isResting,
  restDuration,
  onComplete,
  onTimerFinish,
}: ExerciseSetRowProps) => {
  const [weight, setWeight] = useState(targetWeight?.toString() || '')
  const [reps, setReps] = useState(targetReps.toString())
  const [shakeWeight, setShakeWeight] = useState(0)
  const [shakeReps, setShakeReps] = useState(0)

  const handleComplete = () => {
    const weightValue = parseFloat(weight)
    const repsValue = parseInt(reps, 10)

    if (isNaN(weightValue) || weight.trim() === '') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setShakeWeight((s) => s + 1) // Aciona o shake do input de peso
      return
    }

    if (isNaN(repsValue) || reps.trim() === '') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setShakeReps((s) => s + 1) // Aciona o shake do input de reps
      return
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onComplete({ weightKg: weightValue, reps: repsValue })
  }

  return (
    <View>
      <View
        style={[
          styles.container,
          isCompleted && styles.completedContainer,
          isActive && styles.activeContainer,
        ]}
      >
        <Text style={styles.setNumber}>{setNumber}</Text>
        <View style={styles.inputContainer}>
          <StyledInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Peso"
            style={styles.input}
            containerStyle={styles.inputWrapper}
            editable={!isCompleted && isActive}
            shake={shakeWeight}
          />
        </View>
        <View style={styles.inputContainer}>
          <StyledInput
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            placeholder="Reps"
            style={styles.input}
            containerStyle={styles.inputWrapper}
            editable={!isCompleted && isActive}
            shake={shakeReps}
          />
        </View>
        <TouchableOpacity
          onPress={handleComplete}
          disabled={isCompleted || !isActive}
          style={styles.checkButton}
        >
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
            size={32}
            color={
              isCompleted
                ? theme.colors.primary
                : isActive
                  ? theme.colors.primary
                  : theme.colors.lightGray
            }
          />
        </TouchableOpacity>
      </View>
      <RestTimerBar
        duration={restDuration}
        isActive={isResting}
        onFinish={onTimerFinish}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.small,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    marginBottom: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeContainer: {
    borderColor: theme.colors.primary,
  },
  completedContainer: {
    backgroundColor: '#e9f5e9',
  },
  setNumber: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    width: '10%',
  },
  inputContainer: {
    width: '30%',
  },
  inputWrapper: {
    marginVertical: 0,
  },
  input: {
    textAlign: 'center',
    paddingVertical: theme.spacing.small,
  },
  checkButton: {
    padding: theme.spacing.small,
  },
})

export default ExerciseSetRow