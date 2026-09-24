import { createContext, useContext } from 'react'

export const ShopDataContext = createContext(null)

/**
 * { status: 'loading' | 'ready' | 'error', error, services, barbers, hours, retry,
 *   serviceById(id), barberById(id), serviceBySlug(slug) }
 */
export function useShopData() {
  const ctx = useContext(ShopDataContext)
  if (!ctx) throw new Error('useShopData must be used inside <ShopDataProvider>')
  return ctx
}
