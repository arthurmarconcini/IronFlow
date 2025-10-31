import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import {
  OnboardingNavigationProp,
  OnboardingStackParamList,
} from '../../navigation/types'
import { RouteProp } from '@react-navigation/native'

type Props = {
  navigation: OnboardingNavigationProp
  route: RouteProp<OnboardingStackParamList, 'Experience'>
}

const ExperienceScreen = ({ navigation, route }: Props) => {
  const { goal, displayName, dob, sex } = route.params
  const [experienceLevel, setExperienceLevel] = useState<
    'beginner' | 'intermediate' | 'advanced' | null
  >(null)
  const [availability, setAvailability] = useState<'1-2' | '3-4' | '5+' | null>(
    null,
  )

  const handleNext = () => {
    if (experienceLevel && availability) {
      navigation.navigate('Biometrics', {
        goal,
        displayName,
        dob,
        sex,
        experienceLevel,
        availability,
      })
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
            onValueChange={(itemValue) => setExperienceLevel(itemValue)}
            style={styles.picker}
          >
            <Picker.Item
              label="Nível de Experiência"
              value={null}
              style={styles.pickerItem}
            />
            <Picker.Item
              label="Iniciante (0-6 meses)"
              value="beginner"
              style={styles.pickerItem}
            />
            <Picker.Item
              label="Intermediário (6m - 2a)"
              value="intermediate"
              style={styles.pickerItem}
            />
            <Picker.Item
              label="Avançado (2a+)"
              value="advanced"
              style={styles.pickerItem}
            />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={availability}
            onValueChange={(itemValue) => setAvailability(itemValue)}
            style={styles.picker}
          >
            <Picker.Item
              label="Disponibilidade Semanal"
              value={null}
              style={styles.pickerItem}
            />
            <Picker.Item
              label="1-2 dias/semana"
              value="1-2"
              style={styles.pickerItem}
            />
            <Picker.Item
              label="3-4 dias/semana"
              value="3-4"
              style={styles.pickerItem}
            />
            <Picker.Item
              label="5+ dias/semana"
              value="5+"
              style={styles.pickerItem}
            />
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
  pickerItem: {
    fontSize: theme.fontSizes.medium,
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
