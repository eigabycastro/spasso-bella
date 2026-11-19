import { useCallback, useEffect, useState } from 'react'
import type { Result } from '../services/errors'

type State<T> = { status: 'loading' | 'ready' | 'error'; data: T[]; error: string | null }

/**
 * Carrega uma lista de um service e mantém os estados de carregando / pronto / erro (regra 11).
 * `load` precisa ser estável (uma função do service, não uma arrow criada no render).
 */
export function useListResource<T extends { id: string }>(load: () => Promise<Result<T[]>>) {
  const [state, setState] = useState<State<T>>({ status: 'loading', data: [], error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    load().then((r) => {
      if (!active) return
      setState(r.error === null ? { status: 'ready', data: r.data, error: null } : { status: 'error', data: [], error: r.error })
    })
    return () => {
      active = false
    }
  }, [load, attempt])

  const reload = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    setAttempt((n) => n + 1)
  }, [])

  /** Atualiza a lista local depois de criar/editar, sem buscar tudo de novo. */
  const upsert = useCallback((item: T) => {
    setState((s) => ({
      ...s,
      data: s.data.some((x) => x.id === item.id) ? s.data.map((x) => (x.id === item.id ? item : x)) : [...s.data, item],
    }))
  }, [])

  return { ...state, reload, upsert }
}
