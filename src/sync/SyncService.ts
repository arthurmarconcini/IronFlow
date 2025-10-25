import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { User } from 'firebase/auth'
import { app } from '../config/firebaseConfig'
import { DatabaseService } from '../db/DatabaseService'
import { useNetworkStore } from '../state/networkStore'
import { useSyncStore } from '../state/syncStore'

const firestoreDb = getFirestore(app)
const BASE_RETRY_DELAY = 1000 * 60 // 1 minuto
const MAX_RETRIES = 5

const syncUserProfile = async (user: User | null) => {
  const isOnline = useNetworkStore.getState().isOnline
  if (!isOnline || !user) {
    return
  }

  const { setIsSyncing } = useSyncStore.getState()
  setIsSyncing(true)

  try {
    const recordsToSync = await DatabaseService.getRecordsToSync()
    if (recordsToSync.length === 0) return

    for (const profile of recordsToSync) {
      if (profile.userId !== user.uid) continue

      const docRef = doc(firestoreDb, 'user_profiles', user.uid)

      try {
        await DatabaseService.updateUserProfile(profile.id!, {
          syncStatus: 'syncing',
        })

        const serverDoc = await getDoc(docRef)

        if (serverDoc.exists()) {
          const serverData = serverDoc.data()
          const serverTimestamp =
            (serverData.last_updated_server as Timestamp)?.toMillis() ?? 0

          if (serverTimestamp > profile.lastModifiedLocally) {
            console.warn(
              `Conflito detectado para o perfil ${user.uid}. O servidor tem dados mais recentes. Atualizando localmente.`,
            )
            await DatabaseService.updateUserProfile(profile.id!, {
              goal: serverData.goal,
              heightCm: serverData.heightCm,
              currentWeightKg: serverData.currentWeightKg,
              bmi: serverData.bmi,
              bmiCategory: serverData.bmiCategory,
              syncStatus: 'synced',
              lastUpdatedServer: serverTimestamp,
            })
            continue
          }
        }

        // Prepara um objeto limpo para o Firestore, sem metadados locais.
        const profileDataForFirestore = {
          userId: profile.userId,
          goal: profile.goal,
          heightCm: profile.heightCm,
          currentWeightKg: profile.currentWeightKg,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
          onboardingCompleted: profile.onboardingCompleted,
          lastModifiedLocally: profile.lastModifiedLocally,
          last_updated_server: serverTimestamp(),
        }

        await setDoc(docRef, profileDataForFirestore, { merge: true })

        // Sucesso: Atualiza o status local de forma segura
        const updatedDoc = await getDoc(docRef)
        const updatedServerTimestamp = (
          updatedDoc.data()?.last_updated_server as Timestamp
        )?.toMillis()

        await DatabaseService.updateUserProfile(profile.id!, {
          syncStatus: 'synced',
          retryCount: 0,
          nextRetryTimestamp: undefined,
          lastUpdatedServer: updatedServerTimestamp,
        })
        console.log(`Perfil do usuário ${user.uid} sincronizado com sucesso.`)
      } catch (error) {
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
  } finally {
    setIsSyncing(false)
  }
}

/**
 * Busca o perfil de um usuário diretamente do Firestore.
 * @param userId - O ID do usuário.
 * @returns Os dados do perfil ou null se não existir.
 */
const getProfileFromFirestore = async (userId: string) => {
  try {
    const docRef = doc(firestoreDb, 'user_profiles', userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar perfil do Firestore:', error)
    return null
  }
}

export const SyncService = {
  syncUserProfile,
  getProfileFromFirestore,
}
