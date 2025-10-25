import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNetworkStore } from '../state/networkStore'
import { theme } from '../theme'

const ConnectivityIndicator: React.FC = () => {
  const isOnline = useNetworkStore((state) => state.isOnline)

  return (
    <View style={styles.container}>
      <Ionicons
        name={isOnline ? 'cloud-outline' : 'cloud-offline-outline'}
        size={24}
        color={isOnline ? theme.colors.primary : theme.colors.secondary}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
})

export default ConnectivityIndicator
