import type { Database } from '../types/database'
import type { Transaction, TransactionInput } from '../types/models'
import { friendlyError, type Result } from './errors'
import { supabase } from './supabase'

type Row = Database['public']['Tables']['transactions']['Row'] & { clients: { name: string } | null }

const toTransaction = (r: Row): Transaction => ({
  id: r.id,
  type: r.type,
  amount: Number(r.amount),
  category: r.category,
  payment_method: r.payment_method,
  appointment_id: r.appointment_id,
  client_id: r.client_id,
  date: r.date,
  description: r.description ?? '',
  client_name: r.clients?.name,
})

/** Primeiro dia do mês seguinte a 'YYYY-MM'. */
export function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7)
}

/** Lançamentos pagos do mês ('YYYY-MM'), mais recentes primeiro. */
export async function listTransactions(month: string): Promise<Result<Transaction[]>> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, clients(name)')
    .eq('status', 'pago')
    .gte('date', `${month}-01`)
    .lt('date', `${nextMonth(month)}-01`)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar os lançamentos.') }
  return { data: (data as unknown as Row[]).map(toTransaction), error: null }
}

export async function createTransaction(input: TransactionInput): Promise<Result<true>> {
  const { error } = await supabase.from('transactions').insert({
    type: input.type,
    amount: Math.round(input.amount * 100) / 100,
    category: input.category.trim(),
    description: input.description.trim() || null,
    payment_method: input.payment_method,
    status: 'pago',
    date: input.date,
    appointment_id: input.appointment_id,
    client_id: input.client_id,
  })
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível salvar o lançamento.') }
  return { data: true, error: null }
}

/** Para corrigir um lançamento errado: apaga e lança de novo. */
export async function deleteTransaction(id: string): Promise<Result<true>> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível apagar o lançamento.') }
  return { data: true, error: null }
}

export type Categories = { entrada: string[]; saida: string[] }

/** Categorias já usadas, das mais usadas para as menos usadas (não existe tabela de categorias). */
export async function listCategories(): Promise<Result<Categories>> {
  const { data, error } = await supabase.from('transactions').select('type, category').order('created_at', { ascending: false }).limit(2000)
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar as categorias.') }
  const count = { entrada: new Map<string, number>(), saida: new Map<string, number>() }
  for (const t of data) count[t.type].set(t.category, (count[t.type].get(t.category) ?? 0) + 1)
  const sorted = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)
  return { data: { entrada: sorted(count.entrada), saida: sorted(count.saida) }, error: null }
}

/** O mínimo para registrar um pagamento de atendimento (serve para AgendaAppointment e Receivable). */
export type PaymentTarget = {
  id: string
  client_id: string
  client: { name: string }
  items: { service_name: string }[]
  total: number
  paid: number
}

export type Receivable = PaymentTarget & { start_at: string }

/** Atendimentos concluídos no mês com pagamento faltando (view appointment_summary). */
export async function listReceivables(month: string): Promise<Result<Receivable[]>> {
  const { data, error } = await supabase
    .from('appointment_summary')
    .select('id, client_id, start_at, total, paid, clients(name), appointment_items(service_name)')
    .eq('status', 'concluido')
    .gte('start_at', `${month}-01T03:00:00Z`) // 00:00 em São Paulo (UTC−3, sem horário de verão)
    .lt('start_at', `${nextMonth(month)}-01T03:00:00Z`)
    .order('start_at')
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar os valores a receber.') }
  const rows = data as unknown as {
    id: string
    client_id: string
    start_at: string
    total: number
    paid: number
    clients: { name: string } | null
    appointment_items: { service_name: string }[]
  }[]
  return {
    data: rows
      .map((r) => ({
        id: r.id,
        client_id: r.client_id,
        start_at: r.start_at,
        client: { name: r.clients?.name ?? '—' },
        items: r.appointment_items,
        total: Number(r.total),
        paid: Number(r.paid),
      }))
      .filter((r) => r.total - r.paid > 0.004),
    error: null,
  }
}
