import { useEffect, useRef } from 'react'
import { useNetworkStore } from '../state/networkStore'
import { useAuth } from './useAuth'
import { SyncService } from '../sync/SyncService'

/**
 * Hook que dispara a sincronização de dados quando o aplicativo fica online.
 * Deve ser usado uma vez no componente raiz (ex: App.tsx).
 */
export const useSyncTrigger = () => {
  const { user } = useAuth()
  const isOnline = useNetworkStore((state) => state.isOnline)
  const wasOffline = useRef(!isOnline) // Rastreia o estado anterior

  useEffect(() => {
    // Verifica se o estado mudou de offline para online
    if (isOnline && wasOffline.current) {
      console.log('Conexão reestabelecida, disparando sincronização...')
      SyncService.syncUserProfile(user)
    }
    // Atualiza o estado anterior para a próxima renderização
    wasOffline.current = !isOnline
  }, [isOnline, user])
}
