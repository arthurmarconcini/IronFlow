import React, { useState } from 'react'
import {
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import { useWorkoutCreationStore } from '../../state/workoutCreationStore'

export default function AddExerciseScreen() {
  const navigation = useNavigation()
  const { addExercise } = useWorkoutCreationStore()

  const [name, setName] = useState('')
  const [sets, setSets] = useState('')
  const [repetitions, setRepetitions] = useState('')
  const [rest, setRest] = useState('')

  const handleAddExercise = () => {
    if (!name.trim() || !sets.trim() || !repetitions.trim() || !rest.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.')
      return
    }

    const setsNum = parseInt(sets, 10)
    const repsNum = parseInt(repetitions, 10)
    const restNum = parseInt(rest, 10)

    if (
      isNaN(setsNum) ||
      isNaN(repsNum) ||
      isNaN(restNum) ||
      setsNum <= 0 ||
      repsNum <= 0 ||
      restNum < 0
    ) {
      Alert.alert(
        'Erro',
        'Séries e repetições devem ser números positivos. Descanso não pode ser negativo.',
      )
      return
    }

    addExercise({
      name: name.trim(),
      sets: setsNum,
      reps: repsNum,
      rest: restNum,
    })

    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Adicionar Exercício</Text>

        <StyledInput
          placeholder="Nome do Exercício (Ex: Supino Reto)"
          value={name}
          onChangeText={setName}
        />

        <StyledInput
          placeholder="Número de Séries"
          value={sets}
          onChangeText={setSets}
          keyboardType="numeric"
        />

        <StyledInput
          placeholder="Repetições (Ex: 10)"
          value={repetitions}
          onChangeText={setRepetitions}
          keyboardType="numeric"
        />

        <StyledInput
          placeholder="Descanso (segundos)"
          value={rest}
          onChangeText={setRest}
          keyboardType="numeric"
        />

        <StyledButton
          title="Adicionar Exercício ao Treino"
          onPress={handleAddExercise}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.medium,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
})
