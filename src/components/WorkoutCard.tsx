import React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  GestureResponderEvent,
} from 'react-native'
import { theme } from '../theme'
import { Workout } from '../db/useDatabase'

interface WorkoutCardProps {
  workout: Workout
  onPress: () => void
  onDelete: () => void
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  onDelete,
}) => {
  const handleDeletePress = (e: GestureResponderEvent) => {
    e.stopPropagation() // Impede que o evento de clique se propague para o card principal
    Alert.alert(
      'Excluir Treino',
      `Tem certeza que deseja excluir o treino "${workout.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: onDelete },
      ],
    )
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* Ícone */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💪</Text>
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

        {/* Botão de Excluir */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
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
  deleteButton: {
    padding: theme.spacing.small,
    marginLeft: theme.spacing.medium,
  },
  deleteButtonText: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.error,
  },
})

export default WorkoutCard
