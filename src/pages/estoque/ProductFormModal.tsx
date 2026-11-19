import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import { createProduct, updateProduct, type InventoryProduct } from '../../services/inventory'
import { parseMoney } from '../../utils/money'

const UNITS = ['un', 'ml', 'g', 'frasco', 'pacote', 'caixa']

const quantity = (label: string) =>
  z.string().refine((v) => v.trim() === '' || (!Number.isNaN(parseMoney(v)) && parseMoney(v) >= 0), `${label} inválido`)

const schema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do produto'),
  unit: z.string().min(1),
  minimum_stock: quantity('Mínimo'),
  initial: quantity('Quantidade'),
  cost: z.string().refine((v) => v.trim() === '' || (!Number.isNaN(parseMoney(v)) && parseMoney(v) >= 0), 'Custo inválido, ex.: 28,90'),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const num = (v: string) => (v.trim() === '' ? 0 : Math.round(parseMoney(v) * 100) / 100)
const show = (n: number) => String(n).replace('.', ',')

type Props = { product: InventoryProduct | null; onClose: () => void; onSaved: (p: InventoryProduct) => void }

/** Renderize com `key` diferente a cada abertura. */
export default function ProductFormModal({ product, onClose, onSaved }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '',
      unit: product?.unit ?? 'un',
      minimum_stock: product ? show(product.minimum_stock) : '',
      initial: '',
      cost: product?.cost != null ? product.cost.toFixed(2).replace('.', ',') : '',
      is_active: product?.is_active ?? true,
    },
  })

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null)
    const input = {
      name: v.name,
      unit: v.unit,
      minimum_stock: num(v.minimum_stock),
      cost: v.cost.trim() === '' ? null : num(v.cost),
      is_active: v.is_active,
    }
    const result = product ? await updateProduct(product.id, input) : await createProduct(input, num(v.initial))
    if (result.error !== null) return setServerError(result.error)
    onSaved(result.data)
    onClose()
  })

  const units = product && !UNITS.includes(product.unit) ? [product.unit, ...UNITS] : UNITS

  return (
    <Modal
      open
      onClose={onClose}
      title={product ? 'Editar produto' : 'Novo produto'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input label="Nome" autoFocus placeholder="Ex.: Henna castanho médio" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Unidade" {...register('unit')}>
            {units.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
          <Input
            label="Avisar quando chegar a"
            inputMode="decimal"
            placeholder="0"
            error={errors.minimum_stock?.message}
            {...register('minimum_stock')}
          />
        </div>
        {!product && (
          <Input
            label="Quantidade que tem agora (opcional)"
            inputMode="decimal"
            placeholder="0"
            hint="Vira uma entrada “Estoque inicial”."
            error={errors.initial?.message}
            {...register('initial')}
          />
        )}
        <Input label="Custo por unidade (R$, opcional)" inputMode="decimal" placeholder="0,00" error={errors.cost?.message} {...register('cost')} />
        {product && (
          <>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" className="size-5 accent-vinho" {...register('is_active')} />
              Ativo (desmarque se deixou de usar; o histórico fica guardado)
            </label>
            <p className="text-xs text-bordo">Para mudar a quantidade, toque no produto e registre entrada, saída ou ajuste.</p>
          </>
        )}
        {serverError && (
          <p role="alert" className="rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  )
}
