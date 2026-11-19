import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Falta configurar o .env.local? A tela de login mostra um aviso em vez de quebrar o app. */
export const supabaseConfigError: string | null = !url
  ? 'Falta VITE_SUPABASE_URL no .env.local'
  : !/^https:\/\/.+\.supabase\.co\/?$/.test(url)
    ? 'VITE_SUPABASE_URL deve ser a URL do projeto (https://xxxx.supabase.co)'
    : !key
      ? 'Falta VITE_SUPABASE_ANON_KEY no .env.local'
      : /^sb_secret_/.test(key) || key.includes('service_role')
        ? 'A chave no .env.local é SECRETA. Use a chave pública (publishable/anon).'
        : null

/**
 * Cliente único do Supabase. Só os arquivos de src/services/ podem importar isto (regra 1).
 * Usa apenas a chave pública; o acesso aos dados é controlado pelo RLS + public.is_admin().
 */
export const supabase = createClient<Database>(
  supabaseConfigError ? 'https://invalid.supabase.co' : url!,
  supabaseConfigError ? 'invalid' : key!,
  { auth: { persistSession: true, autoRefreshToken: true } },
)
