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
import { Exercise as ApiExercise } from '../../services/exerciseDB'
import { PRESET_BODY_PARTS, PRESET_EQUIPMENTS } from '../../utils/presetData'

export default function AddManualExerciseScreen() {
  const navigation = useNavigation<AppNavigationProp>()

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

    const manualExercise: ApiExercise = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      bodyPart: bodyPart,
      equipment: equipment,
      target: bodyPart,
      gifUrl: '',
      category: 'strength', // Adicionado para satisfazer o tipo ApiExercise
    }

    navigation.navigate('CustomizeExercise', {
      selectedExercises: [manualExercise],
    })
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
      <View style={styles.pickerContainer}>
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
      <View style={styles.pickerContainer}>
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
        title="Salvar e Continuar"
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
  pickerContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
  },
  picker: {
    // Estilos podem variar entre iOS e Android
  },
  saveButton: {
    marginTop: 'auto', // Empurra o botão para o final da tela
    marginBottom: theme.spacing.large,
  },
})
