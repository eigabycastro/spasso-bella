import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import type { Service, ServiceCategory, ServiceInput } from '../../types/models'
import { serviceCategories as categories } from '../../utils/labels'

const parseMoney = (v: string) => Number(v.trim().replace(/\./g, '').replace(',', '.'))

const schema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do procedimento'),
  category: z.enum(categories as [ServiceCategory, ...ServiceCategory[]]),
  price: z
    .string()
    .refine((v) => v.trim() !== '' && !Number.isNaN(parseMoney(v)), 'Informe o preço, ex.: 45,00')
    .refine((v) => parseMoney(v) >= 0, 'O preço não pode ser negativo'),
  duration_min: z.coerce.number<string>().int('Use minutos inteiros').min(5, 'Mínimo de 5 minutos').max(600, 'Máximo de 10 horas'),
  description: z.string().max(300, 'Máximo de 300 caracteres'),
  is_active: z.boolean(),
  is_public: z.boolean(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

type Props = {
  service: Service | null
  onClose: () => void
  onSave: (input: ServiceInput) => Promise<{ error: string | null }>
}

/** Renderize com `key` diferente a cada abertura para o formulário começar limpo. */
export default function ServiceFormModal({ service, onClose, onSave }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: service?.name ?? '',
      category: service?.category ?? 'Sobrancelhas',
      price: service ? service.price.toFixed(2).replace('.', ',') : '',
      duration_min: String(service?.duration_min ?? 60),
      description: service?.description ?? '',
      is_active: service?.is_active ?? true,
      is_public: service?.is_public ?? true,
    },
  })

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null)
    const result = await onSave({ ...v, price: Math.round(parseMoney(v.price) * 100) / 100 })
    if (result.error) return setServerError(result.error)
    onClose()
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={service ? 'Editar serviço' : 'Novo serviço'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="service-form" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="service-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input label="Nome" autoFocus error={errors.name?.message} {...register('name')} />
        <Select label="Categoria" {...register('category')}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Preço (R$)" inputMode="decimal" placeholder="0,00" error={errors.price?.message} {...register('price')} />
          <Input
            label="Duração (min)"
            type="number"
            inputMode="numeric"
            step={5}
            error={errors.duration_min?.message}
            {...register('duration_min')}
          />
        </div>
        {service && <p className="-mt-2 text-xs text-bordo">Mudar o preço não altera atendimentos já marcados.</p>}
        <Textarea
          label="Descrição para o site (opcional)"
          placeholder="Ex.: Modelagem com pinça e linha, respeitando o formato do rosto."
          {...register('description')}
        />
        {errors.description && <p className="-mt-3 text-xs text-bordo">{errors.description.message}</p>}
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className="size-5 accent-vinho" {...register('is_active')} />
          Ativo (aparece na hora de agendar)
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className="size-5 accent-vinho" {...register('is_public')} />
          Mostrar no site público
        </label>
        {serverError && (
          <p role="alert" className="rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  )
}
