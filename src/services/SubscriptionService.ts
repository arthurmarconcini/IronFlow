// src/services/SubscriptionService.ts
import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases'
import { Platform } from 'react-native'
import { useProfileStore } from '../state/profileStore'

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID

export const SubscriptionService = {
  async initialize() {
    if (!REVENUECAT_API_KEY_IOS || !REVENUECAT_API_KEY_ANDROID) {
      console.error('RevenueCat API keys are not configured.')
      return
    }

    Purchases.setLogLevel(LOG_LEVEL.DEBUG)

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS })
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID })
    }

    console.log('RevenueCat initialized.')
  },

  async login(userId: string) {
    try {
      const { customerInfo, created } = await Purchases.logIn(userId)
      console.log(`RevenueCat login for user ${userId}. Created: ${created}`)
      this.updateUserSubscriptionStatus(customerInfo)
      return customerInfo
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('Error logging in to RevenueCat:', e.message)
      } else {
        console.error('Unknown error logging in to RevenueCat:', e)
      }
      throw e
    }
  },

  async logout() {
    try {
      const customerInfo = await Purchases.logOut()
      console.log('RevenueCat logged out.')
      this.updateUserSubscriptionStatus(customerInfo)
      return customerInfo
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('Error logging out of RevenueCat:', e.message)
      } else {
        console.error('Unknown error logging out of RevenueCat:', e)
      }
      throw e
    }
  },

  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings()
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        return offerings.current.availablePackages
      }
      return []
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('Error fetching offerings from RevenueCat:', e.message)
      } else {
        console.error('Unknown error fetching offerings from RevenueCat:', e)
      }
      return []
    }
  },

  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg)
      this.updateUserSubscriptionStatus(customerInfo)
      return customerInfo
    } catch (e: unknown) {
      // Check if error is user cancellation
      if (
        typeof e === 'object' &&
        e !== null &&
        'userCancelled' in e &&
        (e as { userCancelled: boolean }).userCancelled
      ) {
        console.log('Purchase cancelled by user.')
        return null
      }

      if (e instanceof Error) {
        console.error('Error purchasing package:', e.message)
      } else {
        console.error('Unknown error purchasing package:', e)
      }
      throw e
    }
  },

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases()
      this.updateUserSubscriptionStatus(customerInfo)
      return customerInfo
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('Error restoring purchases:', e.message)
      } else {
        console.error('Unknown error restoring purchases:', e)
      }
      throw e
    }
  },

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo()
      this.updateUserSubscriptionStatus(customerInfo)
      return customerInfo
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('Error fetching customer info:', e.message)
      } else {
        console.error('Unknown error fetching customer info:', e)
      }
      throw e
    }
  },

  updateUserSubscriptionStatus(customerInfo: CustomerInfo) {
    const isPremium =
      customerInfo.entitlements.active.ironflow_premium !== undefined
    const currentProfile = useProfileStore.getState().profile

    if (currentProfile) {
      const newPlanType = isPremium ? 'premium' : 'free'
      if (currentProfile.planType !== newPlanType) {
        useProfileStore.getState().updateProfile({ planType: newPlanType })
        console.log(`User plan type updated to: ${newPlanType}`)
      }
    }
  },

  // Listen for subscription status changes
  setupPurchasesListener() {
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log('RevenueCat customer info updated:', customerInfo)
      this.updateUserSubscriptionStatus(customerInfo)
    })
  },
}
