import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Slider } from '@miblanchard/react-native-slider'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { RouteProp } from '@react-navigation/native'
import {
  OnboardingNavigationProp,
  OnboardingStackParamList,
} from '../../navigation/types'

type Props = {
  navigation: OnboardingNavigationProp
  route: RouteProp<OnboardingStackParamList, 'Biometrics'>
}

type UnitSystem = 'metric' | 'imperial'

const BiometricsScreen = ({ navigation, route }: Props) => {
  const { goal, displayName, dob, sex, experienceLevel, availability } =
    route.params
  const [height, setHeight] = useState(175) // cm
  const [weight, setWeight] = useState(70) // kg
  const [units, setUnits] = useState<UnitSystem>('metric')

  const handleFinish = () => {
    navigation.navigate('Confirmation', {
      goal,
      displayName,
      dob,
      sex,
      experienceLevel,
      availability,
      heightCm: height,
      weightKg: weight,
    })
  }

  // Funções de conversão simples para exibição
  const displayHeight =
    units === 'metric'
      ? `${height.toFixed(0)} cm`
      : `${(height / 2.54).toFixed(1)} in`
  const displayWeight =
    units === 'metric'
      ? `${weight.toFixed(1)} kg`
      : `${(weight * 2.20462).toFixed(1)} lbs`

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Conte-nos sobre você</Text>
        <Text style={styles.subtitle}>
          Isso nos ajudará a personalizar sua experiência.
        </Text>

        {/* Seletor de Unidades */}
        <View style={styles.unitSelector}>
          <TouchableOpacity
            onPress={() => setUnits('metric')}
            style={[
              styles.unitButton,
              units === 'metric' && styles.unitButtonActive,
            ]}
          >
            <Text
              style={[
                styles.unitText,
                units === 'metric' && styles.unitTextActive,
              ]}
            >
              Métrico (cm, kg)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setUnits('imperial')}
            style={[
              styles.unitButton,
              units === 'imperial' && styles.unitButtonActive,
            ]}
          >
            <Text
              style={[
                styles.unitText,
                units === 'imperial' && styles.unitTextActive,
              ]}
            >
              Imperial (ft, lbs)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Slider de Altura */}
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Altura</Text>
          <Text style={styles.value}>{displayHeight}</Text>
        </View>
        <Slider
          value={height}
          onValueChange={(value) =>
            setHeight(Array.isArray(value) ? value[0] : value)
          }
          minimumValue={120}
          maximumValue={220}
          step={1}
          thumbTintColor={theme.colors.primary}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.lightGray}
        />

        {/* Slider de Peso */}
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Peso</Text>
          <Text style={styles.value}>{displayWeight}</Text>
        </View>
        <Slider
          value={weight}
          onValueChange={(value) =>
            setWeight(Array.isArray(value) ? value[0] : value)
          }
          minimumValue={40}
          maximumValue={150}
          step={0.5}
          thumbTintColor={theme.colors.primary}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.lightGray}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.progressIndicator}>Passo 3 de 3</Text>
        <StyledButton title="Próximo" onPress={handleFinish} />
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
    paddingTop: 60, // Espaço para o header transparente
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
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.large,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.spacing.small,
  },
  unitButton: {
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.spacing.small,
  },
  unitButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  unitText: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  unitTextActive: {
    color: theme.colors.white,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.large,
  },
  label: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
  },
  value: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.primary,
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

export default BiometricsScreen
