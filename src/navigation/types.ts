import { StackNavigationProp } from '@react-navigation/stack'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type AppStackParamList = {
  Home: undefined
}

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>
