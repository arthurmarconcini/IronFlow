import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Picker } from '@react-native-picker/picker'
import * as Crypto from 'expo-crypto'
import Toast from 'react-native-toast-message'

import { AppNavigationProp } from '../../navigation/types'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import { useWorkoutCreationStore } from '../../state/workoutCreationStore'
import { PRESET_BODY_PARTS, PRESET_EQUIPMENTS } from '../../utils/presetData'
import { StrengthExercise } from '../../types/database'

export default function AddManualExerciseScreen() {
  const navigation = useNavigation<AppNavigationProp>()
  const { addExercise } = useWorkoutCreationStore()

  const [name, setName] = useState('')
  const [bodyPart, setBodyPart] = useState<string>(PRESET_BODY_PARTS[0])
  const [equipment, setEquipment] = useState<string>(PRESET_EQUIPMENTS[0])

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Nome Inválido',
        text2: 'Por favor, insira o nome do exercício.',
      })
      return
    }

    // Cria um exercício de força com valores padrão
    const newExercise: StrengthExercise = {
      exerciseId: Crypto.randomUUID(),
      name: name.trim(),
      type: 'strength',
      sets: 3,
      reps: '10',
      rest: 60,
      weight: 0,
    }

    addExercise(newExercise)

    Toast.show({
      type: 'success',
      text1: 'Exercício Adicionado!',
      text2: `${newExercise.name} foi adicionado ao seu treino.`,
    })

    // Navega de volta para a tela de criação de treino
    navigation.pop(2)
  }

  return (
    <ScreenContainer>
      <Text style={styles.label}>Nome do Exercício</Text>
      <StyledInput
        placeholder="Ex: Supino Reto"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Grupo Muscular</Text>
      <View style={styles.pickerInputContainer}>
        <Text style={styles.pickerInputText}>{bodyPart}</Text>
        <Picker
          selectedValue={bodyPart}
          onValueChange={(itemValue) => setBodyPart(itemValue)}
          style={styles.picker}
        >
          {PRESET_BODY_PARTS.map((part) => (
            <Picker.Item key={part} label={part} value={part} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Equipamento</Text>
      <View style={styles.pickerInputContainer}>
        <Text style={styles.pickerInputText}>{equipment}</Text>
        <Picker
          selectedValue={equipment}
          onValueChange={(itemValue) => setEquipment(itemValue)}
          style={styles.picker}
        >
          {PRESET_EQUIPMENTS.map((equip) => (
            <Picker.Item key={equip} label={equip} value={equip} />
          ))}
        </Picker>
      </View>

      <StyledButton
        title="Adicionar ao Treino"
        onPress={handleSave}
        containerStyle={styles.saveButton}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    marginTop: theme.spacing.medium,
  },
  pickerInputContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: theme.spacing.medium,
  },
  pickerInputText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  pickerContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
  },
  picker: {
    position: 'absolute',
    width: '120%',
    height: '100%',
    opacity: 0,
  },
  saveButton: {
    marginTop: 'auto',
    marginBottom: theme.spacing.large,
  },
})
