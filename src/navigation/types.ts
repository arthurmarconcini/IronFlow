import { StackNavigationProp } from '@react-navigation/stack'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type AppStackParamList = {
  Profile: undefined
  CreateWorkout: undefined
}

export type RootStackParamList = {
  SplashScreen: undefined
  AuthStack: undefined
  AppStack: undefined
}

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>
export type AppNavigationProp = StackNavigationProp<AppStackParamList>
