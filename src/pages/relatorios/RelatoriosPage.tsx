import { CalendarCheck, ChartColumn, Receipt, UserX } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import EmptyState from '../../components/shared/EmptyState'
import ErrorState from '../../components/shared/ErrorState'
import LoadingState from '../../components/shared/LoadingState'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import Card from '../../components/ui/Card'
import { useResource } from '../../hooks/useResource'
import { useToday } from '../../hooks/useToday'
import { getReport } from '../../services/reports'
import { cssToken } from '../../utils/cssToken'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDay } from '../../utils/formatDate'

const compactBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 })

function ChartTooltip({ active, payload, label, money }: TooltipContentProps<ValueType, NameType> & { money?: boolean }) {
  if (!active || !payload?.length) return null
  const value = Number(payload[0].value)
  return (
    <div className="rounded-xl border border-rose/40 bg-branco px-3 py-2 text-sm shadow-sm">
      <p className="text-xs text-bordo first-letter:uppercase">{label}</p>
      <p className="font-semibold tabular-nums">{money ? formatCurrency(value) : `${value} ${value === 1 ? 'atendimento' : 'atendimentos'}`}</p>
    </div>
  )
}

export default function RelatoriosPage() {
  const currentMonth = useToday().slice(0, 7)
  const report = useResource(`report/${currentMonth}`, () => getReport(currentMonth))
  // Cores dos tokens (SVG não aceita var() em atributos)
  const [colors] = useState(() => ({ vinho: cssToken('vinho'), bordo: cssToken('bordo'), rose: cssToken('rose'), rosaClaro: cssToken('rosa-claro') }))
  const axisTick = { fill: colors.bordo, fontSize: 12 }

  const r = report.data
  const revenue = r?.months.map((m) => ({ ...m, label: formatDay(`${m.month}-01`, 'MMM') })) ?? []
  const hasRevenue = revenue.some((m) => m.total > 0)
  const attended = r ? r.done + r.noShow : 0
  const noShowRate = r && attended ? Math.round((r.noShow / attended) * 100) : 0

  return (
    <>
      <PageHeader title="Relatórios" subtitle="Últimos 6 meses" />

      {report.status === 'loading' && <LoadingState rows={3} label="Carregando relatórios…" />}
      {report.status === 'error' && <ErrorState message={report.error!} onRetry={report.reload} />}

      {report.status === 'ready' && r && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={Receipt} label="Ticket médio do mês" value={formatCurrency(r.ticket)} hint="Valor médio dos atendimentos concluídos" />
            <StatCard icon={CalendarCheck} label="Atendimentos concluídos" value={String(r.done)} hint="Nos últimos 6 meses" />
            <StatCard icon={UserX} label="Faltas" value={`${noShowRate}%`} hint={`${r.noShow} de ${attended} atendimentos`} />
          </div>

          {!hasRevenue && r.topServices.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={ChartColumn}
                title="Ainda sem dados para os gráficos"
                description="Os gráficos aparecem quando houver pagamentos recebidos e atendimentos concluídos."
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-4 font-semibold">Faturamento por mês</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenue} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke={colors.rose} strokeOpacity={0.35} />
                      <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
                      <YAxis tick={axisTick} tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => compactBRL.format(v)} />
                      <Tooltip cursor={{ fill: colors.rosaClaro }} content={(p) => <ChartTooltip {...p} money />} />
                      <Bar isAnimationActive={false} dataKey="total" name="Faturamento" fill={colors.vinho} radius={[4, 4, 0, 0]} maxBarSize={44} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <details className="mt-3 text-sm">
                  <summary className="min-h-11 cursor-pointer py-2 text-bordo">Ver tabela</summary>
                  <table className="mt-2 w-full">
                    <tbody>
                      {revenue.map((m) => (
                        <tr key={m.month} className="border-t border-rose/20">
                          <td className="py-1.5 first-letter:uppercase">{formatDay(`${m.month}-01`, "MMMM 'de' yyyy")}</td>
                          <td className="py-1.5 text-right tabular-nums">{formatCurrency(m.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </Card>

              <Card>
                <h2 className="mb-4 font-semibold">Serviços mais realizados</h2>
                {r.topServices.length === 0 ? (
                  <p className="text-sm text-bordo">Aparece quando houver atendimentos concluídos.</p>
                ) : (
                  <div style={{ height: Math.max(120, r.topServices.length * 42) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={r.topServices} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }} barCategoryGap="28%">
                        <CartesianGrid horizontal={false} stroke={colors.rose} strokeOpacity={0.35} />
                        <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={axisTick} tickLine={false} axisLine={false} width={140} />
                        <Tooltip cursor={{ fill: colors.rosaClaro }} content={(p) => <ChartTooltip {...p} />} />
                        <Bar
                          isAnimationActive={false}
                          dataKey="count"
                          name="Atendimentos"
                          fill={colors.vinho}
                          radius={[0, 4, 4, 0]}
                          maxBarSize={22}
                          label={{ position: 'right', fill: colors.vinho, fontSize: 12 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </>
  )
}
