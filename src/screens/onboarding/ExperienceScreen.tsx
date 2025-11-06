import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker'
import { ZodError } from 'zod'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { OnboardingNavigationProp } from '../../navigation/types'
import { useOnboardingStore } from '../../state/onboardingStore'
import { experienceSchema, ExperienceData } from '../../types/onboardingSchema'

type Props = {
  navigation: OnboardingNavigationProp
}

const ExperienceScreen = ({ navigation }: Props) => {
  const { experienceLevel, availability, setOnboardingData } =
    useOnboardingStore()

  const handleValueChange = (
    field: keyof ExperienceData,
    value: string | null,
  ) => {
    setOnboardingData({ [field]: value })
  }

  const handleNext = () => {
    try {
      const formData = { experienceLevel, availability }
      experienceSchema.parse(formData)
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

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={experienceLevel}
            onValueChange={(itemValue) =>
              handleValueChange('experienceLevel', itemValue)
            }
            style={styles.picker}
          >
            <Picker.Item label="Nível de Experiência" value={null} />
            <Picker.Item label="Iniciante (0-6 meses)" value="beginner" />
            <Picker.Item label="Intermediário (6m - 2a)" value="intermediate" />
            <Picker.Item label="Avançado (2a+)" value="advanced" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={availability}
            onValueChange={(itemValue) =>
              handleValueChange('availability', itemValue)
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
      <View style={styles.footer}>
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
    width: '100%',
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
