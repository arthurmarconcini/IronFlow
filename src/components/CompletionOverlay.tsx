import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import StyledButton from './StyledButton'

type Props = {
  onPressNext?: () => void
}

const CompletionOverlay = ({ onPressNext }: Props) => {
  return (
    <View style={styles.overlay}>
      <Ionicons
        name="checkmark-circle-outline"
        size={80}
        color={theme.colors.primary}
      />
      <Text style={styles.overlayText}>Exercício Concluído!</Text>
      {onPressNext && (
        <StyledButton
          title="Próximo Exercício"
          onPress={onPressNext}
          containerStyle={{ marginTop: theme.spacing.large }}
          icon={
            <Ionicons name="arrow-forward-outline" size={20} color="white" />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
