import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
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
    <LinearGradient
      colors={[theme.colors.background, '#f7f7f7', theme.colors.background]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.content}>
          <Text style={styles.title}>Desperte sua força interior.</Text>
          <Text style={styles.subtitle}>
            Vamos construir juntos a sua melhor versão.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.progressIndicator}>Passo 1 de 5</Text>
          <StyledButton title="Vamos Começar" onPress={handleStart} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
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
    paddingBottom: theme.spacing.large,
  },
  progressIndicator: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
})

export default WelcomeScreen
