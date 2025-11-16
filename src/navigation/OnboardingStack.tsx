import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { OnboardingStackParamList } from './types'
import { theme } from '../theme'

// Importando as telas de onboarding
import WelcomeScreen from '../screens/onboarding/WelcomeScreen'
import DemographicsScreen from '../screens/onboarding/DemographicsScreen'
import EquipmentScreen from '../screens/onboarding/EquipmentScreen'
import BiometricsScreen from '../screens/onboarding/BiometricsScreen'
import ExperienceScreen from '../screens/onboarding/ExperienceScreen'
import GoalScreen from '../screens/onboarding/GoalScreen'
import ConfirmationScreen from '../screens/onboarding/ConfirmationScreen'
import FreeWorkoutOfferScreen from '../screens/onboarding/FreeWorkoutOfferScreen'

const Stack = createStackNavigator<OnboardingStackParamList>()

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Demographics" component={DemographicsScreen} />
      <Stack.Screen name="Equipment" component={EquipmentScreen} />
      <Stack.Screen name="Biometrics" component={BiometricsScreen} />
      <Stack.Screen name="Experience" component={ExperienceScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen
        name="FreeWorkoutOffer"
        component={FreeWorkoutOfferScreen}
      />
    </Stack.Navigator>
  )
}
