import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Slider } from '@miblanchard/react-native-slider'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { useProfileStore } from '../../state/profileStore'
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils'
import { DatabaseService } from '../../db/DatabaseService'
import { SyncService } from '../../sync/SyncService'
import { useAuth } from '../../hooks/useAuth'
import { AppNavigationProp } from '../../navigation/types'

type Props = {
  navigation: AppNavigationProp
}

const ProfileEditScreen = ({ navigation }: Props) => {
  const { user } = useAuth()
  const { profile, setProfile } = useProfileStore()
  const [isLoading, setIsLoading] = useState(false)

  // Inicializa o estado local com o peso atual do perfil
  const [weight, setWeight] = useState(profile?.currentWeightKg ?? 70)

  const handleSave = async () => {
    if (!profile || !user) return

    setIsLoading(true)
    try {
      // 1. Recalcular IMC
      const newBmi = calculateBMI(weight, profile.heightCm!)
      const newBmiCategory = getBMICategory(newBmi)

      const updatedFields = {
        currentWeightKg: weight,
        bmi: newBmi,
        bmiCategory: newBmiCategory,
        syncStatus: 'dirty' as const, // 3. Definir sync_status
        lastModifiedLocally: Date.now(),
      }

      // 2. Chamar 'updateUserProfile' localmente
      await DatabaseService.updateUserProfile(profile.id!, updatedFields)

      // Atualiza o estado global
      const updatedProfile = { ...profile, ...updatedFields }
      setProfile(updatedProfile)

      // 4. Acionar 'syncUserProfile' em segundo plano
      SyncService.syncUserProfile(user)

      navigation.goBack()
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Atualizar Peso</Text>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Peso</Text>
          <Text style={styles.value}>{weight.toFixed(1)} kg</Text>
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
        <StyledButton
          title="Salvar Alterações"
          onPress={handleSave}
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
    paddingTop: theme.spacing.large,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
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
})

export default ProfileEditScreen
