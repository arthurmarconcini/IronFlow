import { useEffect, useState } from 'react'
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin'
import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from '../config/firebaseConfig'
import { Alert } from 'react-native'

export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(auth.currentUser)

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, // Client ID do tipo WEB (necessário para obter o idToken para o Firebase)
      offlineAccess: true,
    })
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()

      // Para o Firebase, precisamos do idToken
      const idToken = userInfo.data?.idToken
      if (!idToken) {
        throw new Error('No ID token found')
      }

      const credential = GoogleAuthProvider.credential(idToken)
      await signInWithCredential(auth, credential)
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // Usuário cancelou o login
            break
          case statusCodes.IN_PROGRESS:
            // Operação já em andamento
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              'Erro',
              'Google Play Services não está disponível ou desatualizado.',
            )
            break
          default:
            Alert.alert('Erro', 'Ocorreu um erro ao fazer login com o Google.')
        }
      } else {
        Alert.alert(
          'Erro',
          'Ocorreu um erro inesperado ao fazer login com o Google.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await GoogleSignin.signOut()
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out: ', error)
    }
  }

  return { user, signInWithGoogle, signOut, isLoading }
}
