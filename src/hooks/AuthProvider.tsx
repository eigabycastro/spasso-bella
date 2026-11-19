import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as auth from '../services/auth'
import { supabaseConfigError } from '../services/supabase'
import { AuthContext, type AuthState, type AuthStatus } from './authContext'

type AdminCheck = { userId: string; status: AuthStatus; error: string | null }

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(supabaseConfigError ? null : undefined)
  const [check, setCheck] = useState<AdminCheck | null>(null)
  const [attempt, setAttempt] = useState(0)

  // Sessão salva + mudanças (login, logout, token renovado)
  useEffect(() => {
    if (supabaseConfigError) return
    let active = true
    auth.getSession().then((s) => active && setSession(s))
    const unsubscribe = auth.onAuthChange((s) => setSession(s))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  // Verifica se a usuária logada é a administradora (fora do callback do Supabase, como a doc recomenda)
  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return
    let active = true
    auth.checkIsAdmin().then(({ isAdmin, error }) => {
      if (!active) return
      setCheck({ userId, status: error ? 'error' : isAdmin ? 'admin' : 'not-admin', error })
    })
    return () => {
      active = false
    }
  }, [userId, attempt])

  const signOut = useCallback(async () => {
    await auth.signOut()
    setCheck(null)
  }, [])

  const value = useMemo<AuthState>(() => {
    let status: AuthStatus
    if (session === undefined) status = 'loading'
    else if (!session) status = 'signed-out'
    else if (!check || check.userId !== session.user.id) status = 'loading'
    else status = check.status

    return {
      status,
      session: session ?? null,
      error: supabaseConfigError ?? (check?.userId === session?.user.id ? check?.error ?? null : null),
      signIn: auth.signIn,
      signOut,
      retry: () => setAttempt((n) => n + 1),
    }
  }, [session, check, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
