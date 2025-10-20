import React from 'react'
import { View, Text, Button } from 'react-native'

import { AuthNavigationProp } from '../navigation/types'

export default function RegisterScreen({
  navigation,
}: {
  navigation: AuthNavigationProp
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Register Screen</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  )
}
