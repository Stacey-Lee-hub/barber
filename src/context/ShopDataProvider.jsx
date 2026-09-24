import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchShopData } from '../lib/api'
import { slugify } from '../lib/format'
import { ShopDataContext } from './shopDataContext'

const EMPTY = { services: [], barbers: [], hours: [] }

export default function ShopDataProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', error: null, ...EMPTY })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchShopData()
      .then((data) => {
        if (cancelled) return
        const services = data.services.map((s) => ({ ...s, slug: slugify(s.name) }))
        const barbers = data.barbers.map((b) => ({ ...b, slug: slugify(b.name) }))
        setState({ status: 'ready', error: null, services, barbers, hours: data.hours })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', error, ...EMPTY })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      retry,
      serviceById: (id) => state.services.find((s) => s.id === id) ?? null,
      barberById: (id) => state.barbers.find((b) => b.id === id) ?? null,
      serviceBySlug: (slug) => state.services.find((s) => s.slug === slug) ?? null,
    }),
    [state, retry],
  )

  return <ShopDataContext.Provider value={value}>{children}</ShopDataContext.Provider>
}
