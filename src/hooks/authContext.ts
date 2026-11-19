import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AuthStatus =
  | 'loading' // verificando sessão
  | 'signed-out' // sem login
  | 'not-admin' // logada, mas fora de public.admins
  | 'admin' // pode usar o Manager
  | 'error' // falha ao verificar acesso

export type AuthState = {
  status: AuthStatus
  session: Session | null
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  retry: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
