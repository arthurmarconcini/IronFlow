import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { Exercise } from '../db/useDatabase'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type OnboardingStackParamList = {
  Welcome: undefined
  Goal: undefined
  Biometrics: {
    goal: 'GAIN_MASS' | 'LOSE_FAT' | 'MAINTAIN'
  }
  Confirmation: {
    goal: 'GAIN_MASS' | 'LOSE_FAT' | 'MAINTAIN'
    heightCm: number
    weightKg: number
  }
}

export type AppTabParamList = {
  HomeTab: undefined
  ProfileTab: undefined
}

export type AppStackParamList = {
  AppTabs: { screen: keyof AppTabParamList } // Para aninhar o Tab Navigator
  ProfileEdit: undefined
  CreateWorkout: { newExercise?: Exercise }
  WorkoutDetail: { workoutId: number }
  AddExercise: undefined
}

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>
export type OnboardingNavigationProp =
  StackNavigationProp<OnboardingStackParamList>
export type AppNavigationProp = StackNavigationProp<AppStackParamList>

// Tipos para Route Prop (para acessar route.params)
export type ConfirmationScreenRouteProp = RouteProp<
  OnboardingStackParamList,
  'Confirmation'
>
