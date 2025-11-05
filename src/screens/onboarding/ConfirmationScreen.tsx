import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils'
import {
  ConfirmationScreenRouteProp,
  OnboardingNavigationProp,
} from '../../navigation/types'

type Props = {
  route: ConfirmationScreenRouteProp
  navigation: OnboardingNavigationProp
}

const ConfirmationScreen = ({ route, navigation }: Props) => {
  const {
    goal,
    displayName,
    dob,
    sex,
    experienceLevel,
    availability,
    heightCm,
    weightKg,
  } = route.params

  const { bmi, bmiCategory } = useMemo(() => {
    const calculatedBmi = calculateBMI(weightKg, heightCm)
    const category = getBMICategory(calculatedBmi)
    return { bmi: calculatedBmi, bmiCategory: category }
  }, [heightCm, weightKg])

  const goalMap = {
    GAIN_MASS: 'Hipertrofia',
    FAT_LOSS: 'Emagrecimento / Definição',
    STRENGTH: 'Força',
    MAINTAIN: 'Manter a Forma',
  }
  type Goal = keyof typeof goalMap

  const experienceMap = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  }
  type Experience = keyof typeof experienceMap

  const availabilityMap = {
    '1-2': '1-2 dias/semana',
    '3-4': '3-4 dias/semana',
    '5+': '5+ dias/semana',
  }
  type Availability = keyof typeof availabilityMap

  const bmiCategoryMap = {
    UNDERWEIGHT: 'Abaixo do Peso',
    HEALTHY_WEIGHT: 'Peso Saudável',
    OVERWEIGHT: 'Sobrepeso',
    OBESITY: 'Obesidade',
  }
  type BmiCategory = keyof typeof bmiCategoryMap

  const handleNavigateToOffer = () => {
    navigation.navigate('FreeWorkoutOffer', {
      goal,
      displayName,
      dob,
      sex,
      experienceLevel,
      availability,
      heightCm,
      weightKg,
      bmi,
      bmiCategory,
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Confirme seus dados</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nome</Text>
            <Text style={styles.summaryValue}>{displayName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Objetivo</Text>
            <Text style={styles.summaryValue}>{goalMap[goal as Goal]}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Experiência</Text>
            <Text style={styles.summaryValue}>
              {experienceMap[experienceLevel as Experience]}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Disponibilidade</Text>
            <Text style={styles.summaryValue}>
              {availabilityMap[availability as Availability]}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Altura</Text>
            <Text style={styles.summaryValue}>{heightCm} cm</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Peso</Text>
            <Text style={styles.summaryValue}>{weightKg} kg</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IMC (Aprox.)</Text>
            <Text style={styles.summaryValue}>
              {bmi.toFixed(1)} ({bmiCategoryMap[bmiCategory as BmiCategory]})
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
    borderRadius: theme.spacing.small,
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
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
