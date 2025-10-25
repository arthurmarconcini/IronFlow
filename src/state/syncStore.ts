import { create } from 'zustand'

interface SyncState {
  isSyncing: boolean
  setIsSyncing: (isSyncing: boolean) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  setIsSyncing: (isSyncing) => set({ isSyncing }),
}))
