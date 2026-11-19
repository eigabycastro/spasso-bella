import { CalendarOff, CalendarPlus, ChevronLeft, ChevronRight, Coffee } from 'lucide-react'
import { useState } from 'react'
import ErrorState from '../../components/shared/ErrorState'
import LoadingState from '../../components/shared/LoadingState'
import PageHeader from '../../components/shared/PageHeader'
import StatusBadge from '../../components/shared/StatusBadge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ChipGroup from '../../components/ui/ChipGroup'
import { useAppointments } from '../../hooks/useAppointments'
import { useSettings } from '../../hooks/useSettings'
import { useToday } from '../../hooks/useToday'
import type { AgendaAppointment } from '../../services/appointments'
import type { BusinessSettings } from '../../types/models'
import { formatCurrency } from '../../utils/formatCurrency'
import { addDaysToKey, dayKey, formatDay, formatTime, weekdayOfKey } from '../../utils/formatDate'
import TransactionFormModal from '../financeiro/TransactionFormModal'
import AppointmentDetailModal from './AppointmentDetailModal'
import AppointmentFormModal from './AppointmentFormModal'

type View = 'dia' | 'semana'

export default function AgendaPage() {
  const today = useToday()
  const settings = useSettings()
  const [view, setView] = useState<View>('dia')
  const [day, setDay] = useState(today)
  const [form, setForm] = useState<{ key: number; editing: AgendaAppointment | null } | null>(null)
  const [detail, setDetail] = useState<AgendaAppointment | null>(null)
  const [paying, setPaying] = useState<{ key: number; appointment: AgendaAppointment } | null>(null)

  // Carrega sempre a semana inteira (segunda a domingo) do dia escolhido
  const weekStart = addDaysToKey(day, -((weekdayOfKey(day) + 6) % 7))
  const weekDays = Array.from({ length: 7 }, (_, i) => addDaysToKey(weekStart, i))
  const appointments = useAppointments(weekStart, 7)
  const ofDay = (k: string) => appointments.data.filter((a) => dayKey(a.start_at) === k)

  const step = view === 'dia' ? 1 : 7
  const title =
    view === 'dia' ? formatDay(day, "EEEE, d 'de' MMMM") : `${formatDay(weekDays[0], 'd MMM')} – ${formatDay(weekDays[6], 'd MMM')}`

  const openNew = () => setForm({ key: Date.now(), editing: null })
  const status = settings.status === 'error' || appointments.status === 'error' ? 'error' : settings.status === 'loading' || appointments.status === 'loading' ? 'loading' : 'ready'

  return (
    <>
      <PageHeader
        title="Agenda"
        action={
          <Button onClick={openNew} disabled={!settings.data}>
            <CalendarPlus size={18} strokeWidth={1.75} aria-hidden />
            Novo atendimento
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setDay(addDaysToKey(day, -step))} className="flex size-11 items-center justify-center rounded-lg text-bordo hover:bg-branco" aria-label="Anterior">
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setDay(today)}
            disabled={day === today}
            className="h-11 rounded-full border border-rose/60 bg-branco px-4 text-sm font-medium text-bordo disabled:opacity-50 sm:h-9"
          >
            Hoje
          </button>
          <button type="button" onClick={() => setDay(addDaysToKey(day, step))} className="flex size-11 items-center justify-center rounded-lg text-bordo hover:bg-branco" aria-label="Próximo">
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
          <h2 className="ml-2 font-semibold first-letter:uppercase">{title}</h2>
        </div>
        <ChipGroup
          label="Visualização"
          hideLabel
          value={view}
          onChange={setView}
          options={[
            { value: 'dia', label: 'Dia' },
            { value: 'semana', label: 'Semana' },
          ]}
        />
      </div>

      {status === 'loading' && <LoadingState rows={4} label="Carregando agenda…" />}
      {status === 'error' && (
        <ErrorState
          message={settings.error ?? appointments.error ?? 'Não foi possível carregar a agenda.'}
          onRetry={() => {
            if (settings.status === 'error') settings.reload()
            appointments.reload()
          }}
        />
      )}

      {status === 'ready' && settings.data && (
        <>
          {view === 'dia' ? (
            <DayList items={ofDay(day)} day={day} settings={settings.data} onSelect={setDetail} onNew={openNew} />
          ) : (
            <div className="grid gap-3 lg:grid-cols-7">
              {weekDays.map((k) => {
                const items = ofDay(k)
                const isToday = k === today
                const closed = !settings.data!.opening_hours[weekdayOfKey(k)].open
                return (
                  <Card key={k} className={`p-3 ${isToday ? 'ring-1 ring-bordo' : ''}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setDay(k)
                        setView('dia')
                      }}
                      className="mb-2 flex min-h-11 w-full items-baseline justify-between text-left lg:flex-col lg:items-start"
                    >
                      <span className="text-xs font-medium uppercase tracking-wide text-bordo">{formatDay(k, 'EEE')}</span>
                      <span className="text-lg font-semibold">{formatDay(k, 'dd/MM')}</span>
                    </button>
                    {items.length === 0 ? (
                      <p className="text-xs text-bordo">{closed ? 'Fechado' : 'Livre'}</p>
                    ) : (
                      <ul className="flex flex-col gap-1.5">
                        {items.map((a) => (
                          <li key={a.id}>
                            <button
                              type="button"
                              onClick={() => setDetail(a)}
                              className={`w-full rounded-lg border-l-2 px-2 py-1.5 text-left text-xs ${
                                a.status === 'cancelado' || a.status === 'faltou'
                                  ? 'border-rose/50 bg-rosa-claro/50 text-bordo line-through'
                                  : 'border-vinho bg-rosa-claro hover:bg-rose/25'
                              }`}
                            >
                              <span className="font-semibold tabular-nums">{formatTime(a.start_at)}</span>{' '}
                              <span>{a.client.name.split(' ')[0]}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {form && settings.data && (
        <AppointmentFormModal
          key={form.key}
          day={day}
          settings={settings.data}
          existing={appointments.data}
          editing={form.editing}
          onSaved={appointments.reload}
          onClose={() => setForm(null)}
        />
      )}
      {detail && settings.data && (
        <AppointmentDetailModal
          appointment={detail}
          onClose={() => setDetail(null)}
          onStatusChanged={(_, s) => {
            setDetail({ ...detail, status: s })
            appointments.reload()
          }}
          onReschedule={(a) => {
            setDetail(null)
            setForm({ key: Date.now(), editing: a })
          }}
          templates={settings.data.message_templates}
          onMessageSent={appointments.reload}
          onPay={(a) => {
            setDetail(null)
            setPaying({ key: Date.now(), appointment: a })
          }}
        />
      )}
      {paying && (
        <TransactionFormModal
          key={paying.key}
          appointment={paying.appointment}
          onSaved={appointments.reload}
          onClose={() => setPaying(null)}
        />
      )}
    </>
  )
}

type DayListProps = {
  day: string
  items: AgendaAppointment[]
  settings: BusinessSettings
  onSelect: (a: AgendaAppointment) => void
  onNew: () => void
}

function DayList({ day, items, settings, onSelect, onNew }: DayListProps) {
  const hours = settings.opening_hours[weekdayOfKey(day)]

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-rosa-claro text-bordo">
          <CalendarOff size={26} strokeWidth={1.75} aria-hidden />
        </span>
        <p className="font-semibold">{hours.open ? 'Nenhum atendimento neste dia' : 'Studio fechado neste dia'}</p>
        {hours.open && (
          <>
            <p className="text-sm text-bordo">
              Aberto das {hours.start} às {hours.end}
              {settings.lunch.enabled && ` · almoço ${settings.lunch.start}–${settings.lunch.end}`}
            </p>
            <Button variant="outline" onClick={onNew}>
              Marcar horário
            </Button>
          </>
        )}
      </Card>
    )
  }

  // Almoço entra na lista na posição certa (antes do primeiro atendimento que começa depois dele)
  const showLunch = hours.open && settings.lunch.enabled
  const lunchIndex = showLunch ? items.findIndex((a) => formatTime(a.start_at) >= settings.lunch.start) : -1
  const rows: (AgendaAppointment | 'lunch')[] = [...items]
  if (showLunch) rows.splice(lunchIndex === -1 ? rows.length : lunchIndex, 0, 'lunch')

  return (
    <ol className="flex flex-col gap-3">
      {rows.map((a) => {
        if (a === 'lunch') {
          return (
            <li key="lunch" className="flex items-center gap-4 rounded-2xl border border-dashed border-rose/60 px-4 py-2.5 text-sm text-bordo">
              <span className="w-14 shrink-0 tabular-nums">{settings.lunch.start}</span>
              <Coffee size={16} strokeWidth={1.75} aria-hidden />
              Almoço até {settings.lunch.end}
            </li>
          )
        }
        const total = a.items.reduce((s, i) => s + i.price, 0)
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onSelect(a)}
              className={`flex w-full items-stretch gap-4 rounded-2xl border border-rose/30 bg-branco p-4 text-left transition hover:ring-1 hover:ring-rose`}
            >
              <span className="flex w-14 shrink-0 flex-col border-r border-rose/40 pr-3 tabular-nums">
                <span className="font-semibold">{formatTime(a.start_at)}</span>
                <span className="text-xs text-bordo">{formatTime(a.end_at)}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`truncate font-medium ${a.status === 'cancelado' ? 'line-through' : ''}`}>{a.client.name}</span>
                  <StatusBadge status={a.status} />
                </span>
                <span className="mt-0.5 block truncate text-sm text-bordo">{a.items.map((i) => i.service_name).join(' + ')}</span>
                <span className="mt-1 block text-xs text-bordo tabular-nums">{formatCurrency(total)}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
