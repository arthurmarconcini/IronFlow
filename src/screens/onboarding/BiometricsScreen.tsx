import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Slider } from '@miblanchard/react-native-slider'
import { ZodError } from 'zod'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { OnboardingNavigationProp } from '../../navigation/types'
import { useOnboardingStore } from '../../state/onboardingStore'
import { biometricsSchema, BiometricsData } from '../../types/onboardingSchema'
import { convertCmToFtIn, convertKgToLbs } from '../../utils/conversionUtils'

type Props = {
  navigation: OnboardingNavigationProp
}

type UnitSystem = 'metric' | 'imperial'

const BiometricsScreen = ({ navigation }: Props) => {
  const { heightCm, weightKg, setOnboardingData } = useOnboardingStore()
  const [units, setUnits] = useState<UnitSystem>('metric')

  const [height, setHeight] = useState(heightCm || 170)
  const [weight, setWeight] = useState(weightKg || 70)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const MIN_WEIGHT = 30
  const MAX_WEIGHT = 330

  const handleFinish = () => {
    try {
      const formData: BiometricsData = {
        heightCm: height,
        weightKg: weight,
      }
      const validatedData = biometricsSchema.parse(formData)
      setOnboardingData(validatedData)
      navigation.navigate('Experience')
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map((e) => e.message).join('\n')
        Alert.alert('Dados Inválidos', errorMessage)
      }
    }
  }

  const incrementWeight = () => {
    setWeight((prev) => Math.min(MAX_WEIGHT, prev + 0.5))
  }

  const decrementWeight = () => {
    setWeight((prev) => Math.max(MIN_WEIGHT, prev - 0.5))
  }

  const handlePressOut = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleLongPress = (action: 'increment' | 'decrement') => {
    handlePressOut() // Clear any existing interval
    intervalRef.current = setInterval(() => {
      if (action === 'increment') {
        incrementWeight()
      } else {
        decrementWeight()
      }
    }, 50)
  }

  const displayHeight =
    units === 'metric' ? `${height.toFixed(0)} cm` : convertCmToFtIn(height)
  const displayWeight =
    units === 'metric'
      ? `${weight.toFixed(1)} kg`
      : `${convertKgToLbs(weight).toFixed(1)} lbs`

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Suas Medidas</Text>
          <Text style={styles.subtitle}>
            Isso nos ajudará a calcular suas necessidades calóricas e de macros.
          </Text>
        </View>

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
              Imperial (ft, in)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.sliderHeader}>
            <Text style={styles.label}>Altura</Text>
            <Text style={styles.value}>{displayHeight}</Text>
          </View>
          <Slider
            value={height}
            onValueChange={(value) =>
              setHeight(Array.isArray(value) ? value[0] : value)
            }
            minimumValue={100}
            maximumValue={240}
            step={1}
            thumbTintColor={theme.colors.primary}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.lightGray}
            trackStyle={styles.track}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.sliderHeader}>
            <Text style={styles.label}>Peso</Text>
            <View style={styles.weightControls}>
              <TouchableOpacity
                onPress={decrementWeight}
                onLongPress={() => handleLongPress('decrement')}
                onPressOut={handlePressOut}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.value}>{displayWeight}</Text>
              <TouchableOpacity
                onPress={incrementWeight}
                onLongPress={() => handleLongPress('increment')}
                onPressOut={handlePressOut}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Slider
            value={weight}
            onValueChange={(value) =>
              setWeight(Array.isArray(value) ? value[0] : value)
            }
            minimumValue={MIN_WEIGHT}
            maximumValue={MAX_WEIGHT}
            step={0.5}
            thumbTintColor={theme.colors.primary}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.lightGray}
            trackStyle={styles.track}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.progressIndicator}>Passo 3 de 5</Text>
        <StyledButton title="Próximo" onPress={handleFinish} />
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
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.large,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unitButton: {
    flex: 1,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  unitText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: theme.fontSizes.small,
  },
  unitTextActive: {
    color: theme.colors.white,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    fontWeight: '500',
  },
  value: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
    minWidth: 80,
    textAlign: 'center',
  },
  weightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustButton: {
    backgroundColor: theme.colors.lightPrimary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xsmall,
  },
  adjustButtonText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  track: {
    height: 6,
    borderRadius: 3,
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

export default BiometricsScreen
