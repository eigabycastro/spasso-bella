import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Check, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useListResource } from '../../hooks/useListResource'
import { saveAppointment, SLOT_TAKEN, type AgendaAppointment } from '../../services/appointments'
import { listServices } from '../../services/catalog'
import { createClient, listClients } from '../../services/clients'
import type { BusinessSettings, ClientInput } from '../../types/models'
import { formatCurrency } from '../../utils/formatCurrency'
import { dayKey, formatTime, minutesToLabel, weekdayOfKey, zonedDateTime } from '../../utils/formatDate'
import ClientFormModal from '../clientes/ClientFormModal'

const schema = z.object({
  client_id: z.string().min(1, 'Escolha a cliente'),
  service_ids: z.array(z.string()).min(1, 'Escolha ao menos um serviço'),
  day: z.string().min(1, 'Informe a data'),
  start: z.string().min(1, 'Informe o início'),
  end: z.string(), // vazio = usar o fim sugerido
  notes: z.string(),
})

type FormValues = z.infer<typeof schema>

const addMinutes = (time: string, min: number) => {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + min
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

type Props = {
  day: string
  settings: BusinessSettings
  /** Atendimentos já carregados na tela, para avisos de folga e para detalhar conflitos */
  existing: AgendaAppointment[]
  /** Preenchido = remarcar/editar */
  editing?: AgendaAppointment | null
  onClose: () => void
  onSaved: () => void
}

/** Renderize com `key` diferente a cada abertura para o formulário começar limpo. */
export default function AppointmentFormModal({ day, settings, existing, editing, onClose, onSaved }: Props) {
  const clients = useListResource(listClients)
  const services = useListResource(listServices)
  const [newClientKey, setNewClientKey] = useState<number | null>(null)
  const [serverError, setServerError] = useState('')

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: editing
      ? {
          client_id: editing.client_id,
          service_ids: editing.items.map((i) => i.service_id),
          day: dayKey(editing.start_at),
          start: formatTime(editing.start_at),
          end: formatTime(editing.end_at),
          notes: editing.notes,
        }
      : { client_id: '', service_ids: [], day, start: '09:00', end: '', notes: '' },
  })

  const [serviceIds, start, endField, chosenDay] = useWatch({ control, name: ['service_ids', 'start', 'end', 'day'] })
  // Ativos + os que já estão no atendimento (mesmo se desativados depois)
  const available = services.data.filter((s) => s.is_active || serviceIds.includes(s.id))
  const chosen = available.filter((s) => serviceIds.includes(s.id))
  const duration = chosen.reduce((s, x) => s + x.duration_min, 0)
  const total = chosen.reduce((s, x) => s + x.price, 0)
  // Regra 4: fim sugerido somando a duração dos serviços
  const end = endField || addMinutes(start || '09:00', duration || 30)

  // Avisos (não bloqueiam: quem bloqueia sobreposição é o banco)
  const warnings: string[] = []
  const hours = settings.opening_hours[weekdayOfKey(chosenDay || day)]
  if (!hours.open) warnings.push('O studio está fechado neste dia.')
  else if (start < hours.start || end > hours.end) warnings.push(`Fora do horário de funcionamento (${hours.start}–${hours.end}).`)
  if (settings.lunch.enabled && start < settings.lunch.end && end > settings.lunch.start)
    warnings.push(`Pega o horário de almoço (${settings.lunch.start}–${settings.lunch.end}).`)
  if (settings.interval_min > 0 && start && end) {
    const s = toMinutes(start)
    const e = toMinutes(end)
    const tooClose = existing.find((a) => {
      if (a.id === editing?.id || a.status === 'cancelado' || a.status === 'faltou' || dayKey(a.start_at) !== chosenDay) return false
      const as = toMinutes(formatTime(a.start_at))
      const ae = toMinutes(formatTime(a.end_at))
      return (as >= e && as - e < settings.interval_min) || (s >= ae && s - ae < settings.interval_min)
    })
    if (tooClose) warnings.push(`Menos de ${settings.interval_min} min de folga com ${tooClose.client.name}.`)
  }

  const onSubmit = handleSubmit(async (v) => {
    setServerError('')
    if (end <= v.start) return setServerError('O fim precisa ser depois do início.')
    const startAt = zonedDateTime(v.day, v.start)
    const endAt = zonedDateTime(v.day, end)
    const result = await saveAppointment({
      id: editing?.id,
      client_id: v.client_id,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      service_ids: v.service_ids,
      notes: v.notes,
    })
    if (result.error !== null) {
      if (result.error === SLOT_TAKEN) {
        const other = existing.find(
          (a) =>
            a.id !== editing?.id &&
            a.status !== 'cancelado' &&
            a.status !== 'faltou' &&
            new Date(a.start_at) < endAt &&
            new Date(a.end_at) > startAt,
        )
        return setServerError(other ? `${SLOT_TAKEN} (${other.client.name}, ${formatTime(other.start_at)}–${formatTime(other.end_at)})` : SLOT_TAKEN)
      }
      return setServerError(result.error)
    }
    onSaved()
    onClose()
  })

  async function saveNewClient(input: ClientInput) {
    const r = await createClient(input)
    if (r.error !== null) return { error: r.error }
    clients.upsert(r.data)
    return { error: null, client: r.data }
  }

  const loading = clients.status === 'loading' || services.status === 'loading'
  const loadError = clients.error ?? services.error

  return (
    <>
      <Modal
        open={newClientKey === null}
        onClose={onClose}
        title={editing ? 'Remarcar atendimento' : 'Novo atendimento'}
        footer={
          <>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="appt-form" disabled={isSubmitting || loading || !!loadError}>
              {isSubmitting ? 'Salvando…' : editing ? 'Salvar' : 'Agendar'}
            </Button>
          </>
        }
      >
        {loading ? (
          <p role="status" className="py-8 text-center text-sm text-bordo">
            Carregando clientes e serviços…
          </p>
        ) : loadError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center text-sm">
            <p>{loadError}</p>
            <Button
              variant="outline"
              onClick={() => {
                clients.reload()
                services.reload()
              }}
            >
              Tentar de novo
            </Button>
          </div>
        ) : (
          <form id="appt-form" onSubmit={onSubmit} onChange={() => setServerError('')} noValidate className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Select label="Cliente" error={errors.client_id?.message} {...register('client_id')}>
                  <option value="">{clients.data.length ? 'Selecione…' : 'Nenhuma cliente cadastrada'}</option>
                  {[...clients.data]
                    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </Select>
              </div>
              <Button variant="outline" className="mt-7 w-11 px-0" onClick={() => setNewClientKey(Date.now())} aria-label="Cadastrar nova cliente">
                <UserPlus size={18} strokeWidth={1.75} />
              </Button>
            </div>

            <Controller
              control={control}
              name="service_ids"
              render={({ field }) => (
                <fieldset>
                  <legend className="mb-1.5 text-sm font-medium">Serviços</legend>
                  {available.length === 0 ? (
                    <p className="text-sm text-bordo">Nenhum serviço ativo. Cadastre em Serviços.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {available.map((s) => {
                        const on = field.value.includes(s.id)
                        return (
                          <button
                            key={s.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              setServerError('')
                              setValue('end', '') // volta a sugerir o fim
                              field.onChange(on ? field.value.filter((x) => x !== s.id) : [...field.value, s.id])
                            }}
                            className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors sm:h-9 ${
                              on ? 'border-bordo bg-rosa-claro font-medium text-vinho' : 'border-rose/60 text-bordo hover:border-bordo'
                            }`}
                          >
                            {on && <Check size={14} strokeWidth={1.75} aria-hidden />}
                            {s.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {errors.service_ids ? (
                    <p className="mt-1 text-xs text-bordo">{errors.service_ids.message}</p>
                  ) : (
                    chosen.length > 0 && (
                      <p className="mt-2 text-xs text-bordo">
                        {minutesToLabel(duration)} · {formatCurrency(total)}
                        {editing && ' · o preço é atualizado para o valor atual dos serviços'}
                      </p>
                    )
                  )}
                </fieldset>
              )}
            />

            <Input label="Data" type="date" error={errors.day?.message} {...register('day')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Início" type="time" step={300} error={errors.start?.message} {...register('start')} />
              <Input
                label="Fim"
                type="time"
                step={300}
                value={end}
                onChange={(e) => setValue('end', e.target.value)}
                hint={endField ? 'Ajustado à mão' : 'Sugerido pela duração'}
              />
            </div>

            {warnings.map((w) => (
              <p key={w} className="flex items-start gap-2 rounded-xl bg-rosa-claro px-3 py-2 text-xs text-bordo">
                <AlertTriangle size={14} strokeWidth={1.75} className="mt-px shrink-0" aria-hidden />
                {w}
              </p>
            ))}

            <Textarea label="Observações (opcional)" {...register('notes')} />

            {serverError && (
              <p role="alert" className="rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
                {serverError}
              </p>
            )}
          </form>
        )}
      </Modal>

      {newClientKey !== null && (
        <ClientFormModal
          key={newClientKey}
          open
          existing={clients.data}
          onSave={saveNewClient}
          onSaved={(c) => setValue('client_id', c.id, { shouldValidate: true })}
          onClose={() => setNewClientKey(null)}
        />
      )}
    </>
  )
}
