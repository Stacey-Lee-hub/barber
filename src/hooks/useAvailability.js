import { useCallback, useEffect, useState } from 'react'
import { getAvailability } from '../lib/api'

const IDLE = { status: 'idle', slots: [], reason: null, error: null }

/** Live availability for a service/barber/date from the get-availability Edge Function. */
export default function useAvailability({ serviceId, barberId, date, refreshKey = 0 }) {
  const [state, setState] = useState(IDLE)
  const [nonce, setNonce] = useState(0)
  const ready = Boolean(serviceId && barberId && date)

  const [lastRequest, setLastRequest] = useState(null)
  const requestKey = ready ? `${serviceId}|${barberId}|${date}|${refreshKey}|${nonce}` : null
  if (requestKey !== lastRequest) {
    setLastRequest(requestKey)
    setState(ready ? { ...IDLE, status: 'loading' } : IDLE)
  }

  useEffect(() => {
    if (!ready) return undefined
    let cancelled = false
    getAvailability({ serviceId, barberId, date })
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', slots: data.slots ?? [], reason: data.reason, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', slots: [], reason: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [ready, serviceId, barberId, date, refreshKey, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, reload }
}
