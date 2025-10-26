import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AppNavigationProp } from '../../navigation/types'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import { useExerciseStore } from '../../state/exerciseStore'
import { Exercise } from '../../services/exerciseDB'

export default function AddExerciseScreen() {
  const navigation = useNavigation<AppNavigationProp>()
  const { loading, error, fetchExercises, filterExercises, filteredExercises } =
    useExerciseStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

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

  const handleProceedToCustomization = () => {
    if (selectedExercises.length === 0) {
      Alert.alert(
        'Nenhum exercício selecionado',
        'Por favor, selecione ao menos um exercício.',
      )
      return
    }
    navigation.navigate('CustomizeExercise', { selectedExercises })
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
    <ScreenContainer style={styles.container}>
      <StyledInput
        placeholder="Buscar exercício por nome..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        containerStyle={styles.searchInput} // Usar containerStyle para margem
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
        onPress={handleProceedToCustomization}
        disabled={selectedExercises.length === 0}
        containerStyle={styles.addButton} // Usar containerStyle para margem
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {},
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
