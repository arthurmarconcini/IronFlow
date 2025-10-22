import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { theme } from '../../theme'
import AvatarInput from '../../components/AvatarInput'

// Define a type for the option items for better type-checking
type OptionItem = {
  icon: string
  label: string
  onPress: () => void
}

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const insets = useSafeAreaInsets()

  const options: OptionItem[] = [
    { icon: '✏️', label: 'Editar Perfil', onPress: () => {} },
    { icon: '📊', label: 'Estatísticas', onPress: () => {} },
    { icon: '⚙️', label: 'Configurações', onPress: () => {} },
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* User Info Header */}
      <View style={styles.header}>
        {user && (
          <>
            <AvatarInput />
            <Text style={styles.email}>{user.email}</Text>
          </>
        )}
      </View>

      {/* Options List */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={option.onPress}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spacer to push logout to the bottom */}
      <View style={{ flex: 1 }} />

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          { marginBottom: insets.bottom + theme.spacing.small },
        ]}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  avatarIcon: {
    fontSize: 50,
  },
  email: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
  },
  optionsContainer: {
    marginTop: theme.spacing.medium,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.medium,
  },
  optionLabel: {
    flex: 1,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  optionArrow: {
    fontSize: 24,
    color: theme.colors.secondary,
  },
  logoutButton: {
    backgroundColor: '#FF4136', // A more prominent danger color
    padding: theme.spacing.medium,
    borderRadius: theme.spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.medium, // Changed from margin
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
  },
})
