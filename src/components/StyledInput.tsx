import React from 'react'
import { TextInput, StyleSheet, TextInputProps } from 'react-native'
import { theme } from '../theme'

const StyledInput: React.FC<TextInputProps> = (props) => {
  return <TextInput style={styles.input} {...props} />
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.palette.secondary,
    borderRadius: theme.spacing.small,
    padding: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.palette.text,
    width: '100%',
    marginVertical: theme.spacing.small,
  },
})

export default StyledInput
