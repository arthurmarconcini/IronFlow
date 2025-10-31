import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { OnboardingStackParamList } from './types'

// Importando as telas de onboarding
import WelcomeScreen from '../screens/onboarding/WelcomeScreen'
import GoalScreen from '../screens/onboarding/GoalScreen'
import BiometricsScreen from '../screens/onboarding/BiometricsScreen'
import ConfirmationScreen from '../screens/onboarding/ConfirmationScreen'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import { theme } from '../theme'

const Stack = createStackNavigator<OnboardingStackParamList>()

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',

        headerTintColor: theme.colors.primary,
        headerBackTitle: ' ',
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="Biometrics" component={BiometricsScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}
