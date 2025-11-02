import React, { ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'

type FormGroupProps = {
  label: string
  children: ReactNode
}

const FormGroup = ({ label, children }: FormGroupProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.medium,
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
})

export default FormGroup
