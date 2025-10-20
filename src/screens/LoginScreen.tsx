import React from 'react'
import { View, Text, Button } from 'react-native'
import { AuthNavigationProp } from '../navigation/types'

export default function LoginScreen({
  navigation,
}: {
  navigation: AuthNavigationProp
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Login Screen</Text>
      <Button
        title="Go to Register"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  )
}
