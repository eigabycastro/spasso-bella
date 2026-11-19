import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Minus, Plus, Scale, Trash2, Wallet } from 'lucide-react'
import { useState } from 'react'
import EmptyState from '../../components/shared/EmptyState'
import ErrorState from '../../components/shared/ErrorState'
import LoadingState from '../../components/shared/LoadingState'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ChipGroup from '../../components/ui/ChipGroup'
import Modal from '../../components/ui/Modal'
import { useResource } from '../../hooks/useResource'
import { useToday } from '../../hooks/useToday'
import { deleteTransaction, listReceivables, listTransactions, type PaymentTarget } from '../../services/finance'
import type { PaymentMethod, Transaction } from '../../types/models'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate, formatDay } from '../../utils/formatDate'
import { paymentLabels } from '../../utils/labels'
import TransactionFormModal from './TransactionFormModal'

type Filter = 'todas' | 'entrada' | 'saida'
const methods = Object.keys(paymentLabels) as PaymentMethod[]

const shiftMonth = (month: string, n: number) => {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7)
}
const sum = (list: Transaction[]) => list.reduce((s, t) => s + t.amount, 0)

export default function FinanceiroPage() {
  const currentMonth = useToday().slice(0, 7)
  const [month, setMonth] = useState(currentMonth)
  const [filter, setFilter] = useState<Filter>('todas')
  const [form, setForm] = useState<{ key: number; type: Transaction['type']; appointment?: PaymentTarget } | null>(null)
  const [removing, setRemoving] = useState<Transaction | null>(null)

  const txs = useResource(`tx/${month}`, () => listTransactions(month))
  const receivables = useResource(`rec/${month}`, () => listReceivables(month))
  const reloadAll = () => {
    txs.reload()
    receivables.reload()
  }

  const list = txs.data ?? []
  const incomes = list.filter((t) => t.type === 'entrada')
  const expenses = list.filter((t) => t.type === 'saida')
  const income = sum(incomes)
  const expense = sum(expenses)

  // Fechamento: quanto entrou e saiu por forma de pagamento (para conferir com gaveta e extrato)
  const closing = [...methods, null].map((m) => ({
    method: m,
    in: sum(incomes.filter((t) => t.payment_method === m)),
    out: sum(expenses.filter((t) => t.payment_method === m)),
  }))
  const closingRows = closing.filter((r) => r.method !== null || r.in || r.out)

  const visible = list.filter((t) => filter === 'todas' || t.type === filter)
  const groups = visible.reduce<Record<string, Transaction[]>>((acc, t) => {
    ;(acc[t.date] ??= []).push(t)
    return acc
  }, {})

  const openForm = (type: Transaction['type'], appointment?: PaymentTarget) => setForm({ key: Date.now(), type, appointment })
  const pending = receivables.data ?? []

  return (
    <>
      <PageHeader
        title="Financeiro"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openForm('saida')}>
              <Minus size={18} strokeWidth={1.75} aria-hidden />
              Nova despesa
            </Button>
            <Button onClick={() => openForm('entrada')}>
              <Plus size={18} strokeWidth={1.75} aria-hidden />
              Nova entrada
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex items-center gap-1">
        <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} className="flex size-11 items-center justify-center rounded-lg text-bordo hover:bg-branco" aria-label="Mês anterior">
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <h2 className="min-w-40 text-center font-semibold first-letter:uppercase">{formatDay(`${month}-01`, "MMMM 'de' yyyy")}</h2>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={month >= currentMonth}
          className="flex size-11 items-center justify-center rounded-lg text-bordo hover:bg-branco disabled:opacity-30"
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} strokeWidth={1.75} />
        </button>
      </div>

      {txs.status === 'loading' && <LoadingState rows={4} label="Carregando lançamentos…" />}
      {txs.status === 'error' && <ErrorState message={txs.error!} onRetry={txs.reload} />}

      {txs.status === 'ready' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={ArrowDownLeft} label="Entradas" value={formatCurrency(income)} hint={`${incomes.length} lançamentos`} />
            <StatCard icon={ArrowUpRight} label="Despesas" value={formatCurrency(expense)} hint={`${expenses.length} lançamentos`} />
            <StatCard icon={Scale} label="Saldo do mês" value={formatCurrency(income - expense)} hint={income - expense >= 0 ? 'Positivo' : 'Negativo'} />
          </div>

          {pending.length > 0 && (
            <Card className="mt-6 p-0">
              <h2 className="flex items-center gap-2 px-5 pt-5 pb-3 font-semibold">
                <Clock size={18} strokeWidth={1.75} className="text-bordo" aria-hidden />A receber
                <span className="text-sm font-normal text-bordo">
                  · {formatCurrency(pending.reduce((s, r) => s + r.total - r.paid, 0))}
                </span>
              </h2>
              <ul className="divide-y divide-rose/20">
                {pending.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.client.name}</span>
                      <span className="block truncate text-xs text-bordo">
                        {formatDate(r.start_at, 'dd/MM')} · {r.items.map((i) => i.service_name).join(' + ')} · pago {formatCurrency(r.paid)} de{' '}
                        {formatCurrency(r.total)}
                      </span>
                    </span>
                    <Button variant="outline" className="shrink-0" onClick={() => openForm('entrada', r)}>
                      Receber {formatCurrency(r.total - r.paid)}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
            <Card className="p-0">
              <h2 className="px-5 pt-5 pb-1 font-semibold">Fechamento do mês</h2>
              <p className="px-5 pb-3 text-xs text-bordo">Dinheiro: confira com a gaveta. Pix e cartões: confira com o extrato.</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-rose/25 text-xs text-bordo">
                    <th className="px-5 py-2 text-left font-medium">Forma</th>
                    <th className="py-2 text-right font-medium">Entrou</th>
                    <th className="py-2 text-right font-medium">Saiu</th>
                    <th className="px-5 py-2 text-right font-medium">Saldo</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {closingRows.map((r) => (
                    <tr key={r.method ?? 'sem'} className="border-b border-rose/15">
                      <td className="px-5 py-2.5">{r.method ? paymentLabels[r.method] : 'Sem forma'}</td>
                      <td className="py-2.5 text-right">{formatCurrency(r.in)}</td>
                      <td className="py-2.5 text-right text-bordo">{r.out ? `− ${formatCurrency(r.out)}` : formatCurrency(0)}</td>
                      <td className="px-5 py-2.5 text-right font-medium">{formatCurrency(r.in - r.out)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="px-5 py-3">Total</td>
                    <td className="py-3 text-right">{formatCurrency(income)}</td>
                    <td className="py-3 text-right">− {formatCurrency(expense)}</td>
                    <td className="px-5 py-3 text-right">{formatCurrency(income - expense)}</td>
                  </tr>
                </tbody>
              </table>
            </Card>

            <Card className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose/25 px-5 py-4">
                <h2 className="font-semibold">Lançamentos</h2>
                <ChipGroup
                  label="Filtrar lançamentos"
                  hideLabel
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: 'todas', label: 'Todos' },
                    { value: 'entrada', label: 'Entradas' },
                    { value: 'saida', label: 'Despesas' },
                  ]}
                />
              </div>
              {visible.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={Wallet}
                    title={list.length ? 'Nada com esse filtro' : 'Nenhum lançamento neste mês'}
                    description={list.length ? 'Troque o filtro para ver os outros lançamentos.' : 'Pagamentos recebidos pela agenda e despesas aparecem aqui.'}
                  />
                </div>
              ) : (
                <div className="max-h-[32rem] overflow-y-auto">
                  {Object.entries(groups).map(([date, items]) => (
                    <section key={date}>
                      <h3 className="sticky top-0 bg-rosa-claro/90 px-5 py-1.5 text-xs font-medium text-bordo backdrop-blur first-letter:uppercase">
                        {formatDay(date, 'EEEE, dd/MM')}
                      </h3>
                      <ul className="divide-y divide-rose/20">
                        {items.map((t) => (
                          <li key={t.id} className="flex items-center gap-3 py-2 pr-2 pl-5">
                            <span
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                                t.type === 'entrada' ? 'bg-rose/25 text-vinho' : 'bg-rosa-claro text-bordo'
                              }`}
                            >
                              {t.type === 'entrada' ? (
                                <ArrowDownLeft size={16} strokeWidth={1.75} aria-label="Entrada" />
                              ) : (
                                <ArrowUpRight size={16} strokeWidth={1.75} aria-label="Despesa" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{t.client_name ?? (t.description || t.category)}</span>
                              <span className="block truncate text-xs text-bordo">
                                {[t.category, t.client_name ? t.description : null, t.payment_method && paymentLabels[t.payment_method]]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            </span>
                            <span className={`text-sm font-semibold tabular-nums ${t.type === 'saida' ? 'text-bordo' : ''}`}>
                              {t.type === 'saida' ? '−' : '+'} {formatCurrency(t.amount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setRemoving(t)}
                              className="flex size-11 shrink-0 items-center justify-center rounded-lg text-bordo hover:bg-rosa-claro hover:text-bordo"
                              aria-label={`Apagar lançamento de ${formatCurrency(t.amount)}`}
                            >
                              <Trash2 size={16} strokeWidth={1.75} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {form && (
        <TransactionFormModal key={form.key} defaultType={form.type} appointment={form.appointment} onSaved={reloadAll} onClose={() => setForm(null)} />
      )}
      {removing && (
        <DeleteTransactionModal
          transaction={removing}
          onClose={() => setRemoving(null)}
          onDeleted={() => {
            setRemoving(null)
            reloadAll()
          }}
        />
      )}
    </>
  )
}

function DeleteTransactionModal({ transaction: t, onClose, onDeleted }: { transaction: Transaction; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setBusy(true)
    setError(null)
    const result = await deleteTransaction(t.id)
    setBusy(false)
    if (result.error !== null) return setError(result.error)
    onDeleted()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Apagar lançamento?"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Manter
          </Button>
          <Button onClick={confirm} disabled={busy}>
            <Trash2 size={16} strokeWidth={1.75} aria-hidden />
            {busy ? 'Apagando…' : 'Apagar'}
          </Button>
        </>
      }
    >
      <p className="text-sm">
        {t.type === 'entrada' ? 'Entrada' : 'Despesa'} de <strong>{formatCurrency(t.amount)}</strong> em {formatDay(t.date, 'dd/MM')} ·{' '}
        {t.client_name ?? t.category}
      </p>
      <p className="mt-2 text-sm text-bordo">
        Use para corrigir um lançamento errado: apague e lance de novo.
        {t.appointment_id && ' O atendimento volta a aparecer como “a receber”.'}
      </p>
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
          {error}
        </p>
      )}
    </Modal>
  )
}
