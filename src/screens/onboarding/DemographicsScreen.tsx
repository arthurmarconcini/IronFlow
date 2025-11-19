import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ZodError } from 'zod'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import StyledSelect from '../../components/StyledSelect'
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

  const sexOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Feminino', value: 'female' },
    { label: 'Outro', value: 'other' },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Conte-nos sobre você</Text>
            <Text style={styles.subtitle}>
              Essas informações nos ajudam a personalizar seu plano.
            </Text>
          </View>

          <View style={styles.form}>
            <StyledInput
              label="Nome ou Apelido"
              placeholder="Como podemos te chamar?"
              value={formData.displayName}
              onChangeText={(text) => handleInputChange('displayName', text)}
              error={errors.displayName}
            />

            <StyledInput
              label="Data de Nascimento"
              placeholder="DD/MM/AAAA"
              value={formData.dob}
              onChangeText={(masked) => handleInputChange('dob', masked)}
              mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
              keyboardType="numeric"
              error={errors.dob}
            />

            <StyledSelect
              label="Sexo Biológico"
              value={formData.sex}
              options={sexOptions}
              onValueChange={(value) => handleInputChange('sex', value)}
              error={errors.sex}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.progressIndicator}>Passo 2 de 5</Text>
          <StyledButton title="Próximo" onPress={validateAndProceed} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.medium,
    paddingTop: 40,
  },
  header: {
    marginBottom: theme.spacing.large,
    alignItems: 'center',
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
  },
  form: {
    width: '100%',
  },
  footer: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    backgroundColor: theme.colors.background,
  },
  progressIndicator: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
})
export default DemographicsScreen
