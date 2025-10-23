import React, { useState } from 'react'
import {
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useWorkouts } from '../../db/useWorkouts'
import { useNavigation } from '@react-navigation/native'
import { Exercise } from '../../db/useDatabase'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'

export default function CreateWorkoutScreen() {
  const { createWorkout } = useWorkouts()
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('') // Novo estado
  const [exercisesInput, setExercisesInput] = useState('')

  const handleSave = async () => {
    if (!name.trim() || !muscleGroup.trim() || !exercisesInput.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos para continuar.')
      return
    }

    const exercises: Exercise[] = exercisesInput
      .split(',')
      .map((ex) => ex.trim())
      .filter((ex) => ex)
      .map((exerciseName) => ({
        name: exerciseName,
        sets: 3,
        reps: 10,
      }))

    if (exercises.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício válido.')
      return
    }

    try {
      await createWorkout(name, muscleGroup, exercises) // Envia o novo campo
      Alert.alert('Sucesso', 'Treino salvo e sincronizado!')
      navigation.goBack()
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Não foi possível salvar o treino.')
    }
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
        <Text style={styles.title}>Criar Novo Treino</Text>

        <StyledInput
          placeholder="Nome do Treino (Ex: Peito e Tríceps)"
          value={name}
          onChangeText={setName}
        />

        <StyledInput
          placeholder="Grupo Muscular (Ex: Peitoral)"
          value={muscleGroup}
          onChangeText={setMuscleGroup}
        />

        <Text style={styles.label}>Exercícios (separados por vírgula)</Text>
        <StyledInput
          placeholder="Ex: Supino Reto, Crucifixo, Flexão"
          value={exercisesInput}
          onChangeText={setExercisesInput}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <StyledButton title="Salvar Treino" onPress={handleSave} />
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
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    marginLeft: theme.spacing.small,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
})
