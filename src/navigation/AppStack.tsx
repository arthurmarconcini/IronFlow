import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { AppStackParamList } from './types'
import AppTabs from './AppTabs'
import CreateWorkoutScreen from '../screens/app/CreateWorkoutScreen'
import AddExerciseScreen from '../screens/app/AddExerciseScreen'
import AddManualExerciseScreen from '../screens/app/AddManualExerciseScreen'
import CustomizeExerciseScreen from '../screens/app/CustomizeExerciseScreen'
import WorkoutExecutionScreen from '../screens/app/WorkoutExecutionScreen'
import ProfileEditScreen from '../screens/app/ProfileEditScreen'
import WorkoutDetailsScreen from '../screens/app/WorkoutDetailsScreen'
import PremiumScreen from '../screens/app/PremiumScreen'
import ExerciseDetailScreen from '../screens/app/ExerciseDetailScreen'

const Stack = createStackNavigator<AppStackParamList>()

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen
        name="CreateWorkout"
        component={CreateWorkoutScreen}
        options={{ title: 'Criar Treino', headerShown: true }}
      />
      <Stack.Screen
        name="AddExercise"
        component={AddExerciseScreen}
        options={{ title: 'Adicionar Exercício', headerShown: true }}
      />
      <Stack.Screen
        name="AddManualExercise"
        component={AddManualExerciseScreen}
        options={{ title: 'Adicionar Manualmente', headerShown: true }}
      />
      <Stack.Screen
        name="CustomizeExercise"
        component={CustomizeExerciseScreen}
        options={{ title: 'Customizar Exercício', headerShown: true }}
      />
      <Stack.Screen
        name="WorkoutExecution"
        component={WorkoutExecutionScreen}
        options={{ title: 'Executando Treino', headerShown: true }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: 'Editar Perfil', headerShown: true }}
      />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetailsScreen}
        options={{ title: 'Detalhes do Treino', headerShown: true }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: 'Detalhes do Exercício', headerShown: true }}
      />
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          presentation: 'modal',
          title: 'Seja Premium',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  )
}
