import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker'
import { ZodError } from 'zod'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import { OnboardingNavigationProp } from '../../navigation/types'
import { useOnboardingStore } from '../../state/onboardingStore'
import {
  demographicsSchema,
  DemographicsData,
} from '../../types/onboardingSchema'

type Props = {
  navigation: OnboardingNavigationProp
}

const DemographicsScreen = ({ navigation }: Props) => {
  const { displayName, dob, sex, setOnboardingData } = useOnboardingStore()
  const [formData, setFormData] = useState<DemographicsData>({
    displayName: displayName || '',
    dob: dob || '',
    sex: sex || 'male',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof DemographicsData, string>>
  >({})

  const handleInputChange = (
    field: keyof DemographicsData,
    value: string | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateAndProceed = () => {
    try {
      const validatedData = demographicsSchema.parse(formData)
      setOnboardingData(validatedData)
      navigation.navigate('Equipment')
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof DemographicsData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof DemographicsData] = err.message
          }
        })
        setErrors(fieldErrors)
      }
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
          value={formData.displayName}
          onChangeText={(text) => handleInputChange('displayName', text)}
          containerStyle={{ marginBottom: theme.spacing.small }}
        />
        {errors.displayName && (
          <Text style={styles.errorText}>{errors.displayName}</Text>
        )}

        <StyledInput
          placeholder="DD/MM/AAAA"
          value={formData.dob}
          onChangeText={(masked) => handleInputChange('dob', masked)}
          mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
          keyboardType="numeric"
          containerStyle={{ marginBottom: theme.spacing.small }}
        />
        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.sex}
            onValueChange={(itemValue) => handleInputChange('sex', itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Masculino" value="male" />
            <Picker.Item label="Feminino" value="female" />
            <Picker.Item label="Outro" value="other" />
          </Picker>
        </View>
        {errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
      </View>
      <View style={styles.footer}>
        <Text style={styles.progressIndicator}>Passo 2 de 5</Text>
        <StyledButton title="Próximo" onPress={validateAndProceed} />
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
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.small,
    marginTop: -theme.spacing.small,
    marginBottom: theme.spacing.small,
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
