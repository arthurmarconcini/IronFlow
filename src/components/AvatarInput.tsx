import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { theme } from '../theme'
import defaultAvatar from '../../assets/icon.png'

// O componente foi simplificado para apenas exibir um avatar padrão.
// Todas as props como currentAvatarUrl e userId foram removidas.
const AvatarInput: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={defaultAvatar} style={styles.avatar} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.medium,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
})

export default AvatarInput
