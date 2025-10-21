import React, { useState } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha o email e a senha.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Navigation will be handled automatically by the RootNavigator
    } catch (e: unknown) {
      // Map Firebase error codes to user-friendly messages
      if (typeof e === 'object' && e !== null && 'code' in e) {
        const error = e as { code: string }
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError('Email ou senha inválidos.')
            break
          case 'auth/invalid-email':
            setError('O formato do email é inválido.')
            break
          default:
            setError('Ocorreu um erro ao tentar fazer login.')
            break
        }
      } else {
        setError('Ocorreu um erro inesperado.')
      }
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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
