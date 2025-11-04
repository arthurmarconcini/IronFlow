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
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn'

import { FontAwesome } from '@expo/vector-icons'
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
  const [attemptCounts, setAttemptCounts] = useState<{
    [email: string]: number
  }>({})
  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleSignIn()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o email e a senha.')
      return
    }

    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Limpa a contagem de tentativas em caso de sucesso
      setAttemptCounts((prev) => ({ ...prev, [email]: 0 }))
      // A navegação é tratada automaticamente pelo RootNavigator
    } catch (error: unknown) {
      let errorMessage = 'Ocorreu um erro inesperado.'
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code: unknown }).code === 'string'
      ) {
        const errorCode = (error as { code: string }).code
        switch (errorCode) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            const currentAttempts = attemptCounts[email] || 0
            const newAttempts = currentAttempts + 1
            setAttemptCounts((prev) => ({ ...prev, [email]: newAttempts }))

            if (newAttempts >= 3) {
              Alert.alert(
                'Muitas Tentativas',
                'Você errou a senha várias vezes. Deseja redefinir sua senha?',
                [
                  { text: 'OK', style: 'cancel' },
                  {
                    text: 'Redefinir Senha',
                    onPress: () => navigation.navigate('ForgotPassword'),
                  },
                ],
              )
              // Limpa a contagem para não mostrar o alerta novamente logo em seguida
              setAttemptCounts((prev) => ({ ...prev, [email]: 0 }))
              return // Sai da função para não mostrar o alerta padrão
            }
            errorMessage = `Email ou senha inválidos. Tentativa ${newAttempts} de 3.`
            break
          case 'auth/invalid-email':
            errorMessage = 'O formato do email é inválido.'
            break
          default:
            errorMessage = `Ocorreu um erro: ${errorCode}`
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
        disabled={isLoading || isGoogleLoading}
      />

      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>OU</Text>
        <View style={styles.separatorLine} />
      </View>

      <StyledButton
        title="Entrar com Google"
        onPress={signInWithGoogle}
        type="secondary"
        icon={<FontAwesome name="google" size={20} color="#DB4437" />}
        isLoading={isGoogleLoading}
        disabled={isGoogleLoading || isLoading}
      />

      {Platform.OS === 'ios' && (
        <StyledButton
          title="Entrar com Apple"
          onPress={() =>
            Alert.alert(
              'Em breve!',
              'Login com Apple será implementado em breve.',
            )
          }
          type="secondary"
          icon={<FontAwesome name="apple" size={20} color="#000000" />}
          disabled={isGoogleLoading || isLoading}
        />
      )}

      <Pressable
        style={styles.navLinkContainer}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.navLinkText}>Esqueceu sua senha?</Text>
      </Pressable>

      <Pressable
        style={styles.navLinkContainer}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.navLinkText}>Não tem uma conta? Cadastre-se</Text>
      </Pressable>
    </KeyboardAvoidingView>
  )
}
