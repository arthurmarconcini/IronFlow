import { create } from 'zustand'
import { UserProfile } from '../types/database'

type UnitSystem = 'metric' | 'imperial'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  unitSystem: UnitSystem
  setProfile: (profile: UserProfile | null) => void
  setIsLoading: (isLoading: boolean) => void
  setUnitSystem: (system: UnitSystem) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: true,
  unitSystem: 'metric', // Padrão para métrico
  setProfile: (profile) => set({ profile, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setUnitSystem: (system) => set({ unitSystem: system }),
}))
