import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { AppStackParamList } from './types'
import CreateWorkoutScreen from '../screens/app/CreateWorkoutScreen'
import AddExerciseScreen from '../screens/app/AddExerciseScreen'
import WorkoutDetailScreen from '../screens/app/WorkoutDetailScreen'
import AppTabs from './AppTabs' // Importa o novo Tab Navigator

const Stack = createStackNavigator<AppStackParamList>()

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="AppTabs">
      <Stack.Screen
        name="AppTabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateWorkout"
        component={CreateWorkoutScreen}
        options={{ title: 'Criar Treino' }}
      />
      <Stack.Screen
        name="AddExercise"
        component={AddExerciseScreen}
        options={{ title: 'Adicionar Exercício' }}
      />
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: 'Detalhes do Treino' }}
      />
    </Stack.Navigator>
  )
}
