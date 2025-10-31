import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebaseConfig'
import { useAuthStore } from '../state/authStore'

// Um estado para garantir que o listener seja inicializado apenas uma vez.
let authListenerInitialized = false

/**
 * Hook para gerenciar e acessar o estado de autenticação do usuário.
 *
 * Este hook integra o listener `onAuthStateChanged` do Firebase com o store global `useAuthStore`.
 *
 * - `useAuth()` chamado na raiz da aplicação (`App.tsx`) inicializa o listener.
 * - O listener atualiza o store global sempre que o estado de autenticação muda.
 * - Qualquer componente que chama `useAuth()` recebe o estado atualizado do store,
 *   garantindo uma única fonte da verdade para a autenticação em toda a aplicação.
 */
export const useAuth = () => {
  const { user, isAuthLoading, setUser, setIsAuthLoading } = useAuthStore()

  useEffect(() => {
    // Garante que o listener seja configurado apenas uma vez em toda a aplicação.
    if (authListenerInitialized) {
      return
    }
    authListenerInitialized = true

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      // Uma vez que o primeiro callback é executado, a verificação inicial está completa.
      setIsAuthLoading(false)
    })

    // Retorna a função de limpeza para desinscrever o listener quando o app for desmontado.
    return () => {
      unsubscribe()
      authListenerInitialized = false // Reseta para hot-reloads no desenvolvimento
    }
  }, [setUser, setIsAuthLoading])

  return { user, loading: isAuthLoading }
}
