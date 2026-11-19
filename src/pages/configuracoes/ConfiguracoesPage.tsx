import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import ErrorState from '../../components/shared/ErrorState'
import LoadingState from '../../components/shared/LoadingState'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { useSettings } from '../../hooks/useSettings'
import { updateSettings } from '../../services/settings'
import type { BusinessSettings } from '../../types/models'
import { weekdayLabels } from '../../utils/labels'
import GalleryManager from './GalleryManager'
import MessageTemplatesCard from './MessageTemplatesCard'
import { isValidPhone, maskPhone } from '../../utils/phone'

const timeRange = z
  .object({ start: z.string(), end: z.string() })
  .refine((d) => d.end > d.start, { message: 'O fim precisa ser depois do início', path: ['end'] })

const day = z
  .object({ open: z.boolean(), start: z.string(), end: z.string() })
  .refine((d) => !d.open || d.end > d.start, { message: 'O fechamento precisa ser depois da abertura', path: ['end'] })

const schema = z.object({
  business_name: z.string().trim().min(2, 'Informe o nome do studio'),
  phone: z.string().refine((v) => !v || isValidPhone(v), 'Telefone com DDD, ex.: (31) 99999-9999'),
  address: z.string(),
  instagram: z.string(),
  maps_url: z.string().refine((v) => !v || /^https:\/\//.test(v), 'Cole o link completo, começando com https://'),
  legal_name: z.string().max(120),
  document_id: z.string().refine((v) => !v || [11, 14].includes(v.replace(/\D/g, '').length), 'CNPJ com 14 números ou CPF com 11'),
  contact_email: z.string().refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()), 'E-mail inválido'),
  interval_min: z.coerce.number<string>().int().min(0, 'Não pode ser negativo').max(120, 'Máximo de 120 minutos'),
  opening_hours: z.array(day).length(7),
  message_templates: z.object({
    confirmation: z.string().trim().min(10, 'Escreva a mensagem de confirmação').max(600, 'Máximo de 600 caracteres'),
    reminder: z.string().trim().min(10, 'Escreva a mensagem de lembrete').max(600, 'Máximo de 600 caracteres'),
    birthday: z.string().trim().min(10, 'Escreva a mensagem de aniversário').max(600, 'Máximo de 600 caracteres'),
  }),
  lunch: z.union([timeRange.and(z.object({ enabled: z.literal(true) })), z.object({ enabled: z.literal(false), start: z.string(), end: z.string() })]),
})

export type SettingsFormInput = z.input<typeof schema>
type FormInput = SettingsFormInput
export type SettingsFormOutput = z.output<typeof schema>
type FormOutput = SettingsFormOutput

// Ordem de exibição: segunda → domingo
const displayOrder = [1, 2, 3, 4, 5, 6, 0]
const timeClass = 'h-11 rounded-xl border border-bordo/70 bg-branco px-2 focus:border-bordo'

export default function ConfiguracoesPage() {
  const settings = useSettings()

  return (
    <>
      <PageHeader title="Configurações" subtitle="Dados do studio e horário de funcionamento" />
      {settings.status === 'loading' && <LoadingState rows={4} label="Carregando configurações…" />}
      {settings.status === 'error' && <ErrorState message={settings.error!} onRetry={settings.reload} />}
      {settings.status === 'ready' && settings.data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsForm initial={settings.data} onSaved={settings.replace} />
          <GalleryManager />
        </div>
      )}
    </>
  )
}

const toForm = (s: BusinessSettings): FormInput => ({ ...s, interval_min: String(s.interval_min) })

function SettingsForm({ initial, onSaved }: { initial: BusinessSettings; onSaved: (s: BusinessSettings) => void }) {
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: toForm(initial) })
  const { fields } = useFieldArray({ control, name: 'opening_hours' })
  const hours = useWatch({ control, name: 'opening_hours' })
  const lunchEnabled = useWatch({ control, name: 'lunch.enabled' })

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null)
    const result = await updateSettings(v)
    if (result.error !== null) return setServerError(result.error)
    onSaved(result.data)
    reset(toForm(result.data))
    setSaved(true)
  })

  const lunchError = errors.lunch && 'end' in errors.lunch ? errors.lunch.end?.message : undefined

  return (
    <form onSubmit={onSubmit} onChange={() => setSaved(false)} noValidate className="contents">
      <Card className="flex flex-col gap-4">
        <h2 className="font-semibold">Dados do studio</h2>
        <Input label="Nome" error={errors.business_name?.message} {...register('business_name')} />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              label="WhatsApp do studio"
              type="tel"
              inputMode="tel"
              placeholder="(31) 99999-9999"
              hint="Usado no botão “Agendar” do site."
              error={errors.phone?.message}
              {...field}
              onChange={(e) => field.onChange(maskPhone(e.target.value))}
            />
          )}
        />
        <Input label="Endereço" placeholder="Rua, número, bairro, cidade" {...register('address')} />
        <Input label="Link do Google Maps (opcional)" placeholder="https://maps.app.goo.gl/…" error={errors.maps_url?.message} {...register('maps_url')} />
        <Input label="Instagram" placeholder="@spassobella" {...register('instagram')} />

        <h2 className="mt-4 font-semibold">Dados legais</h2>
        <p className="-mt-2 text-xs text-bordo">
          Aparecem no rodapé e na Política de Privacidade do site, como pedem a LGPD e o Decreto 7.962/2013.
        </p>
        <Input label="Nome empresarial" placeholder="Razão social ou nome do MEI" {...register('legal_name')} />
        <Input
          label="CNPJ (ou CPF)"
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          hint="Se ainda não tiver CNPJ, o CPF fica público no site: avalie antes de preencher."
          error={errors.document_id?.message}
          {...register('document_id')}
        />
        <Input
          label="E-mail para privacidade"
          type="email"
          inputMode="email"
          placeholder="contato@…"
          hint="Canal para clientes pedirem acesso ou exclusão dos dados delas."
          error={errors.contact_email?.message}
          {...register('contact_email')}
        />
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="mb-3 font-semibold">Horário de funcionamento</h2>
          <ul className="divide-y divide-rose/25">
            {displayOrder.map((idx) => {
              const f = fields[idx]
              const err = errors.opening_hours?.[idx]?.end?.message
              return (
                <li key={f.id} className="py-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex min-h-11 w-32 items-center gap-2.5 text-sm font-medium">
                      <input type="checkbox" className="size-5 accent-vinho" {...register(`opening_hours.${idx}.open`)} />
                      {weekdayLabels[idx]}
                    </label>
                    {hours[idx]?.open ? (
                      <div className="flex items-center gap-2 text-sm">
                        <input type="time" aria-label={`Abertura ${weekdayLabels[idx]}`} className={timeClass} {...register(`opening_hours.${idx}.start`)} />
                        <span className="text-bordo">às</span>
                        <input type="time" aria-label={`Fechamento ${weekdayLabels[idx]}`} className={timeClass} {...register(`opening_hours.${idx}.end`)} />
                      </div>
                    ) : (
                      <span className="text-sm text-bordo">Fechado</span>
                    )}
                  </div>
                  {err && <p className="mt-1 text-xs text-bordo">{err}</p>}
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="font-semibold">Pausas</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-11 w-32 items-center gap-2.5 text-sm font-medium">
              <input type="checkbox" className="size-5 accent-vinho" {...register('lunch.enabled')} />
              Almoço
            </label>
            {lunchEnabled ? (
              <div className="flex items-center gap-2 text-sm">
                <input type="time" aria-label="Início do almoço" className={timeClass} {...register('lunch.start')} />
                <span className="text-bordo">às</span>
                <input type="time" aria-label="Fim do almoço" className={timeClass} {...register('lunch.end')} />
              </div>
            ) : (
              <span className="text-sm text-bordo">Sem pausa</span>
            )}
          </div>
          {lunchError && <p className="text-xs text-bordo">{lunchError}</p>}
          <Input
            label="Folga entre atendimentos (min)"
            type="number"
            inputMode="numeric"
            step={5}
            hint="0 = um atendimento pode começar logo que o outro termina. Serve de aviso na agenda."
            error={errors.interval_min?.message}
            {...register('interval_min')}
          />
        </Card>
      </div>

      <MessageTemplatesCard control={control} register={register} setValue={setValue} errors={errors.message_templates} />

      <div className="flex flex-wrap items-center justify-end gap-3 lg:col-span-2">
        {serverError && (
          <p role="alert" className="text-sm font-medium text-vinho">
            {serverError}
          </p>
        )}
        {saved && !isDirty && (
          <span role="status" className="flex items-center gap-1.5 text-sm text-bordo">
            <Check size={16} strokeWidth={1.75} aria-hidden /> Configurações salvas
          </span>
        )}
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
