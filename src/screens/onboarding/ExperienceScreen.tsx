import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker'
import { ZodError } from 'zod'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { OnboardingNavigationProp } from '../../navigation/types'
import {
  OnboardingState,
  useOnboardingStore,
} from '../../state/onboardingStore'
import { experienceSchema } from '../../types/onboardingSchema'
import { experienceMap, availabilityMap } from '../../utils/translationUtils'

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Sua Experiência e Disponibilidade</Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a montar o treino ideal para você.
        </Text>

        <View style={styles.pickerInputContainer}>
          <Text
            style={[
              styles.pickerInputText,
              !experienceLevel && styles.placeholderText,
            ]}
          >
            {experienceLevel
              ? experienceMap[experienceLevel]
              : 'Nível de Experiência'}
          </Text>
          <Picker
            selectedValue={experienceLevel}
            onValueChange={(itemValue) =>
              setExperienceLevel(
                itemValue as OnboardingState['experienceLevel'],
              )
            }
            style={styles.picker}
          >
            <Picker.Item label="Nível de Experiência" value={null} />
            <Picker.Item label="Iniciante (0-6 meses)" value="beginner" />
            <Picker.Item label="Intermediário (6m - 2a)" value="intermediate" />
            <Picker.Item label="Avançado (2a+)" value="advanced" />
          </Picker>
        </View>

        <View style={styles.pickerInputContainer}>
          <Text
            style={[
              styles.pickerInputText,
              !availability && styles.placeholderText,
            ]}
          >
            {availability
              ? availabilityMap[availability]
              : 'Disponibilidade Semanal'}
          </Text>
          <Picker
            selectedValue={availability}
            onValueChange={(itemValue) =>
              setAvailability(itemValue as OnboardingState['availability'])
            }
            style={styles.picker}
          >
            <Picker.Item label="Disponibilidade Semanal" value={null} />
            <Picker.Item label="1-2 dias/semana" value="1-2" />
            <Picker.Item label="3-4 dias/semana" value="3-4" />
            <Picker.Item label="5+ dias/semana" value="5+" />
          </Picker>
        </View>
      </View>
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
  pickerInputContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    height: 50,
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
  },
  pickerInputText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.secondary,
  },
  pickerContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    height: 50,
    marginBottom: theme.spacing.medium,
  },
  picker: {
    position: 'absolute',
    width: '120%',
    height: '100%',
    opacity: 0,
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

export default ExperienceScreen
