import { useState } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import {
  CustomizeExerciseScreenRouteProp,
  AppNavigationProp,
} from '../../navigation/types'
import {
  useWorkoutCreationStore,
  StrengthExercise,
  CardioExercise,
} from '../../state/workoutCreationStore'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'

// Interface para gerenciar o estado de customização de cada exercício
// Esta interface agora reflete a união discriminada de Exercise
type CustomExerciseState =
  | (Omit<StrengthExercise, 'sets' | 'reps' | 'rest' | 'weight'> & {
      sets: string
      reps: string
      rest: string
      weight: string
    })
  | ((Omit<CardioExercise, 'durationMinutes'> & { durationMinutes: string }) & {
      dbId: string
    })

export default function CustomizeExerciseScreen() {
  const route = useRoute<CustomizeExerciseScreenRouteProp>()
  const navigation = useNavigation<AppNavigationProp>()
  const { addExercise } = useWorkoutCreationStore()

  const { selectedExercises } = route.params

  // Inicializa o estado local com os exercícios selecionados e valores padrão
  const [customExercises, setCustomExercises] = useState<CustomExerciseState[]>(
    selectedExercises.map((apiEx) => {
      const isCardio = apiEx.category.toLowerCase() === 'cardio'

      if (isCardio) {
        return {
          type: 'cardio',
          name: apiEx.name,
          dbId: apiEx.id,
          durationMinutes: '30', // Valor padrão para cardio
        } as CustomExerciseState
      } else {
        return {
          type: 'strength',
          name: apiEx.name,
          dbId: apiEx.id,
          sets: '3', // Valor padrão para força
          reps: '10', // Valor padrão para força
          rest: '60', // Valor padrão para força
          weight: '0', // Valor padrão para peso
        } as CustomExerciseState
      }
    }),
  )

  // Função para atualizar o valor de um campo (séries, reps, descanso, duração) para um exercício específico
  const handleUpdateField = (
    exerciseId: string,
    field: 'sets' | 'reps' | 'rest' | 'durationMinutes' | 'weight',
    value: string,
  ) => {
    setCustomExercises((prev) =>
      prev.map((ex) => {
        if (ex.dbId === exerciseId) {
          // Garante que o valor seja numérico para campos numéricos
          const cleanedValue = value.replace(/[^0-9]/g, '')
          return { ...ex, [field]: cleanedValue }
        }
        return ex
      }),
    )
  }

  const handleConfirmAndAdd = () => {
    // Validação
    for (const ex of customExercises) {
      if (ex.type === 'strength') {
        const strengthEx = ex as Omit<
          StrengthExercise,
          'sets' | 'reps' | 'rest' | 'weight'
        > & {
          sets: string
          reps: string
          rest: string
          weight: string
        }
        if (
          !strengthEx.sets.trim() ||
          !strengthEx.reps.trim() ||
          !strengthEx.rest.trim() ||
          !strengthEx.weight.trim()
        ) {
          Toast.show({
            type: 'error',
            text1: 'Campos Incompletos',
            text2: `Preencha todos os campos para o exercício "${strengthEx.name}".`,
          })
          return
        }
        if (
          parseInt(strengthEx.sets, 10) <= 0 ||
          parseInt(strengthEx.reps, 10) <= 0 ||
          parseInt(strengthEx.rest, 10) < 0 ||
          parseInt(strengthEx.weight, 10) < 0
        ) {
          Toast.show({
            type: 'error',
            text1: 'Valores Inválidos',
            text2: `Séries e repetições devem ser maiores que zero, e peso/descanso não negativos.`,
          })
          return
        }
      } else if (ex.type === 'cardio') {
        const cardioEx = ex as Omit<CardioExercise, 'durationMinutes'> & {
          durationMinutes: string
        }
        if (!cardioEx.durationMinutes.trim()) {
          Toast.show({
            type: 'error',
            text1: 'Campos Incompletos',
            text2: `Preencha a duração para o exercício "${cardioEx.name}".`,
          })
          return
        }
        if (parseInt(cardioEx.durationMinutes, 10) <= 0) {
          Toast.show({
            type: 'error',
            text1: 'Valores Inválidos',
            text2: `A duração deve ser maior que zero.`,
          })
          return
        }
      }
    }

    // Adiciona os exercícios customizados ao store
    customExercises.forEach((ex) => {
      if (ex.type === 'strength') {
        addExercise({
          type: 'strength',
          name: ex.name,
          sets: parseInt(ex.sets, 10),
          reps: parseInt(ex.reps, 10),
          rest: parseInt(ex.rest, 10),
          weight: parseInt(ex.weight, 10),
          dbId: ex.dbId,
        })
      } else if (ex.type === 'cardio') {
        addExercise({
          type: 'cardio',
          name: ex.name,
          durationMinutes: parseInt(ex.durationMinutes, 10),
          dbId: ex.dbId,
        })
      }
    })

    // Navega de volta para a tela de criação de treino
    navigation.pop(2)
  }

  const renderItem = ({ item }: { item: CustomExerciseState }) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      {item.type === 'strength' ? (
        <View style={styles.inputsRow}>
          <StyledInput
            label="Séries"
            containerStyle={styles.inputContainer}
            value={(item as CustomExerciseState & { sets: string }).sets}
            onChangeText={(val) => handleUpdateField(item.dbId!, 'sets', val)}
            keyboardType="numeric"
            textAlign="center"
          />
          <StyledInput
            label="Reps"
            containerStyle={styles.inputContainer}
            value={(item as CustomExerciseState & { reps: string }).reps}
            onChangeText={(val) => handleUpdateField(item.dbId!, 'reps', val)}
            keyboardType="numeric"
            textAlign="center"
          />
          <StyledInput
            label="Descanso (s)"
            containerStyle={styles.inputContainer}
            value={(item as CustomExerciseState & { rest: string }).rest}
            onChangeText={(val) => handleUpdateField(item.dbId!, 'rest', val)}
            keyboardType="numeric"
            textAlign="center"
          />
          <StyledInput
            label="Peso (kg)"
            containerStyle={styles.inputContainer}
            value={(item as CustomExerciseState & { weight: string }).weight}
            onChangeText={(val) => handleUpdateField(item.dbId!, 'weight', val)}
            keyboardType="numeric"
            textAlign="center"
          />
        </View>
      ) : (
        <View style={styles.inputsRow}>
          <StyledInput
            label="Duração (min)"
            containerStyle={styles.fullWidthInputContainer}
            value={
              (item as CustomExerciseState & { durationMinutes: string })
                .durationMinutes
            }
            onChangeText={(val) =>
              handleUpdateField(item.dbId!, 'durationMinutes', val)
            }
            keyboardType="numeric"
            textAlign="center"
          />
        </View>
      )}
    </View>
  )

  return (
    <ScreenContainer style={styles.container}>
      <FlatList
        data={customExercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.dbId!}
        contentContainerStyle={styles.listContent}
      />
      <StyledButton
        title="Confirmar e Adicionar ao Treino"
        onPress={handleConfirmAndAdd}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    // O ScreenContainer agora gerencia o padding principal.
    // Estilos adicionais específicos da tela podem ser adicionados aqui.
  },
  listContent: {
    paddingBottom: theme.spacing.large,
  },
  exerciseContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  exerciseName: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -theme.spacing.small / 2, // Compensa a margem dos inputs
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.small / 2,
  },
  fullWidthInputContainer: {
    flex: 1,
  },
})
