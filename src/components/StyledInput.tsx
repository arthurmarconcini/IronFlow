import React, {
  useState,
  useImperativeHandle,
  useRef,
  ComponentRef,
} from 'react'
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

type CustomInputProps = {
  isPassword?: boolean
  containerStyle?: object
  mask?: Mask
}

type StyledInputProps = CustomInputProps & TextInputProps & MaskInputProps

export interface StyledInputRef {
  focus: () => void
}

const StyledInput = React.forwardRef<StyledInputRef, StyledInputProps>(
  ({ isPassword, containerStyle, style, mask, ...props }, ref) => {
    const [isSecure, setIsSecure] = useState(true)
    const textInputRef = useRef<TextInput>(null)
    const maskInputRef = useRef<ComponentRef<typeof MaskInput>>(null)

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (mask) {
          maskInputRef.current?.focus()
        } else {
          textInputRef.current?.focus()
        }
      },
    }))

    const handlePress = () => {
      if (mask) {
        maskInputRef.current?.focus()
      } else {
        textInputRef.current?.focus()
      }
    }

    const secureText = isPassword ? isSecure : false

    const renderInput = () => {
      const inputStyles = [styles.input, style]

      if (mask) {
        return (
          <MaskInput
            ref={maskInputRef}
            style={inputStyles}
            placeholderTextColor={theme.colors.textMuted}
            mask={mask}
            {...props}
          />
        )
      }

      return (
        <TextInput
          ref={textInputRef}
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
