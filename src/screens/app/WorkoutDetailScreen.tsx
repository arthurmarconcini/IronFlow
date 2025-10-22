import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { theme } from '../../theme'

export default function WorkoutDetailScreen() {
  const route = useRoute()
  const { workoutId } = route.params as { workoutId: number }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Detail Screen</Text>
      <Text style={styles.text}>Workout ID: {workoutId}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
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
