import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'

const CompletionOverlay = () => {
  return (
    <View style={styles.overlay}>
      <Ionicons
        name="checkmark-circle-outline"
        size={80}
        color={theme.colors.primary}
      />
      <Text style={styles.overlayText}>Exercício Concluído!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    zIndex: 10,
  },
  overlayText: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.medium,
  },
})

export default CompletionOverlay
