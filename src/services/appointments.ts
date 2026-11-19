import type { PostgrestError } from '@supabase/supabase-js'
import type { Appointment, AppointmentStatus } from '../types/models'
import { friendlyError, type Result } from './errors'
import { supabase } from './supabase'

export const SLOT_TAKEN = 'Esse horário já está ocupado.'

/** Atendimento com a cliente junto, para a agenda. */
export type AgendaAppointment = Appointment & {
  client: { id: string; name: string; phone: string }
  total: number
  paid: number
  /** Quando a confirmação / o lembrete foi enviado pelo WhatsApp (null = ainda não) */
  confirmation_sent_at: string | null
  reminder_sent_at: string | null
}

// '*' (e não a lista de colunas): se uma migration nova ainda não rodou, a agenda continua funcionando
const SELECT = '*, appointment_items(service_id, service_name, price, duration_min), clients(id, name, phone), transactions(amount, type, status)'

type JoinedRow = {
  id: string
  client_id: string
  start_at: string
  end_at: string
  status: AppointmentStatus
  notes: string | null
  confirmation_sent_at?: string | null
  reminder_sent_at?: string | null
  appointment_items: { service_id: string; service_name: string; price: number; duration_min: number }[]
  clients: { id: string; name: string; phone: string | null } | null
  transactions: { amount: number; type: 'entrada' | 'saida'; status: 'pago' | 'pendente' }[]
}

const toAppointment = (r: JoinedRow): AgendaAppointment => ({
  total: r.appointment_items.reduce((s, i) => s + Number(i.price), 0),
  // Mesma regra da view appointment_summary: entradas pagas ligadas ao atendimento
  paid: r.transactions.filter((t) => t.type === 'entrada' && t.status === 'pago').reduce((s, t) => s + Number(t.amount), 0),
  id: r.id,
  client_id: r.client_id,
  start_at: r.start_at,
  end_at: r.end_at,
  status: r.status,
  notes: r.notes ?? '',
  confirmation_sent_at: r.confirmation_sent_at ?? null,
  reminder_sent_at: r.reminder_sent_at ?? null,
  items: r.appointment_items.map((i) => ({ ...i, price: Number(i.price) })),
  client: { id: r.clients?.id ?? r.client_id, name: r.clients?.name ?? 'Cliente removida', phone: r.clients?.phone ?? '' },
})

function appointmentError(error: PostgrestError, fallback: string): string {
  // save_appointment devolve HORARIO_OCUPADO; um update direto (troca de status) devolve 23P01
  if (error.message === 'HORARIO_OCUPADO' || error.code === '23P01') return SLOT_TAKEN
  if (error.code === '23514') return 'O fim precisa ser depois do início.'
  // Mensagens em português lançadas pela própria função (raise exception)
  if (error.code === 'P0001' && error.message) return error.message.endsWith('.') ? error.message : `${error.message}.`
  return friendlyError(error, fallback)
}

/** Atendimentos que começam entre `from` (inclusive) e `to` (exclusive), em ordem. */
export async function listAppointments(from: Date, to: Date): Promise<Result<AgendaAppointment[]>> {
  const { data, error } = await supabase
    .from('appointments')
    .select(SELECT)
    .gte('start_at', from.toISOString())
    .lt('start_at', to.toISOString())
    .order('start_at')
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar a agenda.') }
  return { data: (data as unknown as JoinedRow[]).map(toAppointment), error: null }
}

export type SaveAppointmentInput = {
  id?: string
  client_id: string
  start_at: string
  end_at: string
  service_ids: string[]
  notes: string
}

/**
 * Cria ou edita via RPC save_appointment (regra 6): salva atendimento + itens numa transação,
 * copia nome/preço/duração dos serviços e o banco recusa horário sobreposto.
 */
export async function saveAppointment(input: SaveAppointmentInput): Promise<Result<string>> {
  const { data, error } = await supabase.rpc('save_appointment', {
    p_client_id: input.client_id,
    p_start_at: input.start_at,
    p_service_ids: input.service_ids,
    p_notes: input.notes.trim() || null,
    p_id: input.id ?? null,
    p_end_at: input.end_at,
  })
  if (error) return { data: null, error: appointmentError(error, 'Não foi possível salvar o atendimento.') }
  return { data, error: null }
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus): Promise<Result<AppointmentStatus>> {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) return { data: null, error: appointmentError(error, 'Não foi possível mudar o status.') }
  return { data: status, error: null }
}

export type MessageKind = 'confirmation' | 'reminder'

/** Marca que a confirmação ou o lembrete foi enviado pelo WhatsApp (devolve o horário gravado). */
export async function markMessageSent(id: string, kind: MessageKind): Promise<Result<string>> {
  const at = new Date().toISOString()
  const patch = kind === 'confirmation' ? { confirmation_sent_at: at } : { reminder_sent_at: at }
  const { error } = await supabase.from('appointments').update(patch).eq('id', id)
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível marcar como enviado.') }
  return { data: at, error: null }
}
