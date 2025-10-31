import React, { useState } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../config/firebaseConfig'
import { styles } from './styles'
import { AuthNavigationProp } from '../../navigation/types'

import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'

export default function LoginScreen({
  navigation,
}: {
  navigation: AuthNavigationProp
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o email e a senha.')
      return
    }

    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // A navegação é tratada automaticamente pelo RootNavigator ao detectar o usuário
    } catch (error: unknown) {
      let errorMessage = 'Ocorreu um erro inesperado.'
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code: unknown }).code === 'string'
      ) {
        switch ((error as { code: string }).code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Email ou senha inválidos.'
            break
          case 'auth/invalid-email':
            errorMessage = 'O formato do email é inválido.'
            break
          default:
            errorMessage = `Ocorreu um erro: ${(error as { code: string }).code}`
            break
        }
      }
      Alert.alert('Erro de Login', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>IronFlow</Text>
      </View>

      <StyledInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <StyledInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        isPassword
      />

      <StyledButton
        title="Entrar"
        onPress={handleLogin}
        isLoading={isLoading}
        disabled={isLoading}
      />

      <Pressable
        style={styles.navLinkContainer}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.navLinkText}>Não tem uma conta? Cadastre-se</Text>
      </Pressable>
    </KeyboardAvoidingView>
  )
}
