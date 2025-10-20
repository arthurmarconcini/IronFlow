import React from 'react'
import { View, Text, Button } from 'react-native'
import { auth } from '../config/firebaseConfig'

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button title="Sign Out" onPress={() => auth.signOut()} />
    </View>
  )
}
