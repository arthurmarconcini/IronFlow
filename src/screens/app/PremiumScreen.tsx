import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { AppNavigationProp } from '../../navigation/types'

import { useProfileStore } from '../../state/profileStore'
import { DatabaseService } from '../../db/DatabaseService'

const BenefitRow = ({ text }: { text: string }) => (
  <View style={styles.benefitRow}>
    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
)

type Props = {
  navigation: AppNavigationProp
}

export default function PremiumScreen({ navigation }: Props) {
  const { profile, updateProfile } = useProfileStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!profile) return

    setIsLoading(true)
    try {
      // Simulação de upgrade bem-sucedido
      const updatedProfileFields = {
        planType: 'premium' as const,
        syncStatus: 'dirty' as const,
        lastModifiedLocally: Date.now(),
      }

      // Atualiza o banco de dados local
      await DatabaseService.updateUserProfile(profile.id!, updatedProfileFields)
      // Atualiza o estado global do Zustand
      updateProfile(updatedProfileFields)

      Alert.alert(
        'Upgrade Concluído!',
        'Parabéns! Você agora tem acesso a todos os recursos Premium.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      )
    } catch (error) {
      console.error('Erro ao simular o upgrade de plano:', error)
      Alert.alert(
        'Erro',
        'Não foi possível atualizar seu plano. Tente novamente.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFFFFF', theme.colors.background]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Ionicons name="sparkles" size={40} color={theme.colors.gold} />
          <Text style={styles.title}>Leve seu Treino ao Próximo Nível</Text>
          <Text style={styles.subtitle}>
            Desbloqueie todo o potencial do IronFlow com o plano Premium.
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <BenefitRow text="Estatísticas Avançadas e Gráficos de Progressão" />
          <BenefitRow text="Geração de Treinos Ilimitada e Personalizada" />
          <BenefitRow text="Sincronização Automática na Nuvem" />
          <BenefitRow text="Acesso Antecipado a Novos Recursos" />
          <BenefitRow text="Experiência Sem Anúncios" />
        </View>

        <View style={styles.footer}>
          <StyledButton
            title="Tornar-se Premium"
            onPress={handleUpgrade}
            isLoading={isLoading}
            icon={<Ionicons name="star" size={20} color="#FFFFFF" />}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.large,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.medium,
  },
  subtitle: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.small,
  },
  benefitsContainer: {
    marginTop: theme.spacing.large,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  benefitText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.medium,
    flex: 1,
  },
  footer: {
    paddingBottom: theme.spacing.medium,
  },
  footerText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.medium,
  },
  orText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginVertical: theme.spacing.medium,
    fontWeight: 'bold',
  },
})
