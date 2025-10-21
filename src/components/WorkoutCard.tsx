import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'
import { Workout } from '../db/useDatabase'

interface WorkoutCardProps {
  workout: Workout
  onPress: () => void
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{workout.name}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.spacing.small,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.palette.text,
  },
})

export default WorkoutCard
