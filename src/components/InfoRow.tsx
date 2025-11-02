import React, { ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'

type InfoRowProps = {
  label: string
  value: string | number | null | undefined | ReactNode
  icon: keyof typeof Ionicons.glyphMap
}

const InfoRow = ({ label, value, icon }: InfoRowProps) => {
  const renderValue = () => {
    if (React.isValidElement(value)) {
      return value
    }
    return <Text style={styles.dataValue}>{value || 'N/A'}</Text>
  }

  return (
    <View style={styles.dataRow}>
      <Ionicons
        name={icon}
        size={20}
        color={theme.colors.secondary}
        style={styles.icon}
      />
      <Text style={styles.dataLabel}>{label}</Text>
      {renderValue()}
    </View>
  )
}

const styles = StyleSheet.create({
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  icon: {
    marginRight: theme.spacing.medium,
  },
  dataLabel: {
    flex: 1,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
  },
  dataValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: '500',
    color: theme.colors.text,
  },
})

export default InfoRow
