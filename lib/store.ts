'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, GeoPosition, ServiceDTO } from './types'
import { DEFAULT_POSITION } from './types'

interface AppState {
  locale: string
  position: GeoPosition
  positionGranted: boolean
  activeCategory: Category | null
  isOffline: boolean
  cachedServices: ServiceDTO[]
  setLocale: (locale: string) => void
  setPosition: (pos: GeoPosition, granted: boolean) => void
  setActiveCategory: (cat: Category | null) => void
  setOffline: (v: boolean) => void
  cacheServices: (services: ServiceDTO[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'fr',
      position: DEFAULT_POSITION,
      positionGranted: false,
      activeCategory: null,
      isOffline: false,
      cachedServices: [],
      setLocale: (locale) => set({ locale }),
      setPosition: (position, positionGranted) => set({ position, positionGranted }),
      setActiveCategory: (activeCategory) => set({ activeCategory }),
      setOffline: (isOffline) => set({ isOffline }),
      cacheServices: (services) =>
        set((s) => ({
          cachedServices: [
            ...services,
            ...s.cachedServices.filter((c) => !services.some((n) => n.id === c.id)),
          ].slice(0, 100),
        })),
    }),
    { name: 'refugemap-store', partialize: (s) => ({ locale: s.locale, cachedServices: s.cachedServices }) }
  )
)
