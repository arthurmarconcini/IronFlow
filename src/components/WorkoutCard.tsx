import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native'
import { theme } from '../theme'
import { Workout } from '../db/useDatabase'

interface WorkoutCardProps {
  workout: Workout
  onPress: () => void
  onDelete: () => void // Nova propriedade para a função de deletar
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  onDelete,
}) => {
  const handleDeletePress = () => {
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
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{workout.name}</Text>
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
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1, // Garante que o título ocupe o espaço disponível
  },
  deleteButton: {
    padding: theme.spacing.small,
    marginLeft: theme.spacing.medium,
  },
  deleteButtonText: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.danger,
  },
})

export default WorkoutCard
