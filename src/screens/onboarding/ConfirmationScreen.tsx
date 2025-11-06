import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { calculateBMI, getBMICategory, BMICategory } from '../../utils/bmiUtils'
import { OnboardingNavigationProp } from '../../navigation/types'
import { useOnboardingStore } from '../../state/onboardingStore'
import { OnboardingState } from '../../state/onboardingStore'

type Props = {
  navigation: OnboardingNavigationProp
}

const ConfirmationScreen = ({ navigation }: Props) => {
  const onboardingData = useOnboardingStore((state) => state)

  const { bmi, bmiCategory } = useMemo(() => {
    if (!onboardingData.weightKg || !onboardingData.heightCm) {
      return { bmi: 0, bmiCategory: 'HEALTHY_WEIGHT' as BMICategory }
    }
    const calculatedBmi = calculateBMI(
      onboardingData.weightKg,
      onboardingData.heightCm,
    )
    const category = getBMICategory(calculatedBmi)
    return { bmi: calculatedBmi, bmiCategory: category }
  }, [onboardingData.heightCm, onboardingData.weightKg])

  const goalMap: Record<NonNullable<OnboardingState['goal']>, string> = {
    GAIN_MASS: 'Hipertrofia',
    FAT_LOSS: 'Emagrecimento / Definição',
    STRENGTH: 'Força',
    MAINTAIN: 'Manter a Forma',
  }

  const experienceMap: Record<
    NonNullable<OnboardingState['experienceLevel']>,
    string
  > = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  }

  const availabilityMap: Record<
    NonNullable<OnboardingState['availability']>,
    string
  > = {
    '1-2': '1-2 dias/semana',
    '3-4': '3-4 dias/semana',
    '5+': '5+ dias/semana',
  }

  const bmiCategoryMap: Record<BMICategory, string> = {
    UNDERWEIGHT: 'Abaixo do Peso',
    HEALTHY_WEIGHT: 'Peso Saudável',
    OVERWEIGHT: 'Sobrepeso',
    OBESITY: 'Obesidade',
  }

  const handleNavigateToOffer = () => {
    navigation.navigate('FreeWorkoutOffer')
  }

  const isDataComplete =
    onboardingData.goal &&
    onboardingData.experienceLevel &&
    onboardingData.availability &&
    onboardingData.displayName &&
    onboardingData.heightCm &&
    onboardingData.weightKg

  if (!isDataComplete) {
    Alert.alert(
      'Erro',
      'Parece que alguns dados estão faltando. Por favor, volte e complete seu perfil.',
      [{ text: 'OK', onPress: () => navigation.navigate('Welcome') }],
    )
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Confirme seus dados</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nome</Text>
            <Text style={styles.summaryValue}>
              {onboardingData.displayName}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Objetivo</Text>
            <Text style={styles.summaryValue}>
              {goalMap[onboardingData.goal!]}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Experiência</Text>
            <Text style={styles.summaryValue}>
              {experienceMap[onboardingData.experienceLevel!]}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Disponibilidade</Text>
            <Text style={styles.summaryValue}>
              {availabilityMap[onboardingData.availability!]}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Altura</Text>
            <Text style={styles.summaryValue}>
              {onboardingData.heightCm} cm
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Peso</Text>
            <Text style={styles.summaryValue}>
              {onboardingData.weightKg} kg
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IMC (Aprox.)</Text>
            <Text style={styles.summaryValue}>
              {bmi.toFixed(1)} ({bmiCategoryMap[bmiCategory]})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <StyledButton
          title="Confirmar e Ver Meu Treino"
          onPress={handleNavigateToOffer}
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
    marginBottom: theme.spacing.large,
  },
  summaryContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
  },
  summaryValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  footer: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
})

export default ConfirmationScreen
