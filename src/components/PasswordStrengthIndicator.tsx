import React from 'react'
import { View, StyleSheet } from 'react-native'
import { theme } from '../theme'

interface PasswordStrengthIndicatorProps {
  strength: number // 0 to 4
}

const strengthColors = [
  theme.palette.secondary, // 0 - default
  '#FF4136', // 1 - weak
  '#FF851B', // 2 - medium
  '#FFDC00', // 3 - good
  '#2ECC40', // 4 - strong
]

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
}) => {
  const getBarColor = (barIndex: number) => {
    if (strength > 0 && barIndex < strength) {
      return strengthColors[strength]
    }
    return strengthColors[0] // Default color
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={index}
          style={[styles.strengthBar, { backgroundColor: getBarColor(index) }]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 5,
    width: '100%',
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.medium,
  },
  strengthBar: {
    flex: 1,
    height: '100%',
    borderRadius: 5,
    marginHorizontal: 2,
  },
})

export default PasswordStrengthIndicator
