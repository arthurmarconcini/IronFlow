import React, { useState, useMemo, useCallback } from 'react'
import {
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { AppNavigationProp } from '../../navigation/types'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import { ExerciseDefinition, Exercise } from '../../types/database'
import { mockExercises } from '../../utils/mockExercises'
import { useWorkoutCreationStore } from '../../state/workoutCreationStore'

const BODY_PART_FILTERS = [
  'Costas',
  'Cardio',
  'Peito',
  'Antebraços',
  'Pernas (inferior)',
  'Pescoço',
  'Ombros',
  'Braços (superior)',
  'Pernas (superior)',
  'Cintura',
]

// --- Componente de Item Otimizado ---
const ExerciseListItem = React.memo(
  ({
    item,
    isSelected,
    onSelect,
    onShowDetails,
  }: {
    item: ExerciseDefinition
    isSelected: boolean
    onSelect: (item: ExerciseDefinition) => void
    onShowDetails: (item: ExerciseDefinition) => void
  }) => {
    return (
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
        onPress={() => onSelect(item)}
      >
        <View style={styles.exerciseInfoContainer}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.exerciseDetail}>
            {item.bodyPart} - {item.equipment}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => onShowDetails(item)}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  },
)

export default function AddExerciseScreen() {
  const navigation = useNavigation<AppNavigationProp>()
  const { addExercise } = useWorkoutCreationStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<
    ExerciseDefinition[]
  >([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const displayedExercises = useMemo(() => {
    let exercises = mockExercises
    if (activeFilter) {
      exercises = exercises.filter(
        (e) => e.bodyPart.toLowerCase() === activeFilter.toLowerCase(),
      )
    }
    if (searchTerm) {
      exercises = exercises.filter((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    return exercises
  }, [searchTerm, activeFilter])

  const handleFilterPress = useCallback((bodyPart: string) => {
    setSearchTerm('')
    setActiveFilter((prev) => (prev === bodyPart ? null : bodyPart))
  }, [])

  const toggleExerciseSelection = useCallback(
    (exercise: ExerciseDefinition) => {
      setSelectedExercises((prev) =>
        prev.find((e) => e.id === exercise.id)
          ? prev.filter((e) => e.id !== exercise.id)
          : [...prev, exercise],
      )
    },
    [],
  )

  const handleShowDetails = useCallback(
    (exercise: ExerciseDefinition) => {
      navigation.navigate('ExerciseDetail', { exercise })
    },
    [navigation],
  )

  const handleAddExercises = () => {
    if (selectedExercises.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Nenhum exercício selecionado',
        text2: 'Por favor, selecione ao menos um exercício.',
      })
      return
    }

    selectedExercises.forEach((exerciseDef) => {
      const newExercise: Exercise = {
        exerciseId: exerciseDef.id,
        name: exerciseDef.name,
        type: 'strength',
        sets: 3,
        reps: '10',
        rest: 60,
        weight: 0,
      }
      addExercise(newExercise)
    })

    Toast.show({
      type: 'success',
      text1: `${selectedExercises.length} exercício(s) adicionado(s)!`,
      text2: 'Você pode customizá-los na tela de treino.',
    })

    setSelectedExercises([])
    navigation.goBack()
  }

  const renderExerciseItem = ({ item }: { item: ExerciseDefinition }) => {
    const isSelected = selectedExercises.some((e) => e.id === item.id)
    return (
      <ExerciseListItem
        item={item}
        isSelected={isSelected}
        onSelect={toggleExerciseSelection}
        onShowDetails={handleShowDetails}
      />
    )
  }

  return (
    <ScreenContainer>
      <StyledInput
        placeholder="Buscar exercício por nome..."
        value={searchTerm}
        onChangeText={(text) => {
          setActiveFilter(null)
          setSearchTerm(text)
        }}
        containerStyle={styles.searchInput}
      />

      <StyledButton
        title="Adicionar Exercício Manualmente"
        onPress={() => navigation.navigate('AddManualExercise')}
        type="secondary"
        containerStyle={styles.manualAddButton}
      />

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {BODY_PART_FILTERS.map((part) => (
            <TouchableOpacity
              key={part}
              style={[
                styles.filterButton,
                activeFilter === part && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress(part)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === part && styles.filterButtonTextActive,
                ]}
              >
                {part.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={displayedExercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum exercício encontrado.</Text>
        }
      />

      <StyledButton
        title={`Adicionar ${selectedExercises.length} Exercícios`}
        onPress={handleAddExercises}
        disabled={selectedExercises.length === 0}
        containerStyle={styles.addButton}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  searchInput: {
    marginBottom: theme.spacing.small,
  },
  manualAddButton: {
    marginBottom: theme.spacing.medium,
  },
  filtersContainer: {
    marginBottom: theme.spacing.medium,
  },
  filterButton: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginRight: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  filterButtonTextActive: {
    color: theme.colors.white,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseItemSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  exerciseInfoContainer: {
    flex: 1,
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
  infoButton: {
    paddingLeft: theme.spacing.medium,
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.large,
  },
  addButton: {
    marginTop: theme.spacing.medium,
  },
})
