import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../config/firebaseConfig'
import StyledInput from '../../components/StyledInput'
import StyledButton from '../../components/StyledButton'
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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.')
      return
    }

    setIsLoading(true)
    try {
      // Apenas cria o usuário. O listener global onAuthStateChanged
      // irá detectar a mudança, e o RootNavigator irá direcionar
      // para o OnboardingStack, pois o perfil ainda não existe.
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error: unknown) {
      console.error('Erro no registro:', error)
      let errorMessage = 'Ocorreu um erro desconhecido.'
      if (error instanceof Error) {
        errorMessage = error.message
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
