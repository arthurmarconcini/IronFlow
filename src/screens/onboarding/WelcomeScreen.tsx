import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { OnboardingNavigationProp } from '../../navigation/types'

type Props = {
  navigation: OnboardingNavigationProp
}

const WelcomeScreen = ({ navigation }: Props) => {
  const handleStart = () => {
    navigation.navigate('Goal')
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo ao IronFlow</Text>
        <Text style={styles.subtitle}>
          Seu assistente pessoal para a jornada na musculação. Vamos configurar
          seu perfil.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.progressIndicator}>Passo 1 de 3</Text>
        <StyledButton title="Vamos Começar" onPress={handleStart} />
        <StyledButton
          title="Já tenho uma conta"
          onPress={() => navigation.navigate('Login')}
          type="secondary"
          containerStyle={{ marginTop: theme.spacing.small }}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  subtitle: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large, // Garante espaço na parte inferior
  },
  progressIndicator: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
})

export default WelcomeScreen
