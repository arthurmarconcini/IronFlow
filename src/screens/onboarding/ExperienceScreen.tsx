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
        <Picker
          selectedValue={experienceLevel}
          onValueChange={(itemValue) => setExperienceLevel(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Nível de Experiência" value={null} />
          <Picker.Item label="Iniciante (0-6 meses)" value="beginner" />
          <Picker.Item label="Intermediário (6m - 2a)" value="intermediate" />
          <Picker.Item label="Avançado (2a+)" value="advanced" />
        </Picker>
        <Picker
          selectedValue={availability}
          onValueChange={(itemValue) => setAvailability(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Disponibilidade Semanal" value={null} />
          <Picker.Item label="1-2 dias/semana" value="1-2" />
          <Picker.Item label="3-4 dias/semana" value="3-4" />
          <Picker.Item label="5+ dias/semana" value="5+" />
        </Picker>
      </View>
      <View style={styles.footer}>
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
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },
  picker: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.small,
    marginBottom: theme.spacing.medium,
  },
  footer: {
    padding: theme.spacing.medium,
  },
})

export default ExperienceScreen
