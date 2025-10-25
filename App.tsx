import React, { useEffect } from 'react'
import RootNavigator from './src/navigation'
import { DatabaseService } from './src/db/DatabaseService'

export default function App() {
  useEffect(() => {
    // Inicializa o banco de dados e as tabelas necessárias.
    DatabaseService.initDB()
  }, [])

  return <RootNavigator />
}
