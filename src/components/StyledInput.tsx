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
} from 'react-native'
import MaskInput, { Mask, MaskInputProps } from 'react-native-mask-input'
import { theme } from '../theme'

type CustomInputProps = {
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
  ({ isPassword, containerStyle, style, mask, shake, ...props }, ref) => {
    const [isSecure, setIsSecure] = useState(true)
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

    const secureText = isPassword ? isSecure : false

    const interpolatedShake = shakeAnimation.interpolate({
      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
      outputRange: [0, -10, 10, -10, 10, 0],
    })

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
      <Animated.View
        style={{ transform: [{ translateX: interpolatedShake }] }}
      >
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
      </Animated.View>
    )
  },
)

const styles = StyleSheet.create({
  pressableContainer: {
    width: '100%',
    marginVertical: theme.spacing.small,
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