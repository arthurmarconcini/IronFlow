import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native'
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
  const [weight, setWeight] = useState((targetWeight ?? '').toString())
  const [reps, setReps] = useState(targetReps.toString())
  const [rir, setRir] = useState('')
  const [shakeWeight, setShakeWeight] = useState(0)
  const [shakeReps, setShakeReps] = useState(0)
  const [shakeRir, setShakeRir] = useState(0)

  const weightRef = useRef<TextInput>(null)
  const repsRef = useRef<TextInput>(null)
  const rirRef = useRef<TextInput>(null)

  useEffect(() => {
    if (isActive && !isCompleted) {
      weightRef.current?.focus()
    }
  }, [isActive, isCompleted])

  const handleComplete = () => {
    const weightValue = parseFloat(weight)
    const repsValue = parseInt(reps, 10)
    const rirValue = parseInt(rir, 10)

    if (isNaN(weightValue) || weight.trim() === '') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setShakeWeight((s) => s + 1)
      return
    }

    if (isNaN(repsValue) || reps.trim() === '') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setShakeReps((s) => s + 1)
      return
    }

    if (rir.trim() !== '' && (isNaN(rirValue) || rirValue < 0)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setShakeRir((s) => s + 1)
      return
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onComplete({
      weightKg: weightValue,
      reps: repsValue,
      rir: isNaN(rirValue) ? undefined : rirValue,
    })
  }

  return (
    <View>
      {isActive && targetWeight ? (
        <View style={styles.targetContainer}>
          <Text style={styles.targetText}>
            Meta: {targetWeight} kg x {targetReps} reps
          </Text>
        </View>
      ) : null}
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
            ref={weightRef}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Peso"
            style={styles.input}
            containerStyle={styles.inputWrapper}
            editable={!isCompleted && isActive}
            shake={shakeWeight}
            onSubmitEditing={() => repsRef.current?.focus()}
            returnKeyType="next"
          />
        </View>
        <View style={styles.inputContainer}>
          <StyledInput
            ref={repsRef}
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            placeholder="Reps"
            style={styles.input}
            containerStyle={styles.inputWrapper}
            editable={!isCompleted && isActive}
            shake={shakeReps}
            onSubmitEditing={() => rirRef.current?.focus()}
            returnKeyType="next"
          />
        </View>
        <View style={styles.inputContainer}>
          <StyledInput
            ref={rirRef}
            value={rir}
            onChangeText={setRir}
            keyboardType="numeric"
            placeholder="RIR"
            style={styles.input}
            containerStyle={styles.inputWrapper}
            editable={!isCompleted && isActive}
            shake={shakeRir}
            onSubmitEditing={handleComplete}
            returnKeyType="done"
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
  targetContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xsmall,
  },
  targetText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
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
    width: '22%', // Ajustado para acomodar o novo campo
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
