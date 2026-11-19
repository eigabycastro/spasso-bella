import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Package, PackagePlus, Pencil, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import EmptyState from '../../components/shared/EmptyState'
import ErrorState from '../../components/shared/ErrorState'
import LoadingState from '../../components/shared/LoadingState'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useListResource } from '../../hooks/useListResource'
import { useResource } from '../../hooks/useResource'
import { isLowStock, listMovements, listProducts, type InventoryProduct } from '../../services/inventory'
import type { MovementType } from '../../types/models'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { formatQuantity } from '../../utils/formatQuantity'
import { movementLabels } from '../../utils/labels'
import MovementFormModal from './MovementFormModal'
import ProductFormModal from './ProductFormModal'

const movementIcon: Record<MovementType, typeof Package> = { entrada: ArrowDownLeft, saida: ArrowUpRight, ajuste: RefreshCcw }

export default function EstoquePage() {
  const products = useListResource(listProducts)
  const movements = useResource('movements', () => listMovements(undefined, 15))
  const [moving, setMoving] = useState<{ key: number; product: InventoryProduct } | null>(null)
  const [editing, setEditing] = useState<{ key: number; product: InventoryProduct | null } | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const all = products.data
  const inactiveCount = all.filter((p) => !p.is_active).length
  const visible = all
    .filter((p) => showInactive || p.is_active)
    .sort((a, b) => Number(isLowStock(b)) - Number(isLowStock(a)) || a.name.localeCompare(b.name, 'pt-BR'))
  const low = all.filter(isLowStock)
  const stockValue = all.filter((p) => p.is_active).reduce((s, p) => s + p.quantity * (p.cost ?? 0), 0)

  const afterMovement = () => {
    products.reload()
    movements.reload()
  }

  return (
    <>
      <PageHeader
        title="Estoque"
        subtitle={
          products.status === 'ready' && all.length
            ? `${all.length - inactiveCount} produtos${stockValue ? ` · ${formatCurrency(stockValue)} em estoque` : ''}`
            : 'Produtos e movimentações'
        }
        action={
          <Button onClick={() => setEditing({ key: Date.now(), product: null })}>
            <PackagePlus size={18} strokeWidth={1.75} aria-hidden />
            Novo produto
          </Button>
        }
      />

      {products.status === 'loading' && <LoadingState rows={4} label="Carregando produtos…" />}
      {products.status === 'error' && <ErrorState message={products.error!} onRetry={products.reload} />}

      {products.status === 'ready' && all.length === 0 && (
        <EmptyState
          icon={Package}
          title="Nenhum produto ainda"
          description="Cadastre os produtos que você usa nos atendimentos e defina quando quer ser avisada para repor."
          action={
            <Button variant="outline" onClick={() => setEditing({ key: Date.now(), product: null })}>
              Cadastrar produto
            </Button>
          }
        />
      )}

      {products.status === 'ready' && all.length > 0 && (
        <>
          {low.length > 0 && (
            <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-bordo/40 bg-branco px-4 py-3 text-sm">
              <AlertTriangle size={18} strokeWidth={1.75} className="shrink-0 text-bordo" aria-hidden />
              <span>
                <strong>{low.length}</strong> {low.length === 1 ? 'produto precisa' : 'produtos precisam'} de reposição.
              </span>
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <Card className="p-0">
              <ul className="divide-y divide-rose/25">
                {visible.map((p) => {
                  const isLow = isLowStock(p)
                  return (
                    <li key={p.id} className={`flex items-center gap-2 pr-2 `}>
                      <button
                        type="button"
                        onClick={() => setMoving({ key: Date.now(), product: p })}
                        disabled={!p.is_active}
                        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left hover:bg-rosa-claro/50 disabled:hover:bg-transparent"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{p.name}</span>
                          <span className="flex items-center gap-1 text-xs text-bordo">
                            {!p.is_active ? (
                              'Inativo'
                            ) : isLow ? (
                              <>
                                <AlertTriangle size={12} strokeWidth={1.75} aria-hidden /> Repor · mínimo {formatQuantity(p.minimum_stock, p.unit)}
                              </>
                            ) : p.minimum_stock > 0 ? (
                              `OK · mínimo ${formatQuantity(p.minimum_stock, p.unit)}`
                            ) : (
                              'Sem aviso de mínimo'
                            )}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${isLow ? 'bg-vinho text-branco' : 'bg-rosa-claro'}`}
                        >
                          {formatQuantity(p.quantity, p.unit)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing({ key: Date.now(), product: p })}
                        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-bordo hover:bg-rosa-claro"
                        aria-label={`Editar ${p.name}`}
                      >
                        <Pencil size={16} strokeWidth={1.75} />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rose/25 px-4 py-2 text-xs text-bordo">
                <span>Toque no produto para registrar entrada, saída ou ajuste.</span>
                {inactiveCount > 0 && (
                  <button type="button" onClick={() => setShowInactive((v) => !v)} className="min-h-11 font-medium text-bordo underline-offset-4 hover:underline">
                    {showInactive ? 'Esconder inativos' : `Mostrar inativos (${inactiveCount})`}
                  </button>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="mb-3 font-semibold">Últimas movimentações</h2>
              {movements.status === 'loading' && <p className="text-sm text-bordo">Carregando…</p>}
              {movements.status === 'error' && (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span>{movements.error}</span>
                  <Button variant="outline" onClick={movements.reload}>
                    Tentar de novo
                  </Button>
                </div>
              )}
              {movements.status === 'ready' &&
                (movements.data!.length === 0 ? (
                  <p className="text-sm text-bordo">Nenhuma movimentação ainda.</p>
                ) : (
                  <ul className="divide-y divide-rose/25">
                    {movements.data!.map((m) => {
                      const Icon = movementIcon[m.movement_type]
                      return (
                        <li key={m.id} className="flex items-center gap-3 py-2.5 text-sm">
                          <Icon size={16} strokeWidth={1.75} className="shrink-0 text-bordo" aria-label={movementLabels[m.movement_type]} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{m.product_name}</span>
                            <span className="block truncate text-xs text-bordo">
                              {movementLabels[m.movement_type]}
                              {m.reason && ` · ${m.reason}`} · {formatDate(m.created_at, 'dd/MM HH:mm')}
                            </span>
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums">
                            {m.movement_type === 'saida' || m.quantity < 0 ? '−' : '+'}
                            {formatQuantity(Math.abs(m.quantity), m.unit)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ))}
            </Card>
          </div>
        </>
      )}

      {moving && <MovementFormModal key={moving.key} product={moving.product} onSaved={afterMovement} onClose={() => setMoving(null)} />}
      {editing && (
        <ProductFormModal
          key={editing.key}
          product={editing.product}
          onSaved={() => afterMovement()}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
