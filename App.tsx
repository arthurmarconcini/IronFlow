import React, { useEffect } from 'react'
import RootNavigator from './src/navigation'
import { DatabaseService } from './src/db/DatabaseService'
import { useNetworkStatus } from './src/hooks/useNetworkStatus'
import { useSyncTrigger } from './src/hooks/useSyncTrigger'

export default function App() {
  // Ativa o monitoramento do status da rede para toda a aplicação.
  useNetworkStatus()
  // Ativa os gatilhos de sincronização (ex: quando fica online).
  useSyncTrigger()

  useEffect(() => {
    // Inicializa o banco de dados e as tabelas necessárias.
    DatabaseService.initDB()
  }, [])

  return <RootNavigator />
}
