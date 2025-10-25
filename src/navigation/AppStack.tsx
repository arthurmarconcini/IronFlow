import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { AppStackParamList } from './types'
import CreateWorkoutScreen from '../screens/app/CreateWorkoutScreen'
import AddExerciseScreen from '../screens/app/AddExerciseScreen'
import WorkoutDetailScreen from '../screens/app/WorkoutDetailScreen'
import ProfileEditScreen from '../screens/app/ProfileEditScreen' // Importa a nova tela
import AppTabs from './AppTabs'

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
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: 'Editar Perfil' }}
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
