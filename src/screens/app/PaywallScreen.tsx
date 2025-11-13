import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { AppNavigationProp } from '../../navigation/types'
import ScreenContainer from '../../components/ScreenContainer'

const BenefitRow = ({ text }: { text: string }) => (
  <View style={styles.benefitRow}>
    <Ionicons
      name="checkmark-circle-outline"
      size={24}
      color={theme.colors.primary}
    />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
)

type Props = {
  navigation: AppNavigationProp
}

export default function PaywallScreen({ navigation }: Props) {
  return (
    <ScreenContainer style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', theme.colors.background]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Ionicons
            name="sparkles-outline"
            size={50}
            color={theme.colors.gold}
          />
          <Text style={styles.title}>Desbloqueie o Acesso Premium</Text>
          <Text style={styles.subtitle}>
            A funcionalidade que você tentou acessar está disponível apenas para
            membros Premium.
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>
            Ao se tornar Premium, você terá acesso a:
          </Text>
          <BenefitRow text="Estatísticas Avançadas e Gráficos de Progressão" />
          <BenefitRow text="Geração de Treinos Ilimitada e Personalizada" />
          <BenefitRow text="Sincronização Automática na Nuvem" />
          <BenefitRow text="Acesso Antecipado a Novos Recursos" />
          <BenefitRow text="Experiência Totalmente Sem Anúncios" />
        </View>

        <View style={styles.footer}>
          <StyledButton
            title="Ver Planos Premium"
            onPress={() => navigation.navigate('Premium')}
            icon={<Ionicons name="star-outline" size={20} color="#FFFFFF" />}
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>
              Continuar com anúncios
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.large,
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
    lineHeight: 24,
  },
  benefitsContainer: {
    marginTop: theme.spacing.large,
  },
  benefitsTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
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
  continueButton: {
    marginTop: theme.spacing.large,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textDecorationLine: 'underline',
  },
})
