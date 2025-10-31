import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { Exercise as WorkoutExercise } from '../types/database' // Corrigido
import { Exercise as ApiExercise } from '../services/exerciseDB'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type OnboardingStackParamList = {
  Welcome: undefined
  Goal: undefined
  Demographics: {
    goal: 'GAIN_MASS' | 'FAT_LOSS' | 'STRENGTH' | 'MAINTAIN'
  }
  Experience: {
    goal: 'GAIN_MASS' | 'FAT_LOSS' | 'STRENGTH' | 'MAINTAIN'
    displayName: string
    dob: string
    sex: 'male' | 'female' | 'other'
  }
  Biometrics: {
    goal: 'GAIN_MASS' | 'FAT_LOSS' | 'STRENGTH' | 'MAINTAIN'
    displayName: string
    dob: string
    sex: 'male' | 'female' | 'other'
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
    availability: '1-2' | '3-4' | '5+'
  }
  Confirmation: {
    goal: 'GAIN_MASS' | 'FAT_LOSS' | 'STRENGTH' | 'MAINTAIN'
    displayName: string
    dob: string
    sex: 'male' | 'female' | 'other'
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
    availability: '1-2' | '3-4' | '5+'
    heightCm: number
    weightKg: number
  }
}

export type AppTabParamList = {
  HomeTab: undefined
  StatsTab: undefined
  ProfileTab: undefined
}

export type AppStackParamList = {
  AppTabs: { screen: keyof AppTabParamList }
  ProfileEdit: undefined
  CreateWorkout: { newExercise?: WorkoutExercise; workoutId?: string }
  AddExercise: undefined
  AddManualExercise: undefined
  CustomizeExercise: { selectedExercises: ApiExercise[] }
  WorkoutExecution: { workoutId: string }
  WorkoutDetails: { workoutId: string }
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
export type CustomizeExerciseScreenRouteProp = RouteProp<
  AppStackParamList,
  'CustomizeExercise'
>

// Tipo genérico para `useRoute` no AppStack
export type AppRouteProp<RouteName extends keyof AppStackParamList> = RouteProp<
  AppStackParamList,
  RouteName
>
