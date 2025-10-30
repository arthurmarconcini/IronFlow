import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native'
import { theme } from '../theme'

interface StyledButtonProps {
  title: string
  onPress: () => void
  isLoading?: boolean
  containerStyle?: StyleProp<ViewStyle>
  buttonStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  disabled?: boolean
  type?: 'primary' | 'secondary'
  icon?: React.ReactNode
}

const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  containerStyle,
  buttonStyle,
  textStyle,
  disabled = false,
  type = 'primary',
  icon,
}) => {
  // Define estilos com base no tipo
  const isSecondary = type === 'secondary'
  const typeButtonStyles = isSecondary ? styles.buttonSecondary : styles.button
  const typeTextStyles = isSecondary ? styles.textSecondary : styles.text

  const buttonStyles = [
    styles.buttonBase,
    typeButtonStyles,
    buttonStyle,
    (disabled || isLoading) && styles.disabled,
  ]

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle]}
      disabled={disabled || isLoading}
    >
      <View style={buttonStyles}>
        {isLoading ? (
          <ActivityIndicator
            color={isSecondary ? theme.colors.primary : '#FFFFFF'}
          />
        ) : (
          <View style={styles.contentContainer}>
            {icon}
            <Text
              style={[
                typeTextStyles,
                textStyle,
                icon != null && styles.textWithIcon,
              ]}
            >
              {title}
            </Text>
          </View>
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
  // Estilos base compartilhados
  buttonBase: {
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWithIcon: {
    marginLeft: theme.spacing.small,
  },
  // Estilos do tipo 'primary'
  button: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    color: '#FFFFFF',
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  // Estilos do tipo 'secondary'
  buttonSecondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textSecondary: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  // Estilo desabilitado
  disabled: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
})

export default StyledButton
