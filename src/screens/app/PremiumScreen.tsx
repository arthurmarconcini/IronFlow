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
import AdRewarded from '../../components/ads/RewardedAd' // Importar o componente de anúncio recompensado
import { SubscriptionService } from '../../services/SubscriptionService' // Importar o serviço de assinatura

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
  const { profile, setProfile } = useProfileStore() // Usar userProfile e setUserProfile
  const [isLoading, setIsLoading] = useState(false)
  const [isAdLoading, setIsAdLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!profile) return

    setIsLoading(true)
    try {
      // 1. Obter as ofertas do RevenueCat
      const offerings = await SubscriptionService.getOfferings()
      if (offerings.length === 0) {
        Alert.alert(
          'Erro',
          'Nenhuma oferta de assinatura encontrada. Tente novamente mais tarde.',
        )
        return
      }

      // Assumindo que queremos comprar o primeiro pacote disponível
      const packageToPurchase = offerings[0]

      // 2. Iniciar o fluxo de compra com RevenueCat
      const customerInfo =
        await SubscriptionService.purchasePackage(packageToPurchase)

      if (customerInfo?.entitlements.active.ironflow_premium) {
        // Se a compra foi bem-sucedida e o usuário tem o direito premium
        const updatedProfileFields = {
          planType: 'premium' as const,
          syncStatus: 'dirty' as const,
          lastModifiedLocally: Date.now(),
        }

        // Atualiza o banco de dados local e o estado global
        await DatabaseService.updateUserProfile(
          profile.id!,
          updatedProfileFields,
        )
        setProfile({ ...profile, ...updatedProfileFields })

        Alert.alert('Sucesso!', 'Seu plano foi atualizado para Premium.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ])
      } else {
        Alert.alert(
          'Compra Cancelada',
          'Sua compra foi cancelada ou não foi concluída.',
        )
      }
    } catch (error: unknown) {
      // Verifica se o erro é um objeto e se a propriedade userCancelled é true
      if (
        typeof error === 'object' &&
        error !== null &&
        'userCancelled' in error &&
        (error as { userCancelled: boolean }).userCancelled
      ) {
        console.log('Compra cancelada pelo usuário.')
      } else if (error instanceof Error) {
        console.error('Erro ao fazer upgrade do plano:', error.message)
        Alert.alert(
          'Erro',
          'Não foi possível atualizar seu plano. Tente novamente.',
        )
      } else {
        console.error('Erro desconhecido ao fazer upgrade do plano:', error)
        Alert.alert(
          'Erro',
          'Não foi possível atualizar seu plano. Tente novamente.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleWatchAd = async () => {
    if (!profile) return

    setIsAdLoading(true)
    try {
      // Lógica para recompensar o usuário após assistir ao anúncio
      // Por exemplo, desbloquear um plano de treino gratuito específico
      Alert.alert(
        'Parabéns!',
        'Você desbloqueou acesso a planos de treino gratuitos por assistir ao anúncio!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      )
      // O status do plano já é 'free', então não precisamos mudar aqui
      // Se houvesse um plano específico para desbloquear, a lógica iria aqui.
    } catch (error) {
      console.error('Erro ao assistir anúncio recompensado:', error)
      Alert.alert(
        'Erro',
        'Não foi possível carregar o anúncio. Tente novamente.',
      )
    } finally {
      setIsAdLoading(false)
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
          <Text style={styles.orText}>OU</Text>
          <AdRewarded
            onRewarded={handleWatchAd}
            buttonTitle="Assistir Anúncio para Desbloquear Planos Gratuitos"
            disabled={isAdLoading}
          />
          <Text style={styles.footerText}>
            Um pagamento único para acesso vitalício.
          </Text>
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
