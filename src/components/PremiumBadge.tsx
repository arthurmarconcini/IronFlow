// src/components/PremiumBadge.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'

interface PremiumBadgeProps {
  style?: object
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ style }) => {
  return (
    <View style={[styles.badgeContainer, style]}>
      <Text style={styles.badgeText}>Premium</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    alignSelf: 'flex-start', // Para que o badge não ocupe a largura total
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.xsmall,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
})

export default PremiumBadge
