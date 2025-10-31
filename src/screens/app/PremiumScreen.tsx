import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'

const BenefitRow = ({ text }: { text: string }) => (
  <View style={styles.benefitRow}>
    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
)

export default function PremiumScreen() {
  const handleUpgrade = () => {
    // A lógica de upgrade será implementada no próximo prompt
    console.log('Botão de upgrade pressionado!')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFFFFF', theme.colors.background]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Ionicons name="sparkles" size={40} color="#FFD700" />
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
        </View>

        <View style={styles.footer}>
          <StyledButton
            title="Tornar-se Premium"
            onPress={handleUpgrade}
            icon={<Ionicons name="star" size={20} color="#FFFFFF" />}
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
    flex: 1, // Garante que o texto quebre a linha corretamente
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
})
