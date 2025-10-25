import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useNetworkStore } from '../state/networkStore'

/**
 * Hook que monitora o status da conexão de rede e atualiza um estado global (Zustand).
 * Este hook deve ser usado uma vez no componente raiz do aplicativo (ex: App.tsx)
 * para garantir que o listener de rede esteja sempre ativo.
 */
export const useNetworkStatus = () => {
  const setOnline = useNetworkStore((state) => state.setOnline)

  useEffect(() => {
    // Adiciona um listener que é chamado sempre que o estado da rede muda.
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Atualiza o estado global com base na propriedade isConnected.
      // O valor pode ser null em alguns casos iniciais, então tratamos como 'false'.
      setOnline(state.isConnected ?? false)
    })

    // A função de limpeza é retornada para remover o listener quando o componente
    // que usa o hook for desmontado, evitando vazamentos de memória.
    return () => {
      unsubscribe()
    }
  }, [setOnline])
}
