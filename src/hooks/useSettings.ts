import { useCallback, useEffect, useState } from 'react'
import { getSettings } from '../services/settings'
import type { BusinessSettings } from '../types/models'

type State = { status: 'loading' | 'ready' | 'error'; data: BusinessSettings | null; error: string | null }

/** Dados do studio (linha única de business_settings). */
export function useSettings() {
  const [state, setState] = useState<State>({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    getSettings().then((r) => {
      if (!active) return
      setState(r.error === null ? { status: 'ready', data: r.data, error: null } : { status: 'error', data: null, error: r.error })
    })
    return () => {
      active = false
    }
  }, [attempt])

  const reload = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    setAttempt((n) => n + 1)
  }, [])

  const replace = useCallback((data: BusinessSettings) => setState({ status: 'ready', data, error: null }), [])

  return { ...state, reload, replace }
}
