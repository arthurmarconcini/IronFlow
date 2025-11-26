import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { Workout, ScheduledWorkout } from '../types/database'

interface WorkoutCardProps {
  workout: Workout | ScheduledWorkout
  onPress: () => void
  onPlay: () => void
  isCompleted?: boolean
  isActive?: boolean
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
  isCompleted,
  isActive,
}) => {
  const workoutData = 'scheduleId' in workout ? workout : workout

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompleted && styles.completedCard,
        isActive && styles.activeCard,
      ]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        {/* Ícone */}
        <View
          style={[styles.iconContainer, isActive && styles.activeIconContainer]}
        >
          <Ionicons
            name={getIconForMuscleGroup(workoutData.muscleGroup)}
            size={28}
            color={isActive ? theme.colors.white : theme.colors.primary}
          />
        </View>

        {/* Informações do Treino */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {workoutData.name}
            </Text>
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Em andamento</Text>
              </View>
            )}
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>{workoutData.muscleGroup}</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.detailText}>
              {workoutData.exercises.length} exercícios
            </Text>
          </View>
        </View>

        {/* Botão de Play ou Ícone de Concluído */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlay}
          disabled={isCompleted}
        >
          <Ionicons
            name={
              isCompleted
                ? 'checkmark-circle'
                : isActive
                  ? 'arrow-forward-circle'
                  : 'play-circle-outline'
            }
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  completedCard: {
    opacity: 0.6,
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
  activeIconContainer: {
    backgroundColor: theme.colors.primary,
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small / 2,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
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
