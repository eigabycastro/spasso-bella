import { AlertTriangle, Cake, CalendarDays, CalendarPlus, ChevronRight, MessageCircle, PackageOpen, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import StatusBadge from '../../components/shared/StatusBadge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useAppointments } from '../../hooks/useAppointments'
import { useListResource } from '../../hooks/useListResource'
import { useSettings } from '../../hooks/useSettings'
import { useToday } from '../../hooks/useToday'
import { listClients } from '../../services/clients'
import { listTransactions } from '../../services/finance'
import { isLowStock, listProducts } from '../../services/inventory'
import { formatQuantity } from '../../utils/formatQuantity'
import { useResource } from '../../hooks/useResource'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatTime } from '../../utils/formatDate'
import { whatsappLink } from '../../utils/whatsappLink'
import { birthdayMessage, DEFAULT_TEMPLATES } from '../../utils/whatsappMessages'
import RemindersCard from './RemindersCard'
import AppointmentFormModal from '../agenda/AppointmentFormModal'

export default function DashboardPage() {
  const today = useToday()
  const month = today.slice(0, 7)
  const [now] = useState(() => new Date())
  const [formKey, setFormKey] = useState<number | null>(null)

  // Reais (banco)
  const appointments = useAppointments(today, 1)
  const clients = useListResource(listClients)
  const settings = useSettings()
  const txs = useResource(`tx/${month}`, () => listTransactions(month))
  const products = useListResource(listProducts)

  const todayList = appointments.data.filter((a) => a.status !== 'cancelado')
  const next = todayList.find((a) => new Date(a.start_at) > now && (a.status === 'agendado' || a.status === 'confirmado'))
  const income = (txs.data ?? []).filter((t) => t.type === 'entrada').reduce((s, t) => s + t.amount, 0)
  const lowStock = products.data.filter(isLowStock)
  const birthdays = clients.data
    .filter((c) => c.birthday?.slice(5, 7) === month.slice(5, 7))
    .sort((a, b) => a.birthday!.slice(8).localeCompare(b.birthday!.slice(8)))

  const templates = settings.data?.message_templates ?? DEFAULT_TEMPLATES
  const dash = (status: string, value: string) => (status === 'ready' ? value : status === 'error' ? '—' : '…')

  return (
    <>
      <PageHeader
        title="Visão geral"
        subtitle="Resumo do seu dia e do mês"
        action={
          <Button onClick={() => setFormKey(Date.now())} disabled={!settings.data}>
            <CalendarPlus size={18} strokeWidth={1.75} aria-hidden />
            Novo atendimento
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Hoje"
          value={dash(appointments.status, String(todayList.length))}
          hint={appointments.status === 'ready' ? (next ? `Próximo às ${formatTime(next.start_at)}` : 'Sem próximos horários') : undefined}
        />
        <StatCard icon={Wallet} label="Faturamento do mês" value={dash(txs.status, formatCurrency(income))} hint="Entradas recebidas" />
        <StatCard icon={Users} label="Clientes" value={dash(clients.status, String(clients.data.length))} hint="Cadastradas" />
        <StatCard icon={PackageOpen} label="Estoque baixo" value={dash(products.status, String(lowStock.length))} hint="Produtos para repor" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
        <Card className="p-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-semibold">Agenda de hoje</h2>
            <Link to="/agenda" className="flex min-h-11 items-center gap-0.5 text-sm text-bordo hover:text-vinho">
              Ver agenda <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
          {appointments.status === 'loading' && <p className="px-5 pb-5 text-sm text-bordo">Carregando…</p>}
          {appointments.status === 'error' && (
            <div className="flex flex-wrap items-center gap-3 px-5 pb-5 text-sm">
              <span>{appointments.error}</span>
              <Button variant="outline" onClick={appointments.reload}>
                Tentar de novo
              </Button>
            </div>
          )}
          {appointments.status === 'ready' &&
            (todayList.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-bordo">Nenhum atendimento hoje.</p>
            ) : (
              <ul className="divide-y divide-rose/25">
                {todayList.map((a) => (
                  <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">{formatTime(a.start_at)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.client.name}</span>
                      <span className="block truncate text-xs text-bordo">{a.items.map((i) => i.service_name).join(' + ')}</span>
                    </span>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            ))}
        </Card>

        <RemindersCard today={today} templates={templates} />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Cake size={18} strokeWidth={1.75} className="text-bordo" aria-hidden />
              Aniversariantes do mês
            </h2>
            {clients.status !== 'ready' ? (
              <p className="text-sm text-bordo">{clients.status === 'error' ? clients.error : 'Carregando…'}</p>
            ) : birthdays.length === 0 ? (
              <p className="text-sm text-bordo">Nenhuma este mês.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {birthdays.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">
                      <span className="tabular-nums text-bordo">{c.birthday!.slice(8)}</span> · {c.name}
                    </span>
                    {c.phone && (
                      <a
                        href={whatsappLink(c.phone, birthdayMessage(templates, c.name))}
                        target="_blank"
                        rel="noreferrer"
                        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-bordo hover:bg-rosa-claro"
                        aria-label={`Enviar parabéns para ${c.name} pelo WhatsApp (abre em nova aba)`}
                      >
                        <MessageCircle size={18} strokeWidth={1.75} aria-hidden />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {lowStock.length > 0 && (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <AlertTriangle size={18} strokeWidth={1.75} className="text-bordo" aria-hidden />
                  Repor estoque
                </h2>
                <Link to="/estoque" className="flex min-h-11 items-center text-sm text-bordo hover:text-vinho">
                  Ver estoque
                </Link>
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 tabular-nums text-bordo">
                      {formatQuantity(p.quantity, p.unit)} / mín. {formatQuantity(p.minimum_stock, p.unit)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {formKey !== null && settings.data && (
        <AppointmentFormModal
          key={formKey}
          day={today}
          settings={settings.data}
          existing={appointments.data}
          onSaved={appointments.reload}
          onClose={() => setFormKey(null)}
        />
      )}
    </>
  )
}
