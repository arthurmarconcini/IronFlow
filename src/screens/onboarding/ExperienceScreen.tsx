import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ZodError } from 'zod'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import StyledSelect from '../../components/StyledSelect'
import { OnboardingNavigationProp } from '../../navigation/types'
import {
  OnboardingState,
  useOnboardingStore,
} from '../../state/onboardingStore'
import { experienceSchema } from '../../types/onboardingSchema'

type Props = {
  navigation: OnboardingNavigationProp
}

const ExperienceScreen = ({ navigation }: Props) => {
  const store = useOnboardingStore()

  const [experienceLevel, setExperienceLevel] = useState<
    OnboardingState['experienceLevel']
  >(store.experienceLevel)
  const [availability, setAvailability] = useState<
    OnboardingState['availability']
  >(store.availability)

  const insets = useSafeAreaInsets()

  const handleNext = () => {
    try {
      const formData = { experienceLevel, availability }
      const validatedData = experienceSchema.parse(formData)
      store.setOnboardingData(validatedData)
      navigation.navigate('Confirmation')
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map((e) => e.message).join('\n')
        Alert.alert('Dados Inválidos', errorMessage)
      }
    }
  }

  const experienceOptions = [
    { label: 'Iniciante (0-6 meses)', value: 'beginner' },
    { label: 'Intermediário (6m - 2a)', value: 'intermediate' },
    { label: 'Avançado (2a+)', value: 'advanced' },
  ]

  const availabilityOptions = [
    { label: '1-2 dias/semana', value: '1-2' },
    { label: '3-4 dias/semana', value: '3-4' },
    { label: '5+ dias/semana', value: '5+' },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Sua Experiência e Disponibilidade</Text>
          <Text style={styles.subtitle}>
            Isso nos ajuda a montar o treino ideal para você.
          </Text>
        </View>

        <View style={styles.form}>
          <StyledSelect
            label="Nível de Experiência"
            placeholder="Selecione seu nível"
            value={experienceLevel || ''}
            options={experienceOptions}
            onValueChange={(value) =>
              setExperienceLevel(value as OnboardingState['experienceLevel'])
            }
          />

          <StyledSelect
            label="Disponibilidade Semanal"
            placeholder="Quantos dias por semana?"
            value={availability || ''}
            options={availabilityOptions}
            onValueChange={(value) =>
              setAvailability(value as OnboardingState['availability'])
            }
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + theme.spacing.medium },
        ]}
      >
        <Text style={styles.progressIndicator}>Passo 4 de 5</Text>
        <StyledButton
          title="Próximo"
          onPress={handleNext}
          disabled={!experienceLevel || !availability}
        />
      </View>
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

export default ExperienceScreen
