import { useCallback, useEffect, useState } from 'react'
import { listAppointments, type AgendaAppointment } from '../services/appointments'
import { addDaysToKey, zonedDateTime } from '../utils/formatDate'

type State = { status: 'loading' | 'ready' | 'error'; data: AgendaAppointment[]; error: string | null; key: string }

/** Atendimentos de `days` dias a partir de `firstDay` ('YYYY-MM-DD', fuso do studio). */
export function useAppointments(firstDay: string, days: number) {
  const key = `${firstDay}/${days}`
  const [state, setState] = useState<State>({ status: 'loading', data: [], error: null, key })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const from = zonedDateTime(firstDay, '00:00')
    const to = zonedDateTime(addDaysToKey(firstDay, days), '00:00')
    listAppointments(from, to).then((r) => {
      if (!active) return
      setState(
        r.error === null
          ? { status: 'ready', data: r.data, error: null, key: `${firstDay}/${days}` }
          : { status: 'error', data: [], error: r.error, key: `${firstDay}/${days}` },
      )
    })
    return () => {
      active = false
    }
  }, [firstDay, days, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  // Enquanto o período novo carrega, não mostra dados do período anterior
  const stale = state.key !== key
  return { status: stale ? 'loading' : state.status, data: stale ? [] : state.data, error: state.error, reload }
}
