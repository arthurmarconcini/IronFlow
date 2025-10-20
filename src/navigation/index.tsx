import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../hooks/useAuth'
import AuthStack from './AuthStack'
import AppStack from './AppStack'

export default function RootNavigator() {
  const { user } = useAuth()

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
