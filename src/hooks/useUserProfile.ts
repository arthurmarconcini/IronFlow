import { useEffect, useCallback } from 'react'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from './useAuth'
import { useProfileStore } from '../state/profileStore'
import { useNetworkStore } from '../state/networkStore'
import { DatabaseService } from '../db/DatabaseService'
import { SyncService } from '../sync/SyncService'
import { UserProfile } from '../types/database'

/**
 * Hook para gerenciar a inicialização do perfil do usuário.
 * Deve ser chamado uma vez no RootNavigator.
 */
export const useUserProfile = () => {
  const { user, loading } = useAuth()
  const { setProfile, setInitializationStatus } = useProfileStore()
  const isOnline = useNetworkStore((state) => state.isOnline)

  const initializeProfile = useCallback(async () => {
    if (loading) {
      setInitializationStatus('loading')
      return
    }

    if (!user) {
      setProfile(null)
      setInitializationStatus('ready')
      return
    }

    setInitializationStatus('loading')

    try {
      let localProfile = await DatabaseService.getUserProfileByUserId(user.uid)

      if (!localProfile && isOnline) {
        const serverProfileData = await SyncService.getProfileFromFirestore(
          user.uid,
        )

        if (serverProfileData) {
          const serverTimestamp = (
            serverProfileData.last_updated_server as Timestamp
          )?.toMillis()
          const profileToSave: Omit<UserProfile, 'id'> = {
            userId: user.uid,
            planType: serverProfileData.planType ?? 'free',
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
            syncStatus: 'synced',
            lastModifiedLocally: serverProfileData.lastModifiedLocally,
            lastUpdatedServer: serverTimestamp,
          }
          const savedId = await DatabaseService.saveUserProfile(profileToSave)
          localProfile = { ...profileToSave, id: savedId }
        }
      }

      setProfile(localProfile)
    } catch (error) {
      console.error('Erro ao inicializar o perfil do usuário:', error)
      setProfile(null)
    } finally {
      setInitializationStatus('ready')
    }
  }, [user, loading, isOnline, setProfile, setInitializationStatus])

  useEffect(() => {
    initializeProfile()
  }, [initializeProfile])
}
