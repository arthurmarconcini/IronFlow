import React, { useState } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Text,
} from 'react-native'
import { theme } from '../theme'

// Extend props to include our custom prop
interface StyledInputProps extends TextInputProps {
  isPassword?: boolean
}

const StyledInput: React.FC<StyledInputProps> = ({ isPassword, ...props }) => {
  // A password field should be secure by default.
  const [isSecure, setIsSecure] = useState(true)

  // Only apply secure text entry if it's a password field.
  const secureText = isPassword ? isSecure : false

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} secureTextEntry={secureText} {...props} />
      {isPassword && (
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setIsSecure((prev) => !prev)}
        >
          {/* Show open eye when secure (text hidden), closed eye when not */}
          <Text>{isSecure ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.palette.secondary,
    borderRadius: theme.spacing.small,
    marginVertical: theme.spacing.small,
  },
  input: {
    flex: 1,
    padding: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.palette.text,
  },
  eyeButton: {
    padding: theme.spacing.medium,
  },
})

export default StyledInput
