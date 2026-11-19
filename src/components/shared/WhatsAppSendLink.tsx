import { CheckCheck, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { markMessageSent, type MessageKind } from '../../services/appointments'
import { dayKey, formatDate, formatTime } from '../../utils/formatDate'
import { whatsappLink } from '../../utils/whatsappLink'

type Props = {
  appointmentId: string
  kind: MessageKind
  phone: string
  message: string
  /** Quando já foi enviado (null = ainda não) */
  sentAt: string | null
  label: string
  onSent?: (at: string) => void
  variant?: 'primary' | 'outline' | 'link'
  className?: string
}

const sentLabel = (at: string) =>
  dayKey(at) === dayKey(new Date()) ? `hoje às ${formatTime(at)}` : formatDate(at, "dd/MM 'às' HH:mm")

/**
 * Abre o WhatsApp com a mensagem pronta e marca o envio no banco.
 * Envio manual assistido: quem toca em "enviar" no WhatsApp é a profissional.
 */
export default function WhatsAppSendLink({ appointmentId, kind, phone, message, sentAt, label, onSent, variant = 'outline', className = '' }: Props) {
  const [localSentAt, setLocalSentAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sent = localSentAt ?? sentAt

  async function handleClick() {
    setError(null)
    const r = await markMessageSent(appointmentId, kind)
    if (r.error !== null) return setError('O WhatsApp abriu, mas não deu para marcar como enviado.')
    setLocalSentAt(r.data)
    onSent?.(r.data)
  }

  const styles = {
    primary: 'h-11 justify-center rounded-xl bg-vinho px-4 font-medium text-branco hover:bg-bordo',
    outline: 'h-11 justify-center rounded-xl border border-vinho/40 bg-branco px-4 font-medium text-vinho hover:border-vinho',
    link: 'min-h-11 font-medium text-bordo underline-offset-4 hover:underline',
  }[variant]

  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <a
        href={whatsappLink(phone, message)}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-sm transition-colors ${styles}`}
      >
        <MessageCircle size={16} strokeWidth={1.75} aria-hidden />
        {sent ? `${label} de novo` : label}
        <span className="sr-only"> (abre o WhatsApp em nova aba)</span>
      </a>
      {sent && (
        <span className="inline-flex items-center gap-1 text-xs text-bordo">
          <CheckCheck size={14} strokeWidth={1.75} aria-hidden />
          Enviado {sentLabel(sent)}
        </span>
      )}
      {error && (
        <span role="alert" className="text-xs font-medium text-vinho">
          {error}
        </span>
      )}
    </span>
  )
}
