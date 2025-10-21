import React, { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../hooks/useAuth'
import { theme } from '../theme'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/types'

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SplashScreen'
>

export default function SplashScreen() {
  const { user, loading } = useAuth()
  const navigation = useNavigation<SplashScreenNavigationProp>()

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigation.replace('AppStack')
      } else {
        navigation.replace('AuthStack')
      }
    }
  }, [loading, user, navigation])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.palette.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background,
  },
})
