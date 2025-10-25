import { useEffect, useCallback } from 'react'
import { DatabaseService } from '../db/DatabaseService'
import { useAuth } from './useAuth'
import { useProfileStore } from '../state/profileStore'

export const useUserProfile = () => {
  const { user } = useAuth()
  const { setProfile, setIsLoading } = useProfileStore()

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    try {
      setIsLoading(true)
      const userProfile = await DatabaseService.getUserProfileByUserId(user.uid)
      setProfile(userProfile)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setProfile(null)
    }
  }, [user, setProfile, setIsLoading])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])
}
