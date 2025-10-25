import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { app } from '../config/firebaseConfig'
import { DatabaseService } from '../db/DatabaseService'
import { useNetworkStore } from '../state/networkStore'

const firestoreDb = getFirestore(app)
const BASE_RETRY_DELAY = 1000 * 60 // 1 minuto
const MAX_RETRIES = 5

/**
 * Sincroniza os perfis de usuário locais com o Firestore usando uma máquina de estados e backoff.
 */
const syncUserProfile = async (user: User | null) => {
  const isOnline = useNetworkStore.getState().isOnline
  if (!isOnline || !user) {
    return
  }

  try {
    const recordsToSync = await DatabaseService.getRecordsToSync()
    if (recordsToSync.length === 0) {
      return
    }

    for (const profile of recordsToSync) {
      if (profile.userId !== user.uid) continue

      const docRef = doc(firestoreDb, 'user_profiles', user.uid)

      // Prepara os dados para o Firestore, removendo chaves que não devem ser sincronizadas
      const profileDataForFirestore = { ...profile }
      delete profileDataForFirestore.id // Remove o ID do SQLite

      // Remove campos de controle de sincronização se forem nulos/undefined para não enviá-los
      if (!profileDataForFirestore.retryCount)
        delete profileDataForFirestore.retryCount
      if (!profileDataForFirestore.nextRetryTimestamp)
        delete profileDataForFirestore.nextRetryTimestamp

      try {
        // 1. Mudar estado para 'SYNCING' para prevenir escritas concorrentes
        await DatabaseService.updateUserProfile(profile.id!, {
          syncStatus: 'syncing',
        })

        // 2. Enviar para o Firestore
        await setDoc(docRef, profileDataForFirestore, { merge: true })

        // 3. Em sucesso, atualizar para 'SYNCED' e resetar retry
        await DatabaseService.updateUserProfile(profile.id!, {
          syncStatus: 'synced',
          retryCount: 0,
          nextRetryTimestamp: null, // Usa null em vez de undefined
        })
        console.log(`Perfil do usuário ${user.uid} sincronizado com sucesso.`)
      } catch (error) {
        // 4. Em falha, implementar backoff exponencial
        console.error(
          `Falha ao sincronizar perfil para ${user.uid}. Erro do Firebase:`,
          JSON.stringify(error, null, 2),
        )
        const currentRetryCount = profile.retryCount ?? 0

        if (currentRetryCount < MAX_RETRIES) {
          const newRetryCount = currentRetryCount + 1
          const delay = BASE_RETRY_DELAY * Math.pow(2, newRetryCount)
          const nextRetryTimestamp = Date.now() + delay

          await DatabaseService.updateUserProfile(profile.id!, {
            syncStatus: 'error',
            retryCount: newRetryCount,
            nextRetryTimestamp,
          })
        } else {
          // Se exceder o máximo de tentativas, mantém em 'error' mas para de tentar
          await DatabaseService.updateUserProfile(profile.id!, {
            syncStatus: 'error',
          })
          console.warn(
            `Máximo de tentativas de sincronização atingido para o perfil ${user.uid}.`,
          )
        }
      }
    }
  } catch (dbError) {
    console.error('Erro ao buscar registros para sincronização:', dbError)
  }
}

export const SyncService = {
  syncUserProfile,
}
