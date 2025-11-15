import { useNavigation } from '@react-navigation/native'
import { useSubscriptionStatus } from './useSubscriptionStatus'
import { RootNavigationProp } from '../navigation/types'

export const usePremiumAction = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const { isPremium } = useSubscriptionStatus()

  const handlePremiumAction = (
    action: () => void,
    blockedFeatureMessage?: string,
  ) => {
    if (isPremium) {
      action()
    } else {
      navigation.navigate('Premium', { blockedFeatureMessage })
    }
  }

  return { handlePremiumAction }
}
