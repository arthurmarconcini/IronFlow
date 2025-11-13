import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useProfileStore } from '../state/profileStore'

import AuthStack from './AuthStack'
import AppStack from './AppStack'
import OnboardingStack from './OnboardingStack'
import SplashScreen from '../screens/SplashScreen'
import OfflineSyncScreen from '../screens/OfflineSyncScreen'

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth()

  // Chama o hook de inicialização. Ele não retorna nada, apenas dispara a lógica.
  useUserProfile()

  const profile = useProfileStore((state) => state.profile)
  const initializationStatus = useProfileStore(
    (state) => state.initializationStatus,
  )

  if (authLoading || initializationStatus === 'loading') {
    return <SplashScreen />
  }

  if (initializationStatus === 'needs-online-sync') {
    return <OfflineSyncScreen />
  }

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : !profile ? <OnboardingStack /> : <AppStack />}
    </NavigationContainer>
  )
}
