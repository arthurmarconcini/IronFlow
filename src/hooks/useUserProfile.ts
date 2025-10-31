import { useEffect, useCallback } from 'react'
import { DatabaseService } from '../db/DatabaseService'
import { useAuth } from './useAuth'
import { useProfileStore } from '../state/profileStore'
import { useNetworkStore } from '../state/networkStore'
import { SyncService } from '../sync/SyncService'
import { UserProfile } from '../types/database'
import { Timestamp } from 'firebase/firestore'

/**
 * Hook para gerenciar o perfil do usuário com uma estratégia "local-first"
 * e "hydrate-from-cloud" como fallback.
 */
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

    try {
      // 1. Tenta carregar do banco de dados local primeiro.
      let localProfile = await DatabaseService.getUserProfileByUserId(user.uid)

      // 2. Se não houver perfil local, mas estiver online, tente hidratar do Firestore.
      if (!localProfile && isOnline) {
        const serverProfileData = await SyncService.getProfileFromFirestore(
          user.uid,
        )

        if (serverProfileData) {
          // Transforma os dados do servidor para o formato do banco de dados local
          const serverTimestamp = (
            serverProfileData.last_updated_server as Timestamp
          )?.toMillis()
          const profileToSave: Omit<UserProfile, 'id'> = {
            userId: user.uid,
            planType: serverProfileData.planType,
            displayName: serverProfileData.displayName,
            dob: serverProfileData.dob,
            sex: serverProfileData.sex,
            experienceLevel: serverProfileData.experienceLevel,
            availability: serverProfileData.availability,
            goal: serverProfileData.goal,
            heightCm: serverProfileData.heightCm,
            currentWeightKg: serverProfileData.currentWeightKg,
            bmi: serverProfileData.bmi,
            bmiCategory: serverProfileData.bmiCategory,
            onboardingCompleted: serverProfileData.onboardingCompleted,
            syncStatus: 'synced', // O perfil está sincronizado com o que acabamos de baixar
            lastModifiedLocally: serverProfileData.lastModifiedLocally,
            lastUpdatedServer: serverTimestamp,
          }
          // Salva no banco de dados local
          const savedId = await DatabaseService.saveUserProfile(profileToSave)
          // Atualiza a variável localProfile para ser usada no passo final
          localProfile = { ...profileToSave, id: savedId }
        }
      }

      // 3. Define o perfil no estado global.
      // Se encontrou localmente, usa isso.
      // Se hidratou da nuvem, usa isso.
      // Se não encontrou em lugar nenhum, será `null` e o app irá para o onboarding.
      setProfile(localProfile)
    } catch (error) {
      console.error('Erro ao inicializar o perfil do usuário:', error)
      setProfile(null)
    } finally {
      setInitializationStatus('ready')
    }
  }, [user, isOnline, setProfile, setInitializationStatus])

  useEffect(() => {
    initializeProfile()
  }, [initializeProfile])
}
