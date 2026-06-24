import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ResearchStore {
  researchList: string[]
  addToResearch: (itemSlug: string) => void
  removeFromResearch: (itemSlug: string) => void
  clearResearch: () => void
  isInResearch: (itemSlug: string) => boolean
}

export const useResearchStore = create<ResearchStore, [['zustand/persist', ResearchStore]]>(
  persist(
    (set, get) => ({
      researchList: [],
      addToResearch: (itemSlug) =>
        set((state) => ({
          researchList: state.researchList.includes(itemSlug)
            ? state.researchList
            : [...state.researchList, itemSlug],
        })),
      removeFromResearch: (itemSlug) =>
        set((state) => ({
          researchList: state.researchList.filter((slug) => slug !== itemSlug),
        })),
      clearResearch: () => set({ researchList: [] }),
      isInResearch: (itemSlug) => get().researchList.includes(itemSlug),
    }),
    {
      name: 'research-list-storage',
    }
  )
)
