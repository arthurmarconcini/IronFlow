import React, { useEffect, useState } from 'react'
import RootNavigator from './src/navigation'
import { DatabaseService } from './src/db/DatabaseService'
import { useNetworkStatus } from './src/hooks/useNetworkStatus'
import { useSyncTrigger } from './src/hooks/useSyncTrigger'
import { useAuth } from './src/hooks/useAuth' // Importar o hook
import SplashScreen from './src/screens/SplashScreen'
import Toast from 'react-native-toast-message'

import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function App() {
  const [isDbLoading, setIsDbLoading] = useState(true)

  // Ativa o listener de autenticação para toda a aplicação.
  useAuth()
  // Ativa o monitoramento do status da rede para toda a aplicação.
  useNetworkStatus()
  // Ativa os gatilhos de sincronização (ex: quando fica online).
  useSyncTrigger()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Inicializa o banco de dados e as tabelas necessárias.
        await DatabaseService.initDB()
      } catch (e) {
        console.error('Failed to initialize the database', e)
        // TODO: Tratar o erro de inicialização, talvez mostrando uma tela de erro.
      } finally {
        setIsDbLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isDbLoading) {
    return <SplashScreen />
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <Toast />
    </GestureHandlerRootView>
  )
}
