import type { PostgrestError } from '@supabase/supabase-js'

/** Converte erros do banco em mensagens simples para a usuária (regra 10). */
export function friendlyError(error: PostgrestError | Error | null | undefined, fallback: string): string {
  if (!error) return fallback
  const code = 'code' in error ? error.code : ''
  const message = error.message ?? ''

  if (/Failed to fetch|NetworkError|Load failed|fetch failed/i.test(message)) return 'Sem conexão. Verifique a internet e tente de novo.'
  if (code === 'PGRST301' || /JWT expired/i.test(message)) return 'Sua sessão expirou. Saia e entre de novo.'
  // Coluna/tabela que o app espera ainda não existe: falta aplicar migration
  if (code === 'PGRST204' || code === 'PGRST205' || code === '42703')
    return 'O banco precisa de uma atualização (migrations em supabase/migrations). Avise quem cuida do sistema.'
  if (code === '42501') return 'Sem permissão para fazer isso. Saia e entre de novo.'
  if (code === '23503') return 'Não dá para apagar: existem registros ligados a este item.'
  if (code === '23514') return 'Algum valor está fora do permitido. Confira os campos.'
  return fallback
}

export type Result<T> = { data: T; error: null } | { data: null; error: string }
