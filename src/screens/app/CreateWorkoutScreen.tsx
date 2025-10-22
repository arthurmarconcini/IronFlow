import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import { useWorkouts } from '../../db/useWorkouts' // Alterado para o novo hook
import { useNavigation } from '@react-navigation/native'
import { Exercise } from '../../db/useDatabase' // Mantém a interface

export default function CreateWorkoutScreen() {
  const { createWorkout } = useWorkouts() // Alterado para o novo hook
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [exercisesInput, setExercisesInput] = useState('')

  const handleSave = async () => {
    if (!name.trim() || !exercisesInput.trim()) {
      Alert.alert('Erro', 'Preencha o nome do treino e os exercícios.')
      return
    }

    // Transforma a string de exercícios (separada por vírgula) em um array de objetos Exercise
    const exercises: Exercise[] = exercisesInput
      .split(',')
      .map((ex) => ex.trim())
      .filter((ex) => ex)
      .map((exerciseName) => ({
        name: exerciseName,
        sets: 3, // Valor padrão para séries
        reps: 10, // Valor padrão para repetições
      }))

    if (exercises.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício válido.')
      return
    }

    try {
      await createWorkout(name, exercises) // Alterado para a nova função
      Alert.alert('Sucesso', 'Treino salvo e sincronizado!')
      navigation.goBack()
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Não foi possível salvar o treino.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Treino</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Treino"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Exercícios (separados por vírgula)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Supino Reto, Agachamento, Rosca Direta"
        value={exercisesInput}
        onChangeText={setExercisesInput}
        multiline
      />

      <Button title="Salvar Treino" onPress={handleSave} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
})
