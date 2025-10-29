import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import {
  CustomizeExerciseScreenRouteProp,
  AppNavigationProp,
} from '../../navigation/types'
import { useWorkoutCreationStore } from '../../state/workoutCreationStore'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import { Exercise as ApiExercise } from '../../services/exerciseDB'

// Interface para gerenciar o estado de customização de cada exercício
interface CustomExerciseState extends ApiExercise {
  sets: string
  reps: string
  rest: string
}

export default function CustomizeExerciseScreen() {
  const route = useRoute<CustomizeExerciseScreenRouteProp>()
  const navigation = useNavigation<AppNavigationProp>()
  const { addExercise } = useWorkoutCreationStore()

  const { selectedExercises } = route.params

  // Inicializa o estado local com os exercícios selecionados e valores padrão
  const [customExercises, setCustomExercises] = useState<CustomExerciseState[]>(
    selectedExercises.map((ex) => ({
      ...ex,
      sets: '3', // Valor padrão
      reps: '10', // Valor padrão
      rest: '60', // Valor padrão
    })),
  )

  // Função para atualizar o valor de um campo (séries, reps, descanso) para um exercício específico
  const handleUpdateField = (
    exerciseId: string,
    field: 'sets' | 'reps' | 'rest',
    value: string,
  ) => {
    setCustomExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, [field]: value.replace(/[^0-9]/g, '') }
          : ex,
      ),
    )
  }

  const handleConfirmAndAdd = () => {
    // Validação
    for (const ex of customExercises) {
      if (!ex.sets.trim() || !ex.reps.trim() || !ex.rest.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Campos Incompletos',
          text2: `Preencha todos os campos para o exercício "${ex.name}".`,
        })
        return
      }
      if (
        parseInt(ex.sets, 10) <= 0 ||
        parseInt(ex.reps, 10) <= 0 ||
        parseInt(ex.rest, 10) < 0
      ) {
        Toast.show({
          type: 'error',
          text1: 'Valores Inválidos',
          text2: `Séries e repetições devem ser maiores que zero.`,
        })
        return
      }
    }

    // Adiciona os exercícios customizados ao store
    customExercises.forEach((ex) => {
      addExercise({
        name: ex.name,
        sets: parseInt(ex.sets, 10),
        reps: parseInt(ex.reps, 10),
        rest: parseInt(ex.rest, 10),
        dbId: ex.id,
      })
    })

    // Navega de volta para a tela de criação de treino
    navigation.pop(2)
  }

  const renderItem = ({ item }: { item: CustomExerciseState }) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={styles.inputsRow}>
        <StyledInput
          label="Séries"
          containerStyle={styles.inputContainer}
          value={item.sets}
          onChangeText={(val) => handleUpdateField(item.id, 'sets', val)}
          keyboardType="numeric"
          textAlign="center"
        />
        <StyledInput
          label="Reps"
          containerStyle={styles.inputContainer}
          value={item.reps}
          onChangeText={(val) => handleUpdateField(item.id, 'reps', val)}
          keyboardType="numeric"
          textAlign="center"
        />
        <StyledInput
          label="Descanso (s)"
          containerStyle={styles.inputContainer}
          value={item.rest}
          onChangeText={(val) => handleUpdateField(item.id, 'rest', val)}
          keyboardType="numeric"
          textAlign="center"
        />
      </View>
    </View>
  )

  return (
    <ScreenContainer style={styles.container}>
      <FlatList
        data={customExercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
})
