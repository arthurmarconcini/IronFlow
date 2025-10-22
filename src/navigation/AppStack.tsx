import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { AppStackParamList } from './types'
import ProfileScreen from '../screens/app/ProfileScreen'
import CreateWorkoutScreen from '../screens/app/CreateWorkoutScreen'

import HomeScreen from '../screens/app/HomeScreen'

import WorkoutDetailScreen from '../screens/app/WorkoutDetailScreen'

const Stack = createStackNavigator<AppStackParamList>()

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  )
}
