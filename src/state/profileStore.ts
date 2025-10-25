import { create } from 'zustand'
import { UserProfile } from '../types/database'

type UnitSystem = 'metric' | 'imperial'
type InitializationStatus = 'loading' | 'ready' | 'needs-online-sync'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  unitSystem: UnitSystem
  initializationStatus: InitializationStatus
  setProfile: (profile: UserProfile | null) => void
  setIsLoading: (isLoading: boolean) => void
  setUnitSystem: (system: UnitSystem) => void
  setInitializationStatus: (status: InitializationStatus) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: true,
  unitSystem: 'metric',
  initializationStatus: 'loading',
  setProfile: (profile) => set({ profile, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setUnitSystem: (system) => set({ unitSystem: system }),
  setInitializationStatus: (status) => set({ initializationStatus: status }),
}))
