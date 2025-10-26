import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { theme } from '../theme'

interface StyledButtonProps {
  title: string
  onPress: () => void
  isLoading?: boolean
  containerStyle?: ViewStyle // Para o wrapper
  buttonStyle?: ViewStyle // Para o botão em si
  textStyle?: TextStyle
  disabled?: boolean
}

const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  containerStyle,
  buttonStyle,
  textStyle,
  disabled = false,
}) => {
  const buttonStyles = [
    styles.button,
    buttonStyle,
    (disabled || isLoading) && styles.disabled,
  ]

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle]} // Aplica o containerStyle aqui
      disabled={disabled || isLoading}
    >
      <View style={buttonStyles}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: theme.spacing.small,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
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
