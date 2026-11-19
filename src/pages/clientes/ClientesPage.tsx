import { Cake, ChevronRight, Search, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import EmptyState from '../../components/shared/EmptyState'
import ErrorState from '../../components/shared/ErrorState'
import LoadingState from '../../components/shared/LoadingState'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useListResource } from '../../hooks/useListResource'
import { useSettings } from '../../hooks/useSettings'
import { DEFAULT_TEMPLATES } from '../../utils/whatsappMessages'
import { useToday } from '../../hooks/useToday'
import { createClient, listClients, updateClient } from '../../services/clients'
import type { Client, ClientInput } from '../../types/models'
import ClientDetailModal from './ClientDetailModal'
import ClientFormModal from './ClientFormModal'

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

export default function ClientesPage() {
  const clients = useListResource(listClients)
  const settings = useSettings()
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<{ key: number; client: Client | null } | null>(null)
  const [viewing, setViewing] = useState<Client | null>(null)
  const thisMonth = useToday().slice(5, 7)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    const qDigits = query.replace(/\D/g, '')
    return clients.data
      .filter((c) => !q || normalize(c.name).includes(q) || (qDigits.length >= 3 && c.phone.replace(/\D/g, '').includes(qDigits)))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [clients.data, query])

  async function save(input: ClientInput) {
    const result = form?.client ? await updateClient(form.client.id, input) : await createClient(input)
    if (result.error !== null) return { error: result.error }
    clients.upsert(result.data)
    return { error: null, client: result.data }
  }

  const openForm = (client: Client | null) => setForm({ key: Date.now(), client })
  const total = clients.data.length

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle={clients.status === 'ready' ? `${total} ${total === 1 ? 'cadastrada' : 'cadastradas'}` : undefined}
        action={
          <Button onClick={() => openForm(null)}>
            <UserPlus size={18} strokeWidth={1.75} aria-hidden />
            Nova cliente
          </Button>
        }
      />

      {clients.status === 'loading' && <LoadingState label="Carregando clientes…" />}
      {clients.status === 'error' && <ErrorState message={clients.error!} onRetry={clients.reload} />}

      {clients.status === 'ready' && total === 0 && (
        <EmptyState
          icon={Users}
          title="Nenhuma cliente ainda"
          description="Cadastre a primeira cliente: só nome e WhatsApp já bastam."
          action={
            <Button variant="outline" onClick={() => openForm(null)}>
              Cadastrar cliente
            </Button>
          }
        />
      )}

      {clients.status === 'ready' && total > 0 && (
        <>
          <div className="relative mb-4">
            <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bordo" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou telefone"
              aria-label="Buscar cliente"
              className="h-12 w-full rounded-2xl border border-bordo/70 bg-branco pr-3 pl-10 text-vinho placeholder:text-bordo/80 focus:border-bordo"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhuma cliente encontrada"
              description={`Nada com "${query}". Confira a grafia ou cadastre uma nova cliente.`}
            />
          ) : (
            <Card className="p-0">
              <ul className="divide-y divide-rose/25">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setViewing(c)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-rosa-claro/50"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rosa-claro text-sm font-semibold text-bordo">
                        {initials(c.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-medium">
                          <span className="truncate">{c.name}</span>
                          {c.birthday?.slice(5, 7) === thisMonth && (
                            <Cake size={15} strokeWidth={1.75} className="shrink-0 text-bordo" aria-label="Aniversário este mês" />
                          )}
                        </span>
                        <span className="block truncate text-xs text-bordo">{c.phone || 'Sem telefone'}</span>
                      </span>
                      <ChevronRight size={18} strokeWidth={1.75} className="text-bordo" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {viewing && (
        <ClientDetailModal
          templates={settings.data?.message_templates ?? DEFAULT_TEMPLATES}
          key={viewing.id}
          client={viewing}
          onClose={() => setViewing(null)}
          onChanged={clients.upsert}
          onEdit={(c) => {
            setViewing(null)
            openForm(c)
          }}
        />
      )}
      {form && (
        <ClientFormModal
          key={form.key}
          open
          client={form.client}
          existing={clients.data}
          onSave={save}
          onClose={() => setForm(null)}
        />
      )}
    </>
  )
}
