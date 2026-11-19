import { addDays } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

export const TIMEZONE = 'America/Sao_Paulo'

/** Formata qualquer data no fuso do studio. Ex.: formatDate(d, "dd/MM 'às' HH:mm") */
export function formatDate(date: Date | string, pattern = 'dd/MM/yyyy'): string {
  return formatInTimeZone(date, TIMEZONE, pattern, { locale: ptBR })
}

export function formatTime(date: Date | string): string {
  return formatDate(date, 'HH:mm')
}

/** Formata uma data sem hora ('YYYY-MM-DD', coluna date) sem trocar de dia por causa do fuso. */
export function formatDay(day: string, pattern = 'dd/MM/yyyy'): string {
  return formatDate(`${day}T15:00:00Z`, pattern)
}

/** 'YYYY-MM-DD' do dia no fuso do studio. */
export function dayKey(date: Date | string): string {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd')
}

/** Converte dia ('YYYY-MM-DD') + hora ('HH:mm') no fuso do studio para Date (UTC). */
export function zonedDateTime(day: string, time: string): Date {
  return fromZonedTime(`${day}T${time}:00`, TIMEZONE)
}

/** Soma dias a um 'YYYY-MM-DD' sem sofrer com fuso. */
export function addDaysToKey(day: string, amount: number): string {
  const d = addDays(new Date(`${day}T12:00:00Z`), amount)
  return d.toISOString().slice(0, 10)
}

/** Dia da semana (0 = domingo) de um 'YYYY-MM-DD'. */
export function weekdayOfKey(day: string): number {
  return new Date(`${day}T12:00:00Z`).getUTCDay()
}

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}
