// Espelham as tabelas planejadas no Supabase (Sprint 02).
// No Sprint 02 serão substituídos/derivados de database.ts gerado pelo Supabase.

export type Client = {
  id: string
  name: string
  phone: string
  birthday: string | null // 'YYYY-MM-DD'
  notes: string
  created_at: string
}

/** Campos editáveis da cliente (formulário → banco). */
export type ClientInput = Pick<Client, 'name' | 'phone' | 'birthday' | 'notes'>

export type ServiceCategory = 'Cabelo' | 'Make' | 'Sobrancelhas' | 'Pele' | 'Cílios' | 'Outros'

export type Service = {
  id: string
  name: string
  category: ServiceCategory
  description: string
  price: number
  duration_min: number
  is_active: boolean
  is_public: boolean
}

/** Campos editáveis do serviço (formulário → banco). */
export type ServiceInput = Omit<Service, 'id'>

export type AppointmentStatus = 'agendado' | 'confirmado' | 'concluido' | 'cancelado' | 'faltou'

/** Regra 5: nome, preço e duração copiados do serviço no momento do agendamento. */
export type AppointmentItem = { service_id: string; service_name: string; price: number; duration_min: number }

export type Appointment = {
  id: string
  client_id: string
  start_at: string // ISO (timestamptz)
  end_at: string
  status: AppointmentStatus
  notes: string
  items: AppointmentItem[]
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito'

export type Transaction = {
  id: string
  type: 'entrada' | 'saida'
  amount: number
  category: string
  /** Obrigatório em entradas; o app também pede em despesas (para o fechamento por forma de pagamento) */
  payment_method: PaymentMethod | null
  appointment_id: string | null
  client_id: string | null
  date: string // 'YYYY-MM-DD' (coluna date, sem hora)
  description: string
  client_name?: string
}

/** Campos de um lançamento novo. */
export type TransactionInput = Omit<Transaction, 'id' | 'client_name'>

export type MovementType = 'entrada' | 'saida' | 'ajuste'

export type DayHours = { open: boolean; start: string; end: string }

/** Pausa diária (almoço). Horários 'HH:mm'. */
/** Textos das mensagens de WhatsApp, com campos {nome}, {data}, {hora}, {servicos}. */
export type MessageTemplates = { confirmation: string; reminder: string; birthday: string }

export type DailyBreak = { enabled: boolean; start: string; end: string }

export type BusinessSettings = {
  business_name: string
  phone: string
  address: string
  instagram: string
  maps_url: string
  /** Nome empresarial (razão social ou nome do MEI) */
  legal_name: string
  /** CNPJ ou CPF, como deve aparecer no site */
  document_id: string
  /** E-mail para assuntos de privacidade (LGPD) */
  contact_email: string
  message_templates: MessageTemplates
  interval_min: number
  opening_hours: DayHours[] // 0 = domingo … 6 = sábado
  lunch: DailyBreak
}
