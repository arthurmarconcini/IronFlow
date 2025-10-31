import { create } from 'zustand'

interface OnboardingState {
  displayName: string
  goal: string
  dob: string | null
  sex: 'male' | 'female' | 'other' | null
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
  availability: '1-2' | '3-4' | '5+' | null
  heightCm: number | null
  weightKg: number | null
  setOnboardingData: (data: Partial<OnboardingState>) => void
  resetOnboardingData: () => void
}

const initialState: OnboardingState = {
  displayName: '',
  goal: '',
  dob: null,
  sex: null,
  experienceLevel: null,
  availability: null,
  heightCm: null,
  weightKg: null,
  setOnboardingData: () => {},
  resetOnboardingData: () => {},
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setOnboardingData: (data) => set((state) => ({ ...state, ...data })),
  resetOnboardingData: () => set(initialState),
}))
