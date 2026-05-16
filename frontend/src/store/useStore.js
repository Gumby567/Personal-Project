import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

// Persisted store: holds sessionId + lightweight cart count
export const useStore = create(
  persist(
    (set, get) => ({
      // Session
      sessionId: uuidv4(),

      // Cart item count (synced from API response)
      cartCount: 0,
      setCartCount: (n) => set({ cartCount: n }),

      // Admin mode toggle (no real auth for this project scope)
      isAdmin: false,
      toggleAdmin: () => set(s => ({ isAdmin: !s.isAdmin })),

      // Order confirmation state (after checkout)
      lastOrder: null,
      setLastOrder: (order) => set({ lastOrder: order }),
      clearLastOrder: () => set({ lastOrder: null }),
    }),
    {
      name: 'bookstore-store',
      partialize: (s) => ({ sessionId: s.sessionId, isAdmin: s.isAdmin }),
    }
  )
)
