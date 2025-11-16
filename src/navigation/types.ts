import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import {
  Exercise as WorkoutExercise,
  ExerciseDefinition,
} from '../types/database'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

export type OnboardingStackParamList = {
  Welcome: undefined
  Goal: undefined
  Demographics: undefined
  Equipment: undefined
  Experience: undefined
  Biometrics: undefined
  Confirmation: undefined
  FreeWorkoutOffer: undefined
}

export type AppTabParamList = {
  HomeTab: undefined
  ScheduleTab: undefined
  StatsTab: undefined
  ProfileTab: undefined
}

export type AppStackParamList = {
  AppTabs: { screen: keyof AppTabParamList }
  Profile: undefined
  ProfileEdit: undefined
  CreateWorkout: { workoutId?: string }
  AddExercise: undefined
  AddManualExercise: undefined
  CustomizeExercise: { exercise: WorkoutExercise; index: number }
  WorkoutExecution: { workoutId: string }
  WorkoutDetails: { workoutId: string }
  WorkoutPlans: undefined
  WorkoutPlanDetails: { planId: string }
  Premium: { blockedFeatureMessage?: string } | undefined
  ExerciseDetail: { exercise: ExerciseDefinition }
}

export type RootStackParamList = {
  App: undefined // Corresponde ao AppStack inteiro
  Premium: { blockedFeatureMessage?: string } | undefined
}

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>
export type OnboardingNavigationProp =
  StackNavigationProp<OnboardingStackParamList>
export type AppNavigationProp = StackNavigationProp<AppStackParamList>
export type RootNavigationProp = StackNavigationProp<RootStackParamList>

// Tipos para Route Prop (para acessar route.params)
export type ConfirmationScreenRouteProp = RouteProp<
  OnboardingStackParamList,
  'Confirmation'
>
export type FreeWorkoutOfferScreenRouteProp = RouteProp<
  OnboardingStackParamList,
  'FreeWorkoutOffer'
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
