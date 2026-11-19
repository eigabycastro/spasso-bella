import type { AppointmentStatus, MovementType, PaymentMethod, ServiceCategory } from '../types/models'

export const statusLabels: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
}

export const paymentLabels: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  debito: 'Débito',
  credito: 'Crédito',
}

export const movementLabels: Record<MovementType, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  ajuste: 'Ajuste',
}

export const weekdayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const serviceCategories: ServiceCategory[] = ['Cabelo', 'Make', 'Sobrancelhas', 'Pele', 'Cílios', 'Outros']
