import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { Workout } from '../types/database'

interface WorkoutCardProps {
  workout: Workout
  onPress: () => void
  onPlay: () => void
}

const getIconForMuscleGroup = (muscleGroup: string) => {
  switch (muscleGroup.toLowerCase()) {
    case 'chest':
      return 'analytics-outline'
    case 'back':
      return 'barbell-outline'
    case 'legs':
    case 'upper legs':
    case 'lower legs':
      return 'footsteps-outline'
    case 'shoulders':
      return 'arrow-up-circle-outline'
    case 'arms':
    case 'upper arms':
    case 'lower arms':
      return 'flash-outline'
    case 'cardio':
      return 'heart-outline'
    case 'waist':
      return 'remove-circle-outline'
    default:
      return 'barbell-outline'
  }
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  onPlay,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* Ícone */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={getIconForMuscleGroup(workout.muscleGroup)}
            size={28}
            color={theme.colors.primary}
          />
        </View>

        {/* Informações do Treino */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {workout.name}
          </Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>{workout.muscleGroup}</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.detailText}>
              {workout.exercises.length} exercícios
            </Text>
          </View>
        </View>

        {/* Botão de Play */}
        <TouchableOpacity style={styles.playButton} onPress={onPlay}>
          <Ionicons
            name="play-circle-outline"
            size={32}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.spacing.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.medium,
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small / 2,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
  },
  separator: {
    marginHorizontal: theme.spacing.small,
    color: theme.colors.secondary,
  },
  playButton: {
    padding: theme.spacing.small,
    marginLeft: theme.spacing.medium,
  },
})

export default WorkoutCard
