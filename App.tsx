import React, { useEffect, useState } from 'react'
import RootNavigator from './src/navigation'
import { DatabaseService } from './src/db/DatabaseService'
import { useNetworkStatus } from './src/hooks/useNetworkStatus'
import { useSyncTrigger } from './src/hooks/useSyncTrigger'
import SplashScreen from './src/screens/SplashScreen' // Importar o SplashScreen

export default function App() {
  const [isDbLoading, setIsDbLoading] = useState(true)

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

  return <RootNavigator />
}
