import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import ScreenContainer from '../../components/ScreenContainer'
import { theme } from '../../theme'

export default function StatsScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Estatísticas</Text>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Dados de progresso e estatísticas aparecerão aqui.
        </Text>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textAlign: 'center',
  },
})
