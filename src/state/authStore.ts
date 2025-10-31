import { create } from 'zustand'
import { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  isAuthLoading: boolean
  setUser: (user: User | null) => void
  setIsAuthLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthLoading: true, // Começa como true até o primeiro check do Firebase terminar
  setUser: (user) => set({ user }),
  setIsAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),
}))
