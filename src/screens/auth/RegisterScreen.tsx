import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../config/firebaseConfig'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator'
import { theme } from '../../theme'
import { AuthNavigationProp } from '../../navigation/types'

type Props = {
  navigation: AuthNavigationProp
}

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const passwordStrength = useMemo(() => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return strength
  }, [password])

  const isPasswordStrong = passwordStrength >= 2 // Define "forte" como 2 de 4

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.')
      return
    }

    if (!isPasswordStrong) {
      Alert.alert(
        'Senha Fraca',
        'Sua senha não atinge os critérios mínimos de segurança.',
      )
      return
    }

    setIsLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error: unknown) {
      console.error('Erro no registro:', error)
      let errorMessage = 'Ocorreu um erro desconhecido.'
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code: unknown }).code === 'string'
      ) {
        switch ((error as { code: string }).code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este email já está em uso.'
            break
          case 'auth/invalid-email':
            errorMessage = 'O formato do email é inválido.'
            break
          case 'auth/weak-password':
            errorMessage = 'A senha é muito fraca. Tente uma mais forte.'
            break
          default:
            errorMessage = `Ocorreu um erro: ${(error as { code: string }).code}`
            break
        }
      }
      Alert.alert('Erro no Registro', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Crie sua Conta</Text>
        <StyledInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <StyledInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          isPassword
        />
        <PasswordStrengthIndicator strength={passwordStrength} />
        <StyledInput
          placeholder="Confirme a Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
        />
        <StyledButton
          title="Registrar"
          onPress={handleRegister}
          isLoading={isLoading}
          disabled={!isPasswordStrong || isLoading}
        />
        <StyledButton
          title="Já tenho uma conta"
          onPress={() => navigation.navigate('Login')}
          type="secondary"
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.medium,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
})

export default RegisterScreen
