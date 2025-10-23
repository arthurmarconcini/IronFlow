import { StackNavigationProp } from '@react-navigation/stack'
import { Exercise } from '../db/useDatabase'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type AppTabParamList = {
  HomeTab: undefined
  ProfileTab: undefined
}

export type AppStackParamList = {
  AppTabs: { screen: keyof AppTabParamList } // Para aninhar o Tab Navigator
  CreateWorkout: { newExercise?: Exercise }
  WorkoutDetail: { workoutId: number }
  AddExercise: undefined
}

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>
export type AppNavigationProp = StackNavigationProp<AppStackParamList>
