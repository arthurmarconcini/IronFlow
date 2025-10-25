import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { DatabaseService } from '../../db/DatabaseService'
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils'
import { UserProfile } from '../../types/database'
import { ConfirmationScreenRouteProp } from '../../navigation/types'
import { useProfileStore } from '../../state/profileStore'
import { useAuth } from '../../hooks/useAuth'
import { SyncService } from '../../sync/SyncService'

type Props = {
  route: ConfirmationScreenRouteProp
}

const ConfirmationScreen = ({ route }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const setProfile = useProfileStore((state) => state.setProfile)

  const { goal, heightCm, weightKg } = route.params

  const { bmi, bmiCategory } = useMemo(() => {
    const calculatedBmi = calculateBMI(weightKg, heightCm)
    const category = getBMICategory(calculatedBmi)
    return { bmi: calculatedBmi, bmiCategory: category }
  }, [heightCm, weightKg])

  const goalMap = {
    GAIN_MASS: 'Ganhar Massa',
    LOSE_FAT: 'Perder Gordura',
    MAINTAIN: 'Manter a Forma',
  }

  const bmiCategoryMap = {
    UNDERWEIGHT: 'Abaixo do Peso',
    HEALTHY_WEIGHT: 'Peso Saudável',
    OVERWEIGHT: 'Sobrepeso',
    OBESITY: 'Obesidade',
  }

  const handleSaveProfile = async () => {
    if (!user) {
      console.error('Usuário não autenticado. Não é possível salvar o perfil.')
      return
    }

    setIsLoading(true)
    try {
      const userProfileData: Omit<UserProfile, 'id'> = {
        userId: user.uid,
        goal,
        heightCm,
        currentWeightKg: weightKg,
        bmi,
        bmiCategory,
        onboardingCompleted: true,
        syncStatus: 'dirty',
        lastModifiedLocally: Date.now(),
      }

      const newId = await DatabaseService.saveUserProfile(userProfileData)

      // Atualiza o estado global. O RootNavigator irá reagir e trocar a tela.
      const finalProfile = { ...userProfileData, id: newId }
      setProfile(finalProfile)

      // Dispara a sincronização em segundo plano
      SyncService.syncUserProfile(user)
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Confirme seus dados</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Objetivo</Text>
            <Text style={styles.summaryValue}>{goalMap[goal]}</Text>
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
              {bmi.toFixed(1)} ({bmiCategoryMap[bmiCategory]})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <StyledButton
          title="Salvar Perfil"
          onPress={handleSaveProfile}
          isLoading={isLoading}
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
    paddingTop: 60, // Espaço para o header transparente
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
