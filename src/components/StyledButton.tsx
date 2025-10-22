import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { theme } from '../theme'

interface StyledButtonProps {
  title: string
  onPress: () => void
  isLoading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
}

const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  style,
  textStyle,
  disabled = false,
}) => {
  const buttonStyles = [
    styles.button,
    style,
    (disabled || isLoading) && styles.disabled,
  ]

  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonStyles}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: theme.spacing.small,
  },
  text: {
    color: '#FFFFFF',
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: theme.colors.secondary,
  },
})

export default StyledButton
