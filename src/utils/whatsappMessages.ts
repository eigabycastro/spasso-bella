import type { MessageTemplates } from '../types/models'
import { dayKey, formatDate, formatTime } from './formatDate'

/** Textos padrão (usados enquanto ela não personalizar em Configurações). */
export const DEFAULT_TEMPLATES: MessageTemplates = {
  confirmation: 'Olá, {nome}! Aqui é do Spasso Bella 💕 Confirmando seu horário de {servicos} {data} às {hora}. Posso confirmar?',
  reminder: 'Oi, {nome}! Passando para lembrar do seu horário {data} às {hora} no Spasso Bella. Até lá! ✨',
  birthday: 'Feliz aniversário, {nome}! 🎉 O Spasso Bella te deseja um dia lindo, cheio de carinho e autoestima. 💕',
}

/** Campos que ela pode usar nos textos. */
export const TEMPLATE_FIELDS: { field: string; meaning: string }[] = [
  { field: '{nome}', meaning: 'primeiro nome da cliente' },
  { field: '{data}', meaning: '“amanhã”, “hoje” ou o dia (ex.: sexta, 21/11)' },
  { field: '{hora}', meaning: 'horário do atendimento' },
  { field: '{servicos}', meaning: 'procedimentos marcados' },
]

const firstName = (name: string) => name.trim().split(' ')[0]

/** "hoje", "amanhã" ou "na sexta, 21/11", no fuso do studio. */
function when(startAt: string): string {
  const day = dayKey(startAt)
  if (day === dayKey(new Date())) return 'hoje'
  if (day === dayKey(new Date(Date.now() + 86_400_000))) return 'amanhã'
  return `na ${formatDate(startAt, 'EEEE, dd/MM')}`
}

/** Troca {campos} pelos valores; campo desconhecido fica como está. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)
}

type AppointmentInfo = { clientName: string; startAt: string; services: string }

const appointmentValues = (a: AppointmentInfo) => ({
  nome: firstName(a.clientName),
  data: when(a.startAt),
  hora: formatTime(a.startAt),
  servicos: a.services,
})

export const confirmMessage = (t: MessageTemplates, a: AppointmentInfo) => fillTemplate(t.confirmation, appointmentValues(a))
export const reminderMessage = (t: MessageTemplates, a: AppointmentInfo) => fillTemplate(t.reminder, appointmentValues(a))
export const birthdayMessage = (t: MessageTemplates, name: string) => fillTemplate(t.birthday, { nome: firstName(name) })
