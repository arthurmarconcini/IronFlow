import React, { useState } from 'react'
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../config/firebaseConfig'
import { styles } from './styles'
import { AuthNavigationProp } from '../../navigation/types'

import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import { theme } from '../../theme'

export default function ForgotPasswordScreen({
  navigation,
}: {
  navigation: AuthNavigationProp
}) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, preencha o email.')
      return
    }

    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      Alert.alert(
        'Sucesso',
        'Um email de redefinição de senha foi enviado para o seu email.',
      )
      navigation.navigate('Login')
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
            errorMessage = 'Não há usuário correspondente a este email.'
            break
          case 'auth/invalid-email':
            errorMessage = 'O formato do email é inválido.'
            break
          default:
            errorMessage = `Ocorreu um erro: ${(error as { code: string }).code}`
            break
        }
      }
      Alert.alert('Erro', errorMessage)
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
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Recuperar Senha
        </Text>
      </View>

      <StyledInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <StyledButton
        title="Enviar Email de Redefinição"
        onPress={handlePasswordReset}
        isLoading={isLoading}
        disabled={isLoading}
      />

      <StyledButton
        title="Voltar para o Login"
        onPress={() => navigation.navigate('Login')}
        type="secondary"
      />
    </KeyboardAvoidingView>
  )
}
