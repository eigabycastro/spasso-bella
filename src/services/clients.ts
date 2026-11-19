import type { Database } from '../types/database'
import type { AppointmentStatus, Client, ClientInput } from '../types/models'
import { friendlyError, type Result } from './errors'
import { supabase } from './supabase'

type Row = Database['public']['Tables']['clients']['Row']

const toClient = (r: Row): Client => ({
  id: r.id,
  name: r.name,
  phone: r.phone ?? '',
  birthday: r.birthday,
  notes: r.notes ?? '',
  created_at: r.created_at,
})

const toRow = (c: ClientInput) => ({
  name: c.name.trim(),
  phone: c.phone.trim() || null,
  birthday: c.birthday || null,
  notes: c.notes.trim() || null,
})

/** Todas as clientes, em ordem alfabética. Um studio tem poucas centenas: a busca é feita na tela. */
export async function listClients(): Promise<Result<Client[]>> {
  const { data, error } = await supabase.from('clients').select('*').order('name')
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar as clientes.') }
  return { data: data.map(toClient), error: null }
}

export async function createClient(input: ClientInput): Promise<Result<Client>> {
  const { data, error } = await supabase.from('clients').insert(toRow(input)).select().single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível salvar a cliente.') }
  return { data: toClient(data), error: null }
}

export async function updateClient(id: string, input: ClientInput): Promise<Result<Client>> {
  const { data, error } = await supabase.from('clients').update(toRow(input)).eq('id', id).select().single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível salvar as alterações.') }
  return { data: toClient(data), error: null }
}

export type ClientHistoryItem = {
  id: string
  start_at: string
  status: AppointmentStatus
  services: string
}

export type ClientHistory = { appointments: ClientHistoryItem[]; totalPaid: number }

/** Atendimentos e total pago de uma cliente. */
export async function getClientHistory(clientId: string): Promise<Result<ClientHistory>> {
  const [appts, payments] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, start_at, status, appointment_items(service_name)')
      .eq('client_id', clientId)
      .order('start_at', { ascending: false })
      .limit(50),
    supabase.from('transactions').select('amount').eq('client_id', clientId).eq('type', 'entrada').eq('status', 'pago'),
  ])
  if (appts.error || payments.error)
    return { data: null, error: friendlyError(appts.error ?? payments.error, 'Não foi possível carregar o histórico.') }

  return {
    data: {
      appointments: appts.data.map((a) => ({
        id: a.id,
        start_at: a.start_at,
        status: a.status,
        services: a.appointment_items.map((i) => i.service_name).join(' + '),
      })),
      totalPaid: payments.data.reduce((sum, t) => sum + Number(t.amount), 0),
    },
    error: null,
  }
}

/**
 * Direito de eliminação (LGPD art. 18, VI): apaga os dados pessoais da cliente.
 * Os atendimentos e pagamentos continuam, mas anônimos — há obrigação fiscal de guardá-los (art. 16, I).
 */
export async function anonymizeClient(id: string): Promise<Result<Client>> {
  // Observações dos atendimentos podem conter dados pessoais (ex.: saúde): também são apagadas
  const notes = await supabase.from('appointments').update({ notes: null }).eq('client_id', id)
  if (notes.error) return { data: null, error: friendlyError(notes.error, 'Não foi possível excluir os dados.') }
  const { data, error } = await supabase
    .from('clients')
    .update({ name: 'Cliente removida', phone: null, birthday: null, notes: null })
    .eq('id', id)
    .select()
    .single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível excluir os dados.') }
  return { data: toClient(data), error: null }
}

/** Direito de acesso e portabilidade (LGPD art. 18, II e V): tudo o que existe sobre a cliente, em formato aberto. */
export async function exportClientData(client: Client): Promise<Result<Blob>> {
  const [appts, payments] = await Promise.all([
    supabase
      .from('appointments')
      .select('start_at, end_at, status, notes, appointment_items(service_name, price, duration_min)')
      .eq('client_id', client.id)
      .order('start_at'),
    supabase.from('transactions').select('date, amount, payment_method, description').eq('client_id', client.id).order('date'),
  ])
  if (appts.error || payments.error)
    return { data: null, error: friendlyError(appts.error ?? payments.error, 'Não foi possível gerar o arquivo.') }

  const content = {
    gerado_em: new Date().toISOString(),
    controlador: 'Spasso Bella MG',
    cliente: { nome: client.name, telefone: client.phone || null, aniversario: client.birthday, observacoes: client.notes || null, cadastrada_em: client.created_at },
    atendimentos: appts.data,
    pagamentos: payments.data,
  }
  return { data: new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }), error: null }
}
