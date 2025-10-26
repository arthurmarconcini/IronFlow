import React, { useEffect, useCallback } from 'react'
import {
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  View,
} from 'react-native'
import { useWorkouts } from '../../db/useWorkouts'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Exercise,
  useWorkoutCreationStore,
} from '../../state/workoutCreationStore'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import { AppNavigationProp } from '../../navigation/types'
import { useWorkoutCreationStore } from '../../state/workoutCreationStore'

export default function CreateWorkoutScreen() {
  const { createWorkout, isLoading } = useWorkouts()
  const navigation = useNavigation<AppNavigationProp>()
  const insets = useSafeAreaInsets()

  // Pega o estado e as ações do store Zustand
  const {
    workoutName,
    muscleGroup,
    exercises,
    setWorkoutName,
    setMuscleGroup,
    reset,
  } = useWorkoutCreationStore()

  // Limpa o formulário sempre que a tela é montada
  useEffect(() => {
    reset()
  }, [reset])

  const handleSave = useCallback(async () => {
    if (!workoutName.trim() || !muscleGroup.trim() || exercises.length === 0) {
      Alert.alert(
        'Erro',
        'Nome, grupo muscular e pelo menos um exercício são necessários.',
      )
      return
    }

    try {
      await createWorkout(workoutName, muscleGroup, exercises)
      Alert.alert('Sucesso', 'Treino salvo e sincronizado!')
      reset() // Limpa o store após salvar
      navigation.goBack()
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Não foi possível salvar o treino.')
    }
  }, [workoutName, muscleGroup, exercises, createWorkout, navigation, reset])

  const renderExercise = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={styles.exerciseDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailValue}>{item.sets}</Text>
          <Text style={styles.detailLabel}>Séries</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailValue}>{item.reps}</Text>
          <Text style={styles.detailLabel}>Reps</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailValue}>{item.rest ?? 0}</Text>
          <Text style={styles.detailLabel}>Descanso (s)</Text>
        </View>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { paddingBottom: insets.bottom + theme.spacing.medium },
      ]}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Criar Novo Treino</Text>
        <StyledInput
          placeholder="Nome do Treino (Ex: Peito e Tríceps)"
          value={workoutName}
          onChangeText={setWorkoutName} // Usa a ação do store
        />
        <StyledInput
          placeholder="Grupo Muscular (Ex: Peitoral)"
          value={muscleGroup}
          onChangeText={setMuscleGroup} // Usa a ação do store
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.subtitle}>Exercícios</Text>
        <Text style={styles.exerciseCount}>{exercises.length}</Text>
      </View>

      <FlatList
        data={exercises}
        renderItem={renderExercise}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Nenhum exercício adicionado.</Text>
        }
      />

      <View style={styles.footerContainer}>
        <StyledButton
          title="Adicionar Exercício"
          onPress={() => navigation.navigate('AddExercise')}
        />
        <StyledButton
          title="Salvar Treino"
          onPress={handleSave}
          disabled={!workoutName.trim() || exercises.length === 0}
          isLoading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
  },
  formContainer: {
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  subtitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
  },
  exerciseCount: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.small,
  },
  exerciseItem: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Sombra para Android
    elevation: 2,
  },
  exerciseName: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  detailLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  emptyListText: {
    textAlign: 'center',
    color: theme.colors.text,
    marginVertical: theme.spacing.medium,
  },
  footerContainer: {
    marginTop: theme.spacing.medium,
  },
})
