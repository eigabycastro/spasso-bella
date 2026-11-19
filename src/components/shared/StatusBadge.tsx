import { Ban, CalendarClock, CircleCheck, CircleCheckBig, UserX } from 'lucide-react'
import type { AppointmentStatus } from '../../types/models'
import { statusLabels } from '../../utils/labels'

// Status sempre com ícone + texto, nunca só cor
const styles: Record<AppointmentStatus, { cls: string; icon: typeof Ban }> = {
  agendado: { cls: 'border border-rose text-bordo bg-branco', icon: CalendarClock },
  confirmado: { cls: 'bg-rose/30 text-vinho', icon: CircleCheck },
  concluido: { cls: 'bg-vinho text-branco', icon: CircleCheckBig },
  cancelado: { cls: 'bg-rosa-claro text-bordo line-through', icon: Ban },
  faltou: { cls: 'bg-rosa-claro text-bordo', icon: UserX },
}

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { cls, icon: Icon } = styles[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <Icon size={12} strokeWidth={1.75} aria-hidden />
      {statusLabels[status]}
    </span>
  )
}
