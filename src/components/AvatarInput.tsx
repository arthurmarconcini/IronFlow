import React from 'react'
import { View, StyleSheet } from 'react-native'
import { theme } from '../theme'
import { Ionicons } from '@expo/vector-icons'

const AvatarInput: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Ionicons
          name="person-circle"
          size={110}
          color={theme.colors.lightGray}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
})

export default AvatarInput
