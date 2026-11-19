import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import CategoryPicker from '../../components/ui/CategoryPicker'
import ChipGroup from '../../components/ui/ChipGroup'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { useResource } from '../../hooks/useResource'
import { useToday } from '../../hooks/useToday'
import { createTransaction, listCategories, type PaymentTarget } from '../../services/finance'
import type { PaymentMethod, Transaction } from '../../types/models'
import { formatCurrency } from '../../utils/formatCurrency'
import { paymentLabels } from '../../utils/labels'
import { parseMoney } from '../../utils/money'

const methodOptions = (Object.keys(paymentLabels) as PaymentMethod[]).map((value) => ({ value, label: paymentLabels[value] }))

/** Categorias que já vêm prontas. As outras ela cria ao lançar. */
const DEFAULT_CATEGORIES = { entrada: ['Atendimento'], saida: ['Produtos'] }


const schema = z.object({
  type: z.enum(['entrada', 'saida']),
  amount: z.string().refine((v) => parseMoney(v) > 0, 'Informe um valor maior que zero, ex.: 45,00'),
  payment_method: z.enum(['dinheiro', 'pix', 'debito', 'credito']),
  category: z.string().trim().min(2, 'Escolha ou crie uma categoria'),
  description: z.string().max(200),
  date: z.string().min(1, 'Informe a data'),
})

type FormValues = z.infer<typeof schema>

type Props = {
  onClose: () => void
  onSaved: () => void
  /** Pagamento de um atendimento: já vem com cliente, descrição e valor que falta. */
  appointment?: PaymentTarget | null
  defaultType?: Transaction['type']
}

/** Renderize com `key` diferente a cada abertura para o formulário começar limpo. */
export default function TransactionFormModal({ onClose, onSaved, appointment, defaultType = 'entrada' }: Props) {
  const today = useToday()
  const categories = useResource('categories', listCategories)
  const [serverError, setServerError] = useState<string | null>(null)

  const remaining = appointment ? Math.max(0, Math.round((appointment.total - appointment.paid) * 100) / 100) : 0
  const serviceNames = appointment?.items.map((i) => i.service_name).join(' + ') ?? ''

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: appointment ? 'entrada' : defaultType,
      amount: remaining ? remaining.toFixed(2).replace('.', ',') : '',
      payment_method: 'pix',
      category: appointment ? 'Atendimento' : DEFAULT_CATEGORIES[defaultType][0],
      description: '',
      date: today,
    },
  })
  const type = useWatch({ control, name: 'type' })

  // Sugestões: as prontas + as que ela já usou (mais usadas primeiro), sem repetir
  const used = categories.data?.[type] ?? []
  const options = [...new Set([...DEFAULT_CATEGORIES[type], ...used])]

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null)
    const amount = Math.round(parseMoney(v.amount) * 100) / 100
    if (appointment && amount > remaining + 0.004)
      return setError('amount', { message: `O valor passa do que falta receber (${formatCurrency(remaining)}).` })
    const result = await createTransaction({
      type: v.type,
      amount,
      payment_method: v.payment_method,
      category: v.category,
      description: appointment ? serviceNames : v.description,
      appointment_id: appointment?.id ?? null,
      client_id: appointment?.client_id ?? null,
      date: v.date,
    })
    if (result.error !== null) return setServerError(result.error)
    onSaved()
    onClose()
  })

  const title = appointment ? 'Receber pagamento' : type === 'entrada' ? 'Nova entrada' : 'Nova despesa'

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="tx-form" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="tx-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {appointment ? (
          <div className="rounded-xl bg-rosa-claro px-3 py-2.5 text-sm">
            <p className="font-medium">
              {appointment.client.name} · {serviceNames}
            </p>
            <p className="mt-0.5 text-xs text-bordo">
              Total {formatCurrency(appointment.total)} · pago {formatCurrency(appointment.paid)} · falta{' '}
              <strong>{formatCurrency(remaining)}</strong>
            </p>
          </div>
        ) : (
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <ChipGroup
                label="Tipo"
                value={field.value}
                onChange={(t) => {
                  field.onChange(t)
                  setValue('category', DEFAULT_CATEGORIES[t][0])
                }}
                options={[
                  { value: 'entrada', label: 'Entrada' },
                  { value: 'saida', label: 'Despesa' },
                ]}
              />
            )}
          />
        )}

        <Input
          label="Valor (R$)"
          inputMode="decimal"
          autoFocus
          placeholder="0,00"
          error={errors.amount?.message}
          hint={appointment ? 'Pode ser parcial: um sinal agora e o restante depois.' : undefined}
          {...register('amount', { onChange: (e) => setValue('amount', e.target.value.replace(/[^\d,.]/g, '')) })}
        />

        <Controller
          control={control}
          name="payment_method"
          render={({ field }) => (
            <ChipGroup
              label={type === 'saida' ? 'Pago com' : 'Forma de pagamento'}
              value={field.value}
              onChange={field.onChange}
              options={methodOptions}
            />
          )}
        />

        {!appointment && (
          <>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <CategoryPicker
                  key={type}
                  label="Categoria"
                  options={options}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.category?.message}
                />
              )}
            />
            <Input
              label="Descrição (opcional)"
              placeholder={type === 'saida' ? 'Ex.: Henna e cola de cílios' : 'Ex.: Venda de máscara facial'}
              {...register('description')}
            />
          </>
        )}

        <Input label="Data" type="date" max={today} error={errors.date?.message} {...register('date')} />

        {serverError && (
          <p role="alert" className="rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  )
}
