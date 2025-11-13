// src/hooks/useSubscriptionStatus.ts
import { useProfileStore } from '../state/profileStore'
import { useMemo } from 'react'

interface SubscriptionStatus {
  planType: 'free' | 'premium' | null
  isPremium: boolean
  isLoading: boolean
}

export const useSubscriptionStatus = (): SubscriptionStatus => {
  const profile = useProfileStore((state) => state.profile)
  const isLoading = useProfileStore((state) => state.isLoading)

  const subscriptionStatus = useMemo(() => {
    const planType = profile?.planType || 'free'
    const isPremium = planType === 'premium'
    return { planType, isPremium, isLoading }
  }, [profile, isLoading])

  return subscriptionStatus
}
