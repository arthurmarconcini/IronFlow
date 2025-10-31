import React, { useState, useImperativeHandle, useRef } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Text,
  Pressable,
} from 'react-native'
import MaskInput, { Mask, MaskInputProps } from 'react-native-mask-input'
import { theme } from '../theme'

// Props que são comuns ou que queremos expor
type CustomInputProps = {
  isPassword?: boolean
  label?: string
  containerStyle?: object
  mask?: Mask
}

// Unindo as props de ambos os componentes de input com as nossas props customizadas
type StyledInputProps = CustomInputProps & TextInputProps & MaskInputProps

// O que o nosso ref vai expor: a função focus
export interface StyledInputRef {
  focus: () => void
}

const StyledInput = React.forwardRef<StyledInputRef, StyledInputProps>(
  ({ isPassword, label, containerStyle, style, mask, ...props }, ref) => {
    const [isSecure, setIsSecure] = useState(true)
    // O ref interno pode ser de qualquer um dos dois tipos
    const innerRef = useRef<TextInput | MaskInput | null>(null)

    // Expõe a função focus através do ref encaminhado
    useImperativeHandle(ref, () => ({
      focus: () => {
        innerRef.current?.focus()
      },
    }))

    const handlePress = () => {
      innerRef.current?.focus()
    }

    const secureText = isPassword ? isSecure : false

    // Renderiza o componente apropriado com as props corretas
    const renderInput = () => {
      const inputStyles = [styles.input, style]

      if (mask) {
        return (
          <MaskInput
            ref={innerRef as React.Ref<MaskInput>}
            style={inputStyles}
            placeholderTextColor={theme.colors.textMuted}
            mask={mask}
            {...props}
          />
        )
      }

      return (
        <TextInput
          ref={innerRef as React.Ref<TextInput>}
          style={inputStyles}
          secureTextEntry={secureText}
          placeholderTextColor={theme.colors.textMuted}
          {...props}
        />
      )
    }

    return (
      <Pressable
        onPress={handlePress}
        style={[styles.pressableContainer, containerStyle]}
      >
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputWrapper}>
          {renderInput()}
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
  },
)

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
