import { BellRing } from 'lucide-react'
import WhatsAppSendLink from '../../components/shared/WhatsAppSendLink'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useAppointments } from '../../hooks/useAppointments'
import type { MessageTemplates } from '../../types/models'
import { addDaysToKey, formatDay, formatTime } from '../../utils/formatDate'
import { reminderMessage } from '../../utils/whatsappMessages'

/**
 * Lembretes de amanhã: um toque por cliente abre o WhatsApp com a mensagem pronta
 * e marca como enviado. Quem ainda não recebeu fica no topo.
 */
export default function RemindersCard({ today, templates }: { today: string; templates: MessageTemplates }) {
  const tomorrow = addDaysToKey(today, 1)
  const appointments = useAppointments(tomorrow, 1)

  const list = appointments.data
    .filter((a) => a.status === 'agendado' || a.status === 'confirmado')
    .sort((a, b) => Number(!!a.reminder_sent_at) - Number(!!b.reminder_sent_at) || a.start_at.localeCompare(b.start_at))
  const sent = list.filter((a) => a.reminder_sent_at).length

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5 pb-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <BellRing size={18} strokeWidth={1.75} className="text-bordo" aria-hidden />
          Lembretes de amanhã
          <span className="text-sm font-normal text-bordo first-letter:uppercase">· {formatDay(tomorrow, 'EEEE, dd/MM')}</span>
        </h2>
        {list.length > 0 && (
          <p className="text-sm text-bordo" aria-live="polite">
            {sent === list.length ? 'Todos enviados' : `${sent} de ${list.length} enviados`}
          </p>
        )}
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
        (list.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-bordo">Nenhum atendimento marcado para amanhã.</p>
        ) : (
          <ul className="divide-y divide-rose/25">
            {list.map((a) => {
              const services = a.items.map((i) => i.service_name).join(' + ')
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                  <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">{formatTime(a.start_at)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{a.client.name}</span>
                    <span className="block truncate text-xs text-bordo">{services}</span>
                  </span>
                  {a.client.phone ? (
                    <WhatsAppSendLink
                      appointmentId={a.id}
                      kind="reminder"
                      phone={a.client.phone}
                      message={reminderMessage(templates, { clientName: a.client.name, startAt: a.start_at, services })}
                      sentAt={a.reminder_sent_at}
                      label="Enviar lembrete"
                      onSent={appointments.reload}
                    />
                  ) : (
                    <span className="text-xs text-bordo">Sem telefone cadastrado</span>
                  )}
                </li>
              )
            })}
          </ul>
        ))}
    </Card>
  )
}
