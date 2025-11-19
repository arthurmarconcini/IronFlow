import React, {
  useState,
  useImperativeHandle,
  useRef,
  ComponentRef,
  useEffect,
} from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Text,
  Pressable,
  Animated,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native'
import MaskInput, { Mask, MaskInputProps } from 'react-native-mask-input'
import { theme } from '../theme'

type CustomInputProps = {
  label?: string
  error?: string
  isPassword?: boolean
  containerStyle?: object
  mask?: Mask
  shake?: number // Prop para acionar a animação
}

type StyledInputProps = CustomInputProps & TextInputProps & MaskInputProps

export interface StyledInputRef {
  focus: () => void
}

const StyledInput = React.forwardRef<StyledInputRef, StyledInputProps>(
  (
    {
      label,
      error,
      isPassword,
      containerStyle,
      style,
      mask,
      shake,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isSecure, setIsSecure] = useState(true)
    const [isFocused, setIsFocused] = useState(false)
    const textInputRef = useRef<TextInput>(null)
    const maskInputRef = useRef<ComponentRef<typeof MaskInput>>(null)
    const shakeAnimation = useRef(new Animated.Value(0)).current

    useEffect(() => {
      if (shake && shake > 0) {
        triggerShake()
      }
    }, [shake])

    const triggerShake = () => {
      shakeAnimation.setValue(0)
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
    }

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

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true)
      if (onFocus) onFocus(e)
    }

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false)
      if (onBlur) onBlur(e)
    }

    const secureText = isPassword ? isSecure : false

    const interpolatedShake = shakeAnimation.interpolate({
      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
      outputRange: [0, -10, 10, -10, 10, 0],
    })

    const borderColor = error
      ? theme.colors.error
      : isFocused
        ? theme.colors.primary
        : theme.colors.border

    const renderInput = () => {
      const inputStyles = [styles.input, style]

      if (mask) {
        return (
          <MaskInput
            ref={maskInputRef}
            style={inputStyles}
            placeholderTextColor={theme.colors.textMuted}
            mask={mask}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      )
    }

    return (
      <Animated.View
        style={[
          styles.container,
          containerStyle,
          { transform: [{ translateX: interpolatedShake }] },
        ]}
      >
        {label && <Text style={styles.label}>{label}</Text>}
        <Pressable onPress={handlePress}>
          <View style={[styles.inputWrapper, { borderColor }]}>
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
        {error && <Text style={styles.errorText}>{error}</Text>}
      </Animated.View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: theme.spacing.small,
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.medium,
    height: 50,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    height: '100%',
  },
  eyeButton: {
    padding: theme.spacing.medium,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.xsmall,
  },
})

export default StyledInput
