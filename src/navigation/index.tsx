import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useProfileStore } from '../state/profileStore'

import AppStack from './AppStack'
import OnboardingStack from './OnboardingStack'
import SplashScreen from '../screens/SplashScreen'
import OfflineSyncScreen from '../screens/OfflineSyncScreen'

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth()

  useUserProfile()
  const { profile, initializationStatus } = useProfileStore()

  if (authLoading || initializationStatus === 'loading') {
    return <SplashScreen />
  }

  if (initializationStatus === 'needs-online-sync') {
    return <OfflineSyncScreen />
  }

  return (
    <NavigationContainer>
      {!user ? (
        <OnboardingStack />
      ) : !profile ? (
        <OnboardingStack />
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  )
}
