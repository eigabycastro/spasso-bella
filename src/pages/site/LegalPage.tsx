import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { BusinessSettings } from '../../types/models'

/** Molde das páginas legais: título, data de atualização e texto legível (linhas curtas, bom contraste). */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Spasso Bella MG`
    window.scrollTo(0, 0)
    return () => {
      document.title = 'Spasso Bella MG · Beauty Studio'
    }
  }, [title])

  return (
    <article className="px-5 pt-14 pb-24 sm:pt-20">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-branco p-7 shadow-soft sm:p-12">
        <p className="text-sm">
          <Link to="/" className="font-medium text-bordo underline underline-offset-2 hover:text-vinho">
            Voltar para o início
          </Link>
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-vinho sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-vinho/75">Última atualização: {updated}</p>
        <div className="legal mt-8 space-y-8 text-[16px] leading-relaxed text-vinho/80">{children}</div>
      </div>
    </article>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-vinho">{title}</h2>
      {children}
    </section>
  )
}

export function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-bordo">{children}</ul>
}

/** Mostra um dado legal ou avisa, sem inventar, que ainda não foi informado. */
export function Fill({ value }: { value: string }) {
  return value ? <strong className="font-semibold text-vinho">{value}</strong> : <em className="text-bordo">(ainda não informado)</em>
}

/** Bloco de identificação do controlador / fornecedor. */
export function Identification({ s }: { s: BusinessSettings | null }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 rounded-2xl bg-rosa-claro p-5 text-[15px] sm:grid-cols-[auto_1fr]">
      <dt className="text-vinho/75">Nome empresarial</dt>
      <dd>
        <Fill value={s?.legal_name || ''} />
      </dd>
      <dt className="text-vinho/75">Nome fantasia</dt>
      <dd>
        <Fill value={s?.business_name || 'Spasso Bella MG'} />
      </dd>
      <dt className="text-vinho/75">CNPJ / CPF</dt>
      <dd>
        <Fill value={s?.document_id || ''} />
      </dd>
      <dt className="text-vinho/75">Endereço</dt>
      <dd>
        <Fill value={s?.address || ''} />
      </dd>
      <dt className="text-vinho/75">E-mail</dt>
      <dd>
        <Fill value={s?.contact_email || ''} />
      </dd>
      <dt className="text-vinho/75">WhatsApp</dt>
      <dd>
        <Fill value={s?.phone || ''} />
      </dd>
    </dl>
  )
}
