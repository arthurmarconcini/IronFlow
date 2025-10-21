import { StackNavigationProp } from '@react-navigation/stack'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type AppStackParamList = {
  HomeScreen: undefined
  Profile: undefined
  CreateWorkout: undefined
  WorkoutDetail: { workoutId: number }
}

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>
export type AppNavigationProp = StackNavigationProp<AppStackParamList>
