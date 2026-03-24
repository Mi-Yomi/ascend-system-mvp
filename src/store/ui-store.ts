import { create } from 'zustand'

export type Tab = 'home' | 'quests' | 'log' | 'profile'

interface Snack {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIState {
  activeTab: Tab
  setTab: (tab: Tab) => void
  snack: Snack | null
  showSnack: (message: string, type?: 'success' | 'error' | 'info') => void
  hideSnack: () => void
  showTransfer: boolean
  setShowTransfer: (v: boolean) => void
}

let snackCounter = 0

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'home',
  setTab: (tab) => set({ activeTab: tab }),
  snack: null,
  showSnack: (message, type = 'info') => {
    const id = ++snackCounter
    set({ snack: { id, message, type } })
    setTimeout(() => {
      set((s) => (s.snack?.id === id ? { snack: null } : s))
    }, 2800)
  },
  hideSnack: () => set({ snack: null }),
  showTransfer: false,
  setShowTransfer: (v) => set({ showTransfer: v }),
}))
