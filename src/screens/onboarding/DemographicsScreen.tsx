import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import {
  OnboardingNavigationProp,
  OnboardingStackParamList,
} from '../../navigation/types'
import { RouteProp } from '@react-navigation/native'

type Props = {
  navigation: OnboardingNavigationProp
  route: RouteProp<OnboardingStackParamList, 'Demographics'>
}

const DemographicsScreen = ({ navigation, route }: Props) => {
  const { goal } = route.params
  const [displayName, setDisplayName] = useState('')
  const [dob, setDob] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | 'other' | null>(null)

  // Estados para mensagens de erro
  const [errors, setErrors] = useState({
    displayName: '',
    dob: '',
    sex: '',
  })

  const validateFields = () => {
    const newErrors = { displayName: '', dob: '', sex: '' }
    let isValid = true

    // Validação do Nome
    if (displayName.trim().length < 2) {
      newErrors.displayName = 'O nome deve ter pelo menos 2 caracteres.'
      isValid = false
    }

    // Validação da Data de Nascimento
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
    if (!dobRegex.test(dob)) {
      newErrors.dob = 'Por favor, insira uma data válida (DD/MM/AAAA).'
      isValid = false
    }

    // Validação do Sexo
    if (!sex) {
      newErrors.sex = 'Por favor, selecione uma opção.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateFields()) {
      navigation.navigate('Experience', {
        goal,
        displayName,
        dob,
        sex: sex!, // Sabemos que não é nulo por causa da validação
      })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Conte-nos sobre você</Text>
        <Text style={styles.subtitle}>
          Essas informações nos ajudam a personalizar seu plano.
        </Text>

        <StyledInput
          placeholder="Como podemos te chamar?"
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text)
            if (errors.displayName) setErrors({ ...errors, displayName: '' })
          }}
          containerStyle={{ marginBottom: theme.spacing.small }}
        />
        {errors.displayName ? (
          <Text style={styles.errorText}>{errors.displayName}</Text>
        ) : null}

        <StyledInput
          placeholder="DD/MM/AAAA"
          value={dob}
          onChangeText={(masked) => {
            setDob(masked)
            if (errors.dob) setErrors({ ...errors, dob: '' })
          }}
          mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
          keyboardType="numeric"
          containerStyle={{ marginBottom: theme.spacing.small }}
        />
        {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sex}
            onValueChange={(itemValue) => {
              setSex(itemValue)
              if (errors.sex) setErrors({ ...errors, sex: '' })
            }}
            style={styles.picker}
          >
            <Picker.Item
              label="Selecione seu sexo"
              value={null}
              style={styles.pickerItem}
            />
            <Picker.Item
              label="Masculino"
              value="male"
              style={styles.pickerItem}
            />
            <Picker.Item
              label="Feminino"
              value="female"
              style={styles.pickerItem}
            />
            <Picker.Item
              label="Outro"
              value="other"
              style={styles.pickerItem}
            />
          </Picker>
        </View>
        {errors.sex ? <Text style={styles.errorText}>{errors.sex}</Text> : null}
      </View>
      <View style={styles.footer}>
        <Text style={styles.progressIndicator}>Passo 3 de 5</Text>
        <StyledButton title="Próximo" onPress={handleNext} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.medium,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  pickerContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    height: 50,
    marginTop: theme.spacing.medium,
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    fontSize: theme.fontSizes.medium,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.small,
    marginBottom: theme.spacing.medium,
    marginLeft: theme.spacing.small,
  },
  footer: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
  progressIndicator: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
})
export default DemographicsScreen
