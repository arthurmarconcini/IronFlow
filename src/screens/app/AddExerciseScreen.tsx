import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import debounce from 'lodash.debounce'
import Toast from 'react-native-toast-message'
import { AppNavigationProp } from '../../navigation/types'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import { useExerciseStore } from '../../state/exerciseStore'
import { Exercise } from '../../services/exerciseDB'
import { translateTerm } from '../../utils/translationUtils'

const BODY_PART_FILTERS = [
  'back',
  'cardio',
  'chest',
  'lower arms',
  'lower legs',
  'neck',
  'shoulders',
  'upper arms',
  'upper legs',
  'waist',
]

// --- Componente de Item Otimizado ---
const ExerciseListItem = React.memo(
  ({
    item,
    isSelected,
    onPress,
  }: {
    item: Exercise
    isSelected: boolean
    onPress: (item: Exercise) => void
  }) => {
    return (
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
        onPress={() => onPress(item)}
      >
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetail}>
          {item.bodyPart} - {item.equipment}
        </Text>
      </TouchableOpacity>
    )
  },
)

export default function AddExerciseScreen() {
  const navigation = useNavigation<AppNavigationProp>()
  const {
    exercises,
    loading,
    loadingMore,
    error,
    apiLimitError,
    fetchInitialList,
    searchByName,
    fetchByBodyPart,
    fetchMore,
  } = useExerciseStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialList()
  }, [fetchInitialList])

  const debouncedSearch = useMemo(
    () => debounce((term: string) => searchByName(term), 500),
    [searchByName],
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
    return () => debouncedSearch.cancel()
  }, [searchTerm, debouncedSearch])

  const handleFilterPress = useCallback(
    (bodyPart: string) => {
      setSearchTerm('') // Limpa a busca ao usar filtro
      setActiveFilter(bodyPart)
      fetchByBodyPart(bodyPart)
    },
    [fetchByBodyPart],
  )

  const toggleExerciseSelection = useCallback((exercise: Exercise) => {
    setSelectedExercises((prev) =>
      prev.find((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise],
    )
  }, [])

  const handleProceedToCustomization = () => {
    if (selectedExercises.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Nenhum exercício selecionado',
        text2: 'Por favor, selecione ao menos um exercício.',
      })
      return
    }
    navigation.navigate('CustomizeExercise', { selectedExercises })
  }

  const renderFooter = () => {
    if (!loadingMore) return null
    return (
      <ActivityIndicator
        style={{ marginVertical: 20 }}
        size="large"
        color={theme.colors.primary}
      />
    )
  }

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.some((e) => e.id === item.id)
    return (
      <ExerciseListItem
        item={item}
        isSelected={isSelected}
        onPress={toggleExerciseSelection}
      />
    )
  }

  return (
    <ScreenContainer>
      <StyledInput
        placeholder="Buscar exercício por nome..."
        value={searchTerm}
        onChangeText={(text) => {
          setActiveFilter(null) // Limpa o filtro ao digitar
          setSearchTerm(text)
        }}
        containerStyle={styles.searchInput}
      />

      <StyledButton
        title="Adicionar Exercício Manualmente"
        onPress={() => navigation.navigate('AddManualExercise')}
        type="secondary" // Um estilo diferente para ação secundária
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
                {translateTerm(part, 'bodyPart').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.centered}
        />
      )}

      {/* Mensagem de Erro Específica para Limite da API */}
      {apiLimitError && !loading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            O serviço de busca de exercícios atingiu o limite de requisições.
            Por favor, adicione seu exercício manualmente.
          </Text>
        </View>
      )}

      {/* Mensagem de Erro Genérica (offline, etc.) */}
      {error && !apiLimitError && !loading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && !apiLimitError && (
        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (!loadingMore) {
              fetchMore()
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum exercício encontrado.</Text>
          }
        />
      )}

      <StyledButton
        title={`Adicionar ${selectedExercises.length} Exercícios`}
        onPress={handleProceedToCustomization}
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
    color: theme.colors.white, // Texto branco no botão ativo
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
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
