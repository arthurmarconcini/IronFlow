import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'

const OfflineSyncScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Conexão Necessária</Text>
        <Text style={styles.subtitle}>
          Para configurar este dispositivo pela primeira vez, precisamos de uma
          conexão com a internet para sincronizar seus dados.
        </Text>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.spinner}
        />
        <Text style={styles.footerText}>
          Por favor, conecte-se à internet. O aplicativo continuará
          automaticamente.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  subtitle: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  spinner: {
    marginVertical: theme.spacing.large,
  },
  footerText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textAlign: 'center',
  },
})

export default OfflineSyncScreen
