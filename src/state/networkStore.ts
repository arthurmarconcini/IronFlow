import { create } from 'zustand'

interface NetworkState {
  isOnline: boolean
  setOnline: (isOnline: boolean) => void
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true, // Assume online como estado inicial
  setOnline: (isOnline) => set({ isOnline }),
}))
