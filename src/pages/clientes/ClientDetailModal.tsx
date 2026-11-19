import { Cake, Download, MessageCircle, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import StatusBadge from '../../components/shared/StatusBadge'
import Button from '../../components/ui/Button'
import { buttonClasses } from '../../components/ui/buttonClasses'
import Modal from '../../components/ui/Modal'
import { anonymizeClient, exportClientData, getClientHistory, type ClientHistory } from '../../services/clients'
import type { Client, MessageTemplates } from '../../types/models'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate, formatDay } from '../../utils/formatDate'
import { whatsappLink } from '../../utils/whatsappLink'
import { birthdayMessage } from '../../utils/whatsappMessages'

type HistoryState = { status: 'loading' } | { status: 'error'; error: string } | { status: 'ready'; data: ClientHistory }

/** Renderize com `key={client.id}` para recarregar o histórico ao trocar de cliente. */
type Props = { client: Client; templates: MessageTemplates; onClose: () => void; onEdit: (c: Client) => void; onChanged: (c: Client) => void }

export default function ClientDetailModal({ client, templates, onClose, onEdit, onChanged }: Props) {
  const [history, setHistory] = useState<HistoryState>({ status: 'loading' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [privacyMsg, setPrivacyMsg] = useState<string | null>(null)
  const removed = client.name === 'Cliente removida' && !client.phone

  async function exportData() {
    setBusy(true)
    setPrivacyMsg(null)
    const r = await exportClientData(client)
    setBusy(false)
    if (r.error !== null) return setPrivacyMsg(r.error)
    const url = URL.createObjectURL(r.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `dados-${client.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    setPrivacyMsg('Arquivo gerado. Envie para a cliente pelo WhatsApp ou e-mail.')
  }

  async function deleteData() {
    setBusy(true)
    setPrivacyMsg(null)
    const r = await anonymizeClient(client.id)
    setBusy(false)
    if (r.error !== null) return setPrivacyMsg(r.error)
    setConfirmDelete(false)
    onChanged(r.data)
    onClose()
  }

  useEffect(() => {
    let active = true
    getClientHistory(client.id).then((r) => {
      if (active) setHistory(r.error === null ? { status: 'ready', data: r.data } : { status: 'error', error: r.error })
    })
    return () => {
      active = false
    }
  }, [client.id])

  const done = history.status === 'ready' ? history.data.appointments.filter((a) => a.status === 'concluido').length : null

  return (
    <Modal
      open
      onClose={onClose}
      title={client.name}
      footer={
        <>
          <Button variant="outline" onClick={() => onEdit(client)}>
            <Pencil size={16} strokeWidth={1.75} aria-hidden />
            Editar
          </Button>
          {client.phone ? (
            <a href={whatsappLink(client.phone)} target="_blank" rel="noreferrer" className={buttonClasses('primary')}>
              <MessageCircle size={18} strokeWidth={1.75} aria-hidden />
              Abrir WhatsApp
            </a>
          ) : (
            <Button disabled>Sem telefone</Button>
          )}
        </>
      }
    >
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs text-bordo">Telefone</dt>
          <dd className="font-medium">{client.phone || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-bordo">Aniversário</dt>
          <dd className="font-medium">{client.birthday ? formatDay(client.birthday, "dd 'de' MMMM") : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-bordo">Atendimentos</dt>
          <dd className="font-medium">{done ?? '…'}</dd>
        </div>
        <div>
          <dt className="text-xs text-bordo">Total pago</dt>
          <dd className="font-medium">{history.status === 'ready' ? formatCurrency(history.data.totalPaid) : '…'}</dd>
        </div>
      </dl>

      {client.notes && <p className="mt-4 rounded-xl bg-rosa-claro px-3 py-2 text-sm whitespace-pre-line">{client.notes}</p>}

      {client.birthday && client.phone && (
        <a
          href={whatsappLink(client.phone, birthdayMessage(templates, client.name))}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-bordo underline-offset-4 hover:underline"
        >
          <Cake size={16} strokeWidth={1.75} aria-hidden />
          Enviar parabéns pelo WhatsApp
        </a>
      )}

      <h3 className="mt-6 mb-2 text-sm font-semibold">Histórico</h3>
      {history.status === 'loading' && <p className="text-sm text-bordo">Carregando…</p>}
      {history.status === 'error' && <p className="text-sm text-bordo">{history.error}</p>}
      {history.status === 'ready' &&
        (history.data.appointments.length === 0 ? (
          <p className="text-sm text-bordo">Nenhum atendimento ainda.</p>
        ) : (
          <ul className="divide-y divide-rose/25">
            {history.data.appointments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block font-medium">{formatDate(a.start_at, "dd/MM/yy 'às' HH:mm")}</span>
                  <span className="block truncate text-xs text-bordo">{a.services}</span>
                </span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        ))}

      {!removed && (
        <section aria-labelledby="privacy-title" className="mt-6 rounded-2xl border border-rose/50 p-4">
          <h3 id="privacy-title" className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck size={16} strokeWidth={1.75} className="text-bordo" aria-hidden />
            Privacidade da cliente (LGPD)
          </h3>
          {confirmDelete ? (
            <div role="alert" className="mt-3 text-sm">
              <p>
                Apagar nome, telefone, aniversário e observações de <strong>{client.name}</strong>? Os atendimentos e pagamentos ficam no
                histórico, sem identificar a cliente. <strong>Não dá para desfazer.</strong>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={busy}>
                  Manter os dados
                </Button>
                <Button variant="outline" onClick={deleteData} disabled={busy}>
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                  {busy ? 'Excluindo…' : 'Sim, excluir os dados'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 text-xs text-bordo">Se a cliente pedir, você pode entregar uma cópia dos dados dela ou excluí-los.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportData} disabled={busy}>
                  <Download size={16} strokeWidth={1.75} aria-hidden />
                  Exportar dados
                </Button>
                <Button variant="outline" onClick={() => setConfirmDelete(true)} disabled={busy}>
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                  Excluir dados pessoais
                </Button>
              </div>
            </>
          )}
          {privacyMsg && (
            <p role="status" className="mt-3 text-sm font-medium text-vinho">
              {privacyMsg}
            </p>
          )}
        </section>
      )}
    </Modal>
  )
}
