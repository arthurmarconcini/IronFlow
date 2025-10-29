import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import { AppRouteProp } from '../../navigation/types'

export default function WorkoutExecutionScreen() {
  const route = useRoute<AppRouteProp<'WorkoutExecution'>>()
  const { workoutId } = route.params

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Workout Execution Screen</Text>
        <Text style={styles.text}>Workout ID: {workoutId}</Text>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  text: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
})
