import { friendlyError, type Result } from './errors'
import { nextMonth } from './finance'
import { supabase } from './supabase'

export type Report = {
  months: { month: string; total: number }[]
  topServices: { name: string; count: number }[]
  /** Média do valor dos atendimentos concluídos no mês atual */
  ticket: number
  done: number
  noShow: number
}

/** 00:00 do dia 1 do mês em São Paulo (UTC−3, sem horário de verão). */
const monthStartUtc = (month: string) => `${month}-01T03:00:00Z`

/** Relatório dos 6 meses até `currentMonth` ('YYYY-MM'), inclusive. */
export async function getReport(currentMonth: string): Promise<Result<Report>> {
  const months: string[] = []
  for (let i = 5, m = currentMonth; i >= 0; i--) {
    months.unshift(m)
    const [y, mm] = m.split('-').map(Number)
    m = new Date(Date.UTC(y, mm - 2, 1)).toISOString().slice(0, 7)
  }
  const first = months[0]
  const end = nextMonth(currentMonth)

  const [incomes, items, statuses, ticketRows] = await Promise.all([
    supabase.from('transactions').select('date, amount').eq('type', 'entrada').eq('status', 'pago').gte('date', `${first}-01`).lt('date', `${end}-01`),
    supabase
      .from('appointment_items')
      .select('service_name, appointments!inner(status, start_at)')
      .eq('appointments.status', 'concluido')
      .gte('appointments.start_at', monthStartUtc(first))
      .lt('appointments.start_at', monthStartUtc(end)),
    supabase.from('appointments').select('status').gte('start_at', monthStartUtc(first)).lt('start_at', monthStartUtc(end)),
    supabase.from('appointment_summary').select('total').eq('status', 'concluido').gte('start_at', monthStartUtc(currentMonth)).lt('start_at', monthStartUtc(end)),
  ])

  const error = incomes.error ?? items.error ?? statuses.error ?? ticketRows.error
  if (error || !incomes.data || !items.data || !statuses.data || !ticketRows.data)
    return { data: null, error: friendlyError(error, 'Não foi possível carregar os relatórios.') }

  const byMonth = new Map(months.map((m) => [m, 0]))
  for (const t of incomes.data) {
    const m = t.date.slice(0, 7)
    byMonth.set(m, (byMonth.get(m) ?? 0) + Number(t.amount))
  }

  const counts = new Map<string, number>()
  for (const i of items.data) counts.set(i.service_name, (counts.get(i.service_name) ?? 0) + 1)

  const totals = ticketRows.data.map((r) => Number(r.total))

  return {
    data: {
      months: months.map((month) => ({ month, total: byMonth.get(month) ?? 0 })),
      topServices: [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
      ticket: totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0,
      done: statuses.data.filter((a) => a.status === 'concluido').length,
      noShow: statuses.data.filter((a) => a.status === 'faltou').length,
    },
    error: null,
  }
}
