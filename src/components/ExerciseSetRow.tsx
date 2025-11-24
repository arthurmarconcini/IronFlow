import React, { useState, useRef, useEffect, memo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { theme } from '../theme'
import StyledInput from './StyledInput'
import RestTimerBar from './RestTimerBar'
import { SetData } from '../state/workoutExecutionStore'

type ExerciseSetRowProps = {
  setNumber: number
  targetReps: string | number
  targetWeight?: number
  previousData?: { weight: number; reps: number } // New prop
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
  previousData,
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const weightRef = useRef<TextInput>(null)
  const repsRef = useRef<TextInput>(null)
  const rirRef = useRef<TextInput>(null)

  // Only auto-focus if active and NOT completed to avoid annoyance when reviewing
  useEffect(() => {
    if (isActive && !isCompleted) {
      // Small timeout to allow render to settle and keyboard to not jump weirdly
      const timer = setTimeout(() => {
        weightRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isActive, isCompleted])

  const handleComplete = async () => {
    if (isSubmitting) return

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

    setIsSubmitting(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // Simulate async/debounce to prevent double taps
    onComplete({
      weightKg: weightValue,
      reps: repsValue,
      rir: isNaN(rirValue) ? undefined : rirValue,
    })

    // Reset submitting state after a short delay or when props change (handled by parent logic usually, but safety here)
    setTimeout(() => setIsSubmitting(false), 500)
  }

  // Allow editing if it's the active set OR if it's already completed (to correct mistakes)
  // We disable editing only if it's a FUTURE set (not active and not completed)
  const isEditable = isActive || isCompleted

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
        <View style={styles.setInfoContainer}>
          <Text style={styles.setNumber}>{setNumber}</Text>
          {previousData && (
            <Text style={styles.previousDataText}>
              Ant: {previousData.weight}kg x {previousData.reps}
            </Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <StyledInput
            ref={weightRef}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Peso"
            style={styles.input}
            containerStyle={styles.inputWrapper}
            editable={isEditable}
            shake={shakeWeight}
            onSubmitEditing={() => repsRef.current?.focus()}
            returnKeyType="next"
            selectTextOnFocus // UX Improvement
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
            editable={isEditable}
            shake={shakeReps}
            onSubmitEditing={() => rirRef.current?.focus()}
            returnKeyType="next"
            selectTextOnFocus
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
            editable={isEditable}
            shake={shakeRir}
            onSubmitEditing={handleComplete}
            returnKeyType="done"
            selectTextOnFocus
          />
        </View>
        <TouchableOpacity
          onPress={handleComplete}
          disabled={!isEditable || isSubmitting}
          style={styles.checkButton}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
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
          )}
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
    borderColor: theme.colors.success, // Visual cue for completion
  },
  setInfoContainer: {
    width: '18%', // Increased width to hold the text
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  previousDataText: {
    fontSize: 10,
    color: theme.colors.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  inputContainer: {
    width: '20%', // Adjusted width
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

export default memo(ExerciseSetRow)
