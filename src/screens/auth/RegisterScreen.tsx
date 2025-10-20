import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../config/firebaseConfig'
import { styles } from './styles'

import { AuthNavigationProp } from '../../navigation/types'

export default function RegisterScreen({
  navigation,
}: {
  navigation: AuthNavigationProp
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password).catch((error) => {
      Alert.alert('Registration Error', error.message)
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Register" onPress={handleRegister} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Login"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  )
}
