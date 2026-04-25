import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CaseItem {
  id: string
  title: string
  brand: string
  industry: string
  creativeType: string
  platform: string
  concept: string
  highlights: string[]
  reusablePattern: string
  tags: string[]
  sourceUrl?: string
  addedAt: string
}

export type ModelProvider = 'deepseek' | 'qwen'

interface SparkStore {
  apiKey: string
  qwenApiKey: string
  model: ModelProvider
  setApiKey: (key: string) => void
  setQwenApiKey: (key: string) => void
  setModel: (model: ModelProvider) => void
  caseLibrary: CaseItem[]
  addCase: (item: CaseItem) => void
  removeCase: (id: string) => void
}

export const useSparkStore = create<SparkStore>()(
  persist(
    (set) => ({
      apiKey: '',
      qwenApiKey: '',
      model: 'deepseek',
      setApiKey: (key) => set({ apiKey: key }),
      setQwenApiKey: (key) => set({ qwenApiKey: key }),
      setModel: (model) => set({ model }),
      caseLibrary: [],
      addCase: (item) =>
        set((state) => ({ caseLibrary: [item, ...state.caseLibrary] })),
      removeCase: (id) =>
        set((state) => ({
          caseLibrary: state.caseLibrary.filter((c) => c.id !== id),
        })),
    }),
    { name: 'spark-store' }
  )
)
