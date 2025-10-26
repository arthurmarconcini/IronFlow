import React, { useState, useRef } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Text,
  Pressable,
} from 'react-native'
import { theme } from '../theme'

// Estendendo as props para incluir a label opcional
interface StyledInputProps extends TextInputProps {
  isPassword?: boolean
  label?: string
  containerStyle?: object // Para permitir estilos customizados no container
}

const StyledInput: React.FC<StyledInputProps> = ({
  isPassword,
  label,
  containerStyle,
  style, // Extrai o style para aplicar ao TextInput
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(true)
  const textInputRef = useRef<TextInput>(null)

  const handlePress = () => {
    textInputRef.current?.focus()
  }

  const secureText = isPassword ? isSecure : false

  return (
    // O Pressable envolve tudo, tornando a área inteira clicável
    <Pressable
      onPress={handlePress}
      style={[styles.pressableContainer, containerStyle]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          ref={textInputRef}
          style={[styles.input, style]} // Combina estilos
          secureTextEntry={secureText}
          placeholderTextColor={theme.colors.textMuted}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsSecure((prev) => !prev)}
          >
            <Text>{isSecure ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressableContainer: {
    width: '100%',
    marginVertical: theme.spacing.small,
  },
  label: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.small / 2,
    marginLeft: theme.spacing.small,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
  },
  input: {
    flex: 1,
    padding: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  eyeButton: {
    padding: theme.spacing.medium,
  },
})

export default StyledInput
