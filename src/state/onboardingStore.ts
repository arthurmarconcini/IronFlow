import { create } from 'zustand'

interface OnboardingState {
  displayName: string
  goal: string
  dob: Date | null
  sex: 'male' | 'female' | 'other' | null
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
  availability: 'daily' | '3-4_times_week' | '1-2_times_week' | null
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
