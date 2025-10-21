import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../hooks/useAuth'
import AuthStack from './AuthStack'
import AppStack from './AppStack'
import SplashScreen from '../screens/SplashScreen'

export default function RootNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
