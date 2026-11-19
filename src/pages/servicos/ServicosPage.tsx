import { Clock, EyeOff, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import EmptyState from '../../components/shared/EmptyState'
import ErrorState from '../../components/shared/ErrorState'
import LoadingState from '../../components/shared/LoadingState'
import PageHeader from '../../components/shared/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useListResource } from '../../hooks/useListResource'
import { createService, listServices, updateService } from '../../services/catalog'
import type { Service, ServiceInput } from '../../types/models'
import { formatCurrency } from '../../utils/formatCurrency'
import { minutesToLabel } from '../../utils/formatDate'
import { serviceCategories as categories } from '../../utils/labels'
import ServiceFormModal from './ServiceFormModal'

export default function ServicosPage() {
  const services = useListResource(listServices)
  const [form, setForm] = useState<{ key: number; service: Service | null } | null>(null)

  const openForm = (service: Service | null) => setForm({ key: Date.now(), service })

  async function save(input: ServiceInput) {
    const result = form?.service ? await updateService(form.service.id, input) : await createService(input)
    if (result.error !== null) return { error: result.error }
    services.upsert(result.data)
    return { error: null }
  }

  const activeCount = services.data.filter((s) => s.is_active).length

  return (
    <>
      <PageHeader
        title="Serviços"
        subtitle={services.status === 'ready' && services.data.length ? `${activeCount} ativos` : 'Procedimentos, preços e duração'}
        action={
          <Button onClick={() => openForm(null)}>
            <Plus size={18} strokeWidth={1.75} aria-hidden />
            Novo serviço
          </Button>
        }
      />

      {services.status === 'loading' && <LoadingState label="Carregando serviços…" />}
      {services.status === 'error' && <ErrorState message={services.error!} onRetry={services.reload} />}

      {services.status === 'ready' && services.data.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Nenhum serviço ainda"
          description="Cadastre os procedimentos com preço e duração. Eles aparecem na agenda e, se quiser, no site."
          action={
            <Button variant="outline" onClick={() => openForm(null)}>
              Cadastrar serviço
            </Button>
          }
        />
      )}

      {services.status === 'ready' && services.data.length > 0 && (
        <div className="flex flex-col gap-5">
          {categories.map((cat) => {
            const list = services.data
              .filter((s) => s.category === cat)
              .sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.name.localeCompare(b.name, 'pt-BR'))
            if (!list.length) return null
            return (
              <section key={cat}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-bordo">{cat}</h2>
                <Card className="p-0">
                  <ul className="divide-y divide-rose/25">
                    {list.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => openForm(s)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-rosa-claro/50 `}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2 font-medium">
                              {s.name}
                              {!s.is_active && <Badge tone="outline">Inativo</Badge>}
                              {s.is_active && !s.is_public && (
                                <Badge tone="outline">
                                  <EyeOff size={11} strokeWidth={1.75} aria-hidden /> Fora do site
                                </Badge>
                              )}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-xs text-bordo">
                              <Clock size={12} strokeWidth={1.75} aria-hidden />
                              {minutesToLabel(s.duration_min)}
                            </span>
                          </span>
                          <span className="font-semibold tabular-nums">{formatCurrency(s.price)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            )
          })}
          <p className="text-xs text-bordo">
            Serviços não são apagados para não perder o histórico: desmarque "Ativo" para tirá-los da agenda.
          </p>
        </div>
      )}

      {form && <ServiceFormModal key={form.key} service={form.service} onSave={save} onClose={() => setForm(null)} />}
    </>
  )
}
