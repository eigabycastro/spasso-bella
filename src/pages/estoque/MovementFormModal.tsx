import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import ChipGroup from '../../components/ui/ChipGroup'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { useResource } from '../../hooks/useResource'
import { addMovement, listMovements, type InventoryProduct } from '../../services/inventory'
import type { MovementType } from '../../types/models'
import { formatDate } from '../../utils/formatDate'
import { formatQuantity } from '../../utils/formatQuantity'
import { movementLabels } from '../../utils/labels'
import { parseMoney } from '../../utils/money'

const schema = z.object({
  movement_type: z.enum(['entrada', 'saida', 'ajuste']),
  quantity: z.string().refine((v) => v.trim() !== '' && !Number.isNaN(parseMoney(v)) && parseMoney(v) >= 0, 'Informe a quantidade'),
  reason: z.string().max(120),
})

type FormValues = z.infer<typeof schema>

const defaultReason: Record<MovementType, string> = {
  entrada: 'Compra',
  saida: 'Uso em atendimento',
  ajuste: 'Contagem',
}

const round = (n: number) => Math.round(n * 100) / 100

type Props = { product: InventoryProduct; onClose: () => void; onSaved: () => void }

/** Regra 8: a quantidade só muda por movimentação. Renderize com `key` a cada abertura. */
export default function MovementFormModal({ product, onClose, onSaved }: Props) {
  const history = useResource(`mov/${product.id}`, () => listMovements(product.id, 5))
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { movement_type: 'saida', quantity: '1', reason: '' },
  })
  const type = useWatch({ control, name: 'movement_type' })
  const typed = round(parseMoney(useWatch({ control, name: 'quantity' }) || '0') || 0)
  // No ajuste ela informa a quantidade contada; o banco guarda a diferença
  const after = type === 'entrada' ? product.quantity + typed : type === 'saida' ? product.quantity - typed : typed
  const u = product.unit

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null)
    const value = round(parseMoney(v.quantity))
    if (v.movement_type !== 'ajuste' && value <= 0) return setError('quantity', { message: 'A quantidade precisa ser maior que zero' })
    if (v.movement_type === 'saida' && value > product.quantity)
      return setError('quantity', { message: `Só há ${formatQuantity(product.quantity, u)} em estoque` })
    const delta = v.movement_type === 'ajuste' ? round(value - product.quantity) : value
    if (v.movement_type === 'ajuste' && delta === 0) return setError('quantity', { message: 'O estoque já está com essa quantidade' })

    const result = await addMovement({
      product_id: product.id,
      movement_type: v.movement_type,
      quantity: delta,
      reason: v.reason || defaultReason[v.movement_type],
    })
    if (result.error !== null) return setServerError(result.error)
    onSaved()
    onClose()
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={product.name}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="movement-form" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : 'Registrar'}
          </Button>
        </>
      }
    >
      <form id="movement-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Controller
          control={control}
          name="movement_type"
          render={({ field }) => (
            <ChipGroup
              label="Movimentação"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'saida', label: 'Saída' },
                { value: 'entrada', label: 'Entrada' },
                { value: 'ajuste', label: 'Ajuste (contagem)' },
              ]}
            />
          )}
        />
        <Input
          label={type === 'ajuste' ? `Quantidade contada (${u})` : `Quantidade (${u})`}
          inputMode="decimal"
          autoFocus
          error={errors.quantity?.message}
          {...register('quantity')}
        />
        <Input label="Motivo (opcional)" placeholder={defaultReason[type]} {...register('reason')} />
        <p className="rounded-xl bg-rosa-claro px-3 py-2 text-sm">
          Em estoque: <strong>{formatQuantity(product.quantity, u)}</strong> → depois: <strong>{formatQuantity(Math.max(0, round(after)), u)}</strong>
          {product.minimum_stock > 0 && after <= product.minimum_stock && (
            <span className="text-bordo"> · no mínimo ({formatQuantity(product.minimum_stock, u)}) ou abaixo</span>
          )}
        </p>
        {serverError && (
          <p role="alert" className="rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
            {serverError}
          </p>
        )}
      </form>

      <h3 className="mt-6 mb-2 text-sm font-semibold">Últimas movimentações</h3>
      {history.status === 'loading' && <p className="text-sm text-bordo">Carregando…</p>}
      {history.status === 'error' && <p className="text-sm text-bordo">{history.error}</p>}
      {history.status === 'ready' &&
        (history.data!.length === 0 ? (
          <p className="text-sm text-bordo">Nenhuma ainda.</p>
        ) : (
          <ul className="divide-y divide-rose/25 text-sm">
            {history.data!.map((m) => (
              <li key={m.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0 truncate">
                  {movementLabels[m.movement_type]} · {m.reason || '—'}
                  <span className="block text-xs text-bordo">{formatDate(m.created_at, "dd/MM 'às' HH:mm")}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {m.movement_type === 'saida' || m.quantity < 0 ? '−' : '+'}
                  {formatQuantity(Math.abs(m.quantity), m.unit)}
                </span>
              </li>
            ))}
          </ul>
        ))}
    </Modal>
  )
}
