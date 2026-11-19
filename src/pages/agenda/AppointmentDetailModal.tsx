import { CalendarClock, CircleCheck, Wallet } from 'lucide-react'
import { useState } from 'react'
import StatusBadge from '../../components/shared/StatusBadge'
import WhatsAppSendLink from '../../components/shared/WhatsAppSendLink'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { setAppointmentStatus, type AgendaAppointment } from '../../services/appointments'
import type { AppointmentStatus, MessageTemplates } from '../../types/models'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate, formatTime } from '../../utils/formatDate'
import { statusLabels } from '../../utils/labels'
import { confirmMessage, reminderMessage } from '../../utils/whatsappMessages'

type Props = {
  appointment: AgendaAppointment
  onClose: () => void
  onStatusChanged: (id: string, status: AppointmentStatus) => void
  onReschedule: (a: AgendaAppointment) => void
  onPay: (a: AgendaAppointment) => void
  templates: MessageTemplates
  /** Depois de marcar confirmação/lembrete como enviado (para recarregar a lista) */
  onMessageSent?: () => void
}

const statuses: AppointmentStatus[] = ['agendado', 'confirmado', 'concluido', 'faltou', 'cancelado']

export default function AppointmentDetailModal({ appointment: a, onClose, onStatusChanged, onReschedule, onPay, templates, onMessageSent }: Props) {
  const [saving, setSaving] = useState<AppointmentStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const names = a.items.map((i) => i.service_name).join(' + ')
  const remaining = Math.max(0, Math.round((a.total - a.paid) * 100) / 100)
  const phone = a.client.phone
  const info = { clientName: a.client.name, startAt: a.start_at, services: names }

  async function changeStatus(status: AppointmentStatus) {
    if (status === a.status || saving) return
    setSaving(status)
    setError(null)
    const result = await setAppointmentStatus(a.id, status)
    setSaving(null)
    if (result.error !== null) return setError(result.error)
    onStatusChanged(a.id, status)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={a.client.name}
      footer={
        <>
          <Button variant="outline" onClick={() => onReschedule(a)} disabled={a.status === 'concluido'}>
            <CalendarClock size={18} strokeWidth={1.75} aria-hidden />
            Remarcar
          </Button>
          {phone ? (
            <WhatsAppSendLink
              appointmentId={a.id}
              kind="confirmation"
              phone={phone}
              message={confirmMessage(templates, info)}
              sentAt={a.confirmation_sent_at}
              label="Confirmar no WhatsApp"
              variant="primary"
              onSent={onMessageSent}
            />
          ) : (
            <Button disabled>Sem telefone</Button>
          )}
        </>
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold first-letter:uppercase">{formatDate(a.start_at, 'EEEE, dd/MM')}</p>
          <p className="text-sm text-bordo tabular-nums">
            {formatTime(a.start_at)} – {formatTime(a.end_at)}
          </p>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <ul className="mt-4 divide-y divide-rose/25 rounded-xl border border-rose/40 text-sm">
        {a.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-3 px-3 py-2">
            <span>{i.service_name}</span>
            <span className="tabular-nums">{formatCurrency(i.price)}</span>
          </li>
        ))}
        <li className="flex justify-between px-3 py-2 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(a.total)}</span>
        </li>
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rosa-claro px-3 py-2.5 text-sm">
        <span>
          {a.paid > 0 ? `Pago ${formatCurrency(a.paid)}` : 'Nada pago ainda'}
          {remaining > 0 ? (
            <>
              {' · '}falta <strong>{formatCurrency(remaining)}</strong>
            </>
          ) : (
            <strong> · pagamento completo</strong>
          )}
        </span>
        {remaining > 0 && a.status !== 'cancelado' && (
          <Button variant="outline" onClick={() => onPay(a)}>
            <Wallet size={16} strokeWidth={1.75} aria-hidden />
            Receber pagamento
          </Button>
        )}
      </div>

      {a.notes && <p className="mt-4 rounded-xl bg-rosa-claro px-3 py-2 text-sm whitespace-pre-line">{a.notes}</p>}

      <h3 className="mt-6 mb-2 text-sm font-semibold">Status</h3>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Status do atendimento">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={a.status === s}
            disabled={!!saving}
            onClick={() => changeStatus(s)}
            className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-sm disabled:opacity-60 sm:h-9 ${
              a.status === s ? 'border-bordo bg-rosa-claro font-medium text-vinho' : 'border-rose/60 text-bordo hover:border-bordo'
            }`}
          >
            {a.status === s && <CircleCheck size={14} strokeWidth={1.75} aria-hidden />}
            {saving === s ? 'Salvando…' : statusLabels[s]}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
          {error}
        </p>
      )}

      {phone && (
        <WhatsAppSendLink
          appointmentId={a.id}
          kind="reminder"
          phone={phone}
          message={reminderMessage(templates, info)}
          sentAt={a.reminder_sent_at}
          label="Enviar lembrete pelo WhatsApp"
          variant="link"
          className="mt-5"
          onSent={onMessageSent}
        />
      )}
    </Modal>
  )
}
