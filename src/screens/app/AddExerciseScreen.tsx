import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { theme } from '../../theme'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import { useExerciseStore } from '../../state/exerciseStore'
import { useWorkoutCreationStore } from '../../state/workoutCreationStore'
import { Exercise } from '../../services/exerciseDB'

export default function AddExerciseScreen() {
  const navigation = useNavigation()
  const { addExercise: addExerciseToWorkout } = useWorkoutCreationStore()
  const {
    exercises,
    loading,
    error,
    fetchExercises,
    filterExercises,
    filteredExercises,
  } = useExerciseStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])

  useEffect(() => {
    if (!exercises.length) {
      fetchExercises()
    }
  }, [exercises, fetchExercises])

  useEffect(() => {
    filterExercises(searchTerm, 'name')
  }, [searchTerm, filterExercises])

  const toggleExerciseSelection = (exercise: Exercise) => {
    setSelectedExercises((prevSelected) =>
      prevSelected.find((e) => e.id === exercise.id)
        ? prevSelected.filter((e) => e.id !== exercise.id)
        : [...prevSelected, exercise],
    )
  }

  const handleAddSelectedExercises = () => {
    if (selectedExercises.length === 0) {
      Alert.alert(
        'Nenhum exercício selecionado',
        'Por favor, selecione ao menos um exercício.',
      )
      return
    }

    selectedExercises.forEach((exercise) => {
      addExerciseToWorkout({
        name: exercise.name,
        sets: 3, // Default value, user can change later
        reps: 10, // Default value
        rest: 60, // Default value
        dbId: exercise.id,
      })
    })

    navigation.goBack()
  }

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.some((e) => e.id === item.id)
    return (
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
        onPress={() => toggleExerciseSelection(item)}
      >
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetail}>
          {item.bodyPart} - {item.equipment}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <StyledInput
        placeholder="Buscar exercício por nome..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchInput}
      />

      {loading && (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      )}
      {error && (
        <Text style={styles.errorText}>
          Erro ao carregar exercícios: {error}
        </Text>
      )}

      {!loading && !error && (
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <StyledButton
        title={`Adicionar ${selectedExercises.length} Exercícios`}
        onPress={handleAddSelectedExercises}
        disabled={selectedExercises.length === 0}
        style={styles.addButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  searchInput: {
    marginBottom: theme.spacing.medium,
  },
  listContent: {
    paddingBottom: theme.spacing.large,
  },
  exerciseItem: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exerciseItemSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  exerciseName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  exerciseDetail: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.small,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.medium,
  },
  addButton: {
    marginTop: theme.spacing.medium,
  },
})
