import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useProfileStore } from '../state/profileStore'

import AuthStack from './AuthStack'
import AppStack from './AppStack'
import OnboardingStack from './OnboardingStack'
import SplashScreen from '../screens/SplashScreen'
import OfflineSyncScreen from '../screens/OfflineSyncScreen'
import PremiumScreen from '../screens/app/PremiumScreen'
import { RootStackParamList } from './types'

const RootStack = createStackNavigator<RootStackParamList>()

const AppContent = () => {
  const { user } = useAuth()
  const profile = useProfileStore((state) => state.profile)

  if (!user) {
    return <AuthStack />
  }
  if (!profile?.onboardingCompleted) {
    return <OnboardingStack />
  }
  return <AppStack />
}

export default function RootNavigator() {
  const { loading: authLoading } = useAuth()
  const initializationStatus = useProfileStore(
    (state) => state.initializationStatus,
  )

  useUserProfile()

  if (authLoading || initializationStatus === 'loading') {
    return <SplashScreen />
  }

  if (initializationStatus === 'needs-online-sync') {
    return <OfflineSyncScreen />
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <RootStack.Screen name="App" component={AppContent} />
        <RootStack.Screen
          name="Premium"
          component={PremiumScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Seja Premium',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
