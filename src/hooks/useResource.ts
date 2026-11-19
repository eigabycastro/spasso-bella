import { useCallback, useEffect, useRef, useState } from 'react'
import type { Result } from '../services/errors'

type State<T> = { key: string; status: 'loading' | 'ready' | 'error'; data: T | null; error: string | null }

/**
 * Busca dados que dependem de parâmetros (ex.: o mês). Quando `key` muda, busca de novo.
 * Estados de carregando / pronto / erro (regra 11). `reload` busca de novo sem apagar a tela.
 */
export function useResource<T>(key: string, fetcher: () => Promise<Result<T>>) {
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })
  const [state, setState] = useState<State<T>>({ key, status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    fetcherRef.current().then((r) => {
      if (!active) return
      setState(r.error === null ? { key, status: 'ready', data: r.data, error: null } : { key, status: 'error', data: null, error: r.error })
    })
    return () => {
      active = false
    }
  }, [key, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  const stale = state.key !== key
  return { status: stale ? ('loading' as const) : state.status, data: stale ? null : state.data, error: stale ? null : state.error, reload }
}
