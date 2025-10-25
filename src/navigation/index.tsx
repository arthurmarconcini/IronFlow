import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useProfileStore } from '../state/profileStore'

import AuthStack from './AuthStack'
import AppStack from './AppStack'
import OnboardingStack from './OnboardingStack'
import SplashScreen from '../screens/SplashScreen'

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth()

  // Chama o hook para acionar a busca de perfil, mas obtém o estado do store
  useUserProfile()
  const { profile, isLoading: profileLoading } = useProfileStore()

  if (authLoading || profileLoading) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : !profile ? <OnboardingStack /> : <AppStack />}
    </NavigationContainer>
  )
}
