import { useEffect, useCallback } from 'react'
import { DatabaseService } from '../db/DatabaseService'
import { useAuth } from './useAuth'
import { useProfileStore } from '../state/profileStore'
import { useNetworkStore } from '../state/networkStore'
import { SyncService } from '../sync/SyncService'
import { UserProfile } from '../types/database'
import { Timestamp } from 'firebase/firestore'

export const useUserProfile = () => {
  const { user } = useAuth()
  const { setProfile, setInitializationStatus } = useProfileStore()
  const isOnline = useNetworkStore((state) => state.isOnline)

  const initializeProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setInitializationStatus('ready')
      return
    }

    setInitializationStatus('loading')

    if (isOnline) {
      // ONLINE: Firestore é a fonte da verdade.
      const serverProfileData = await SyncService.getProfileFromFirestore(
        user.uid,
      )

      if (serverProfileData) {
        // Usuário existente: Baixa o perfil, salva localmente e finaliza.
        const serverTimestamp = (
          serverProfileData.last_updated_server as Timestamp
        )?.toMillis()
        const profileToSave: Omit<UserProfile, 'id'> = {
          userId: user.uid,
          goal: serverProfileData.goal,
          heightCm: serverProfileData.heightCm,
          currentWeightKg: serverProfileData.currentWeightKg,
          bmi: serverProfileData.bmi,
          bmiCategory: serverProfileData.bmiCategory,
          onboardingCompleted: serverProfileData.onboardingCompleted,
          syncStatus: 'synced',
          lastModifiedLocally: serverProfileData.lastModifiedLocally,
          lastUpdatedServer: serverTimestamp,
        }
        const savedId = await DatabaseService.saveUserProfile(profileToSave)
        setProfile({ ...profileToSave, id: savedId })
      } else {
        // Usuário genuinamente novo (não existe no servidor).
        setProfile(null)
      }
      setInitializationStatus('ready')
    } else {
      // OFFLINE: O banco de dados local é a única fonte.
      const localProfile = await DatabaseService.getUserProfileByUserId(
        user.uid,
      )
      if (localProfile) {
        // Usuário existente em dispositivo conhecido.
        setProfile(localProfile)
        setInitializationStatus('ready')
      } else {
        // AMBIGUIDADE: Usuário logado, offline, sem perfil local.
        // Não podemos prosseguir. Requer conexão para a primeira sincronização.
        setInitializationStatus('needs-online-sync')
      }
    }
  }, [user, isOnline, setProfile, setInitializationStatus])

  useEffect(() => {
    initializeProfile()
  }, [initializeProfile])
}
