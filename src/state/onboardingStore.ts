import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface OnboardingState {
  displayName: string
  goal: 'GAIN_MASS' | 'FAT_LOSS' | 'STRENGTH' | 'MAINTAIN' | null
  dob: string | null
  sex: 'male' | 'female' | 'other' | null
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
  availability: '1-2' | '3-4' | '5+' | null
  equipment: 'full' | 'limited' | null
  heightCm: number | null
  weightKg: number | null
  setOnboardingData: (data: Partial<OnboardingState>) => void
  resetOnboardingData: () => void
}

const initialState: Omit<
  OnboardingState,
  'setOnboardingData' | 'resetOnboardingData'
> = {
  displayName: '',
  goal: null,
  dob: null,
  sex: null,
  experienceLevel: null,
  availability: null,
  equipment: null,
  heightCm: null,
  weightKg: null,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setOnboardingData: (data) => set((state) => ({ ...state, ...data })),
      resetOnboardingData: () => set(initialState),
    }),
    {
      name: 'onboarding-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
