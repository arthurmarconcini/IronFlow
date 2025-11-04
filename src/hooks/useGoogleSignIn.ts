import { useEffect, useState } from 'react'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from '../config/firebaseConfig'
import { Alert } from 'react-native'

// Garante que a janela do navegador feche após a autenticação
WebBrowser.maybeCompleteAuthSession()

export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(auth.currentUser)

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    // Força o uso do esquema nativo, um fluxo mais seguro que o proxy
    redirectUri: makeRedirectUri({ native: 'com.ironflow.app' }),
  })

  useEffect(() => {
    const handleResponse = async () => {
      if (response) {
        setIsLoading(true)
        if (response.type === 'success') {
          const { id_token } = response.params
          const credential = GoogleAuthProvider.credential(id_token)
          try {
            await signInWithCredential(auth, credential)
          } catch (error) {
            console.error('Firebase sign-in error:', error)
            Alert.alert('Erro', 'Não foi possível fazer login com o Google.')
          } finally {
            setIsLoading(false)
          }
        } else {
          // O usuário cancelou o login
          setIsLoading(false)
        }
      }
    }

    handleResponse()
  }, [response])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    // O promptAsync só deve ser chamado se o request estiver pronto
    if (request) {
      await promptAsync()
    } else {
      Alert.alert('Erro', 'A configuração de login do Google não está pronta.')
    }
  }

  return { user, signInWithGoogle, isLoading }
}
