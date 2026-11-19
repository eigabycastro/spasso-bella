import type { AuthError, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/** Traduz os erros do Supabase Auth para mensagens simples (regra 10). */
function authMessage(error: AuthError): string {
  const code = error.code ?? ''
  if (code === 'invalid_credentials') return 'E-mail ou senha incorretos.'
  if (code === 'email_not_confirmed') return 'Confirme o e-mail antes de entrar (veja a caixa de entrada).'
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || error.status === 429)
    return 'Muitas tentativas. Espere alguns minutos e tente de novo.'
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) return 'Sem conexão. Verifique a internet e tente de novo.'
  return 'Não foi possível entrar agora. Tente de novo.'
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  return { error: error ? authMessage(error) : null }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

/**
 * Ter login não basta: só quem está em public.admins acessa os dados.
 * Usa a função do banco is_admin(), a mesma que as regras de RLS usam.
 */
export async function checkIsAdmin(): Promise<{ isAdmin: boolean; error: string | null }> {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return { isAdmin: false, error: 'Não foi possível verificar seu acesso. Tente de novo.' }
  return { isAdmin: data === true, error: null }
}
