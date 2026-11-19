import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Textarea from '../../components/ui/Textarea'
import type { Client, ClientInput } from '../../types/models'
import { isValidPhone, maskPhone } from '../../utils/phone'

const schema = z.object({
  name: z.string().trim().min(2, 'Informe o nome'),
  phone: z.string().refine(isValidPhone, 'Telefone com DDD, ex.: (31) 99999-9999'),
  birthday: z.string(),
  notes: z.string(),
})

type FormValues = z.infer<typeof schema>

export type SaveClient = (input: ClientInput) => Promise<{ error: string | null; client?: Client }>

type Props = {
  open: boolean
  client?: Client | null
  onClose: () => void
  onSave: SaveClient
  onSaved?: (client: Client) => void
  /** Para avisar sobre telefone repetido */
  existing?: Client[]
}

const digits = (s: string) => s.replace(/\D/g, '')

/** Renderize com `key` diferente a cada abertura para o formulário começar limpo. */
export default function ClientFormModal({ open, client, onClose, onSave, onSaved, existing = [] }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: client?.name ?? '',
      phone: client?.phone ?? '',
      birthday: client?.birthday ?? '',
      notes: client?.notes ?? '',
    },
  })

  const phone = useWatch({ control, name: 'phone' })
  const duplicate =
    isValidPhone(phone) && existing.find((c) => c.id !== client?.id && c.phone && digits(c.phone) === digits(phone))

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null)
    const result = await onSave({ name: v.name, phone: v.phone, birthday: v.birthday || null, notes: v.notes })
    if (result.error) return setServerError(result.error)
    if (result.client) onSaved?.(result.client)
    onClose()
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? 'Editar cliente' : 'Nova cliente'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="client-form" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input label="Nome" autoFocus autoComplete="off" autoCapitalize="words" error={errors.name?.message} {...register('name')} />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              label="WhatsApp"
              type="tel"
              inputMode="tel"
              placeholder="(31) 99999-9999"
              error={errors.phone?.message}
              hint={duplicate ? `Atenção: ${duplicate.name} já usa este telefone.` : undefined}
              {...field}
              onChange={(e) => field.onChange(maskPhone(e.target.value))}
            />
          )}
        />
        <Input label="Aniversário (opcional)" type="date" hint="Só se a cliente quiser receber parabéns." {...register('birthday')} />
        <Textarea
          label="Observações (opcional)"
          placeholder="Preferências, cuidados no atendimento…"
          hint="Informação de saúde (como alergia) é dado sensível: anote só com o consentimento da cliente."
          {...register('notes')}
        />
        {serverError && (
          <p role="alert" className="rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  )
}
