import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConsent } from '../../hooks/useConsent'
import { OPEN_CONSENT, saveConsent } from '../../utils/consent'

/**
 * Aviso de privacidade e consentimento (LGPD). Aparece até a visitante escolher
 * e pode ser reaberto pelo rodapé ("Preferências de privacidade").
 * Os dois botões têm o mesmo peso visual: recusar é tão fácil quanto aceitar.
 */
export default function ConsentBanner() {
  const consent = useConsent()
  const [reopened, setReopened] = useState(false)
  const firstButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const open = () => setReopened(true)
    window.addEventListener(OPEN_CONSENT, open)
    return () => window.removeEventListener(OPEN_CONSENT, open)
  }, [])

  const visible = consent === null || reopened

  useEffect(() => {
    if (reopened) firstButton.current?.focus()
  }, [reopened])

  if (!visible) return null

  const choose = (maps: boolean) => {
    saveConsent(maps)
    setReopened(false)
  }

  return (
    <section
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-[1.75rem] border border-branco bg-branco/95 p-5 shadow-soft backdrop-blur sm:bottom-5 sm:p-6"
    >
      <h2 id="consent-title" className="text-base font-semibold text-vinho">
        Sua privacidade
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-vinho/75">
        Este site não usa cookies de rastreamento nem de publicidade. O único conteúdo opcional é o <strong>mapa do Google</strong>,
        que só carrega se você permitir e envia ao Google dados da sua navegação.{' '}
        <Link to="/privacidade" className="font-medium text-bordo underline underline-offset-2">
          Política de Privacidade
        </Link>
      </p>
      {consent && (
        <p className="mt-2 text-xs text-vinho/70">Escolha atual: {consent.maps ? 'mapa permitido' : 'somente o essencial'}.</p>
      )}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          ref={firstButton}
          type="button"
          onClick={() => choose(false)}
          className="h-11 rounded-full border border-vinho px-5 text-sm font-medium text-vinho transition hover:bg-rosa-claro"
        >
          Usar só o essencial
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          className="h-11 rounded-full border border-vinho bg-vinho px-5 text-sm font-medium text-branco transition hover:bg-bordo"
        >
          Permitir o mapa
        </button>
      </div>
    </section>
  )
}
