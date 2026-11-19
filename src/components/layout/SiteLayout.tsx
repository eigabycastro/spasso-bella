import { MotionConfig, motion, useScroll, useSpring, useTransform } from 'motion/react'
import { Link, Outlet } from 'react-router-dom'
import { useResource } from '../../hooks/useResource'
import { getSettings } from '../../services/settings'
import type { BusinessSettings } from '../../types/models'
import { openConsentSettings } from '../../utils/consent'
import { whatsappLink } from '../../utils/whatsappLink'
import ConsentBanner from '../shared/ConsentBanner'
import SkipLink from '../shared/SkipLink'

export type SiteContext = { settings: BusinessSettings | null; booking: string | null; loading: boolean }

const BOOKING_MESSAGE = 'Olá! Vim pelo site e gostaria de agendar um horário.'

export default function SiteLayout() {
  const settings = useResource('site-settings', getSettings)
  const s = settings.data
  const booking = s?.phone ? whatsappLink(s.phone, BOOKING_MESSAGE) : s?.instagram ? `https://instagram.com/${s.instagram}` : null
  const context: SiteContext = { settings: s, booking, loading: settings.status === 'loading' }

  // Rolagem: barra de progresso, topo mais sólido e fundo com profundidade
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  const headerSolid = useTransform(scrollY, [0, 140], [0.55, 0.94])
  const headerShadow = useTransform(scrollY, [0, 140], [0, 1])
  const blobsY = useTransform(scrollY, [0, 1200], [0, -180])

  return (
    // reducedMotion="user": quem pede menos movimento no celular vê só um aparecer suave, sem deslocamentos
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-rosa-claro">
        <SkipLink />

        {/* Barra de progresso da leitura */}
        <motion.div aria-hidden style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-rose via-bordo to-vinho" />

        {/* Fundo vivo: manchas que se movem devagar + textura de papel */}
        <motion.div aria-hidden style={{ y: blobsY }} className="grain pointer-events-none fixed inset-x-0 top-0 -z-0 h-[170vh] overflow-hidden">
          <div className="absolute -top-48 -left-40 size-[38rem] rounded-full bg-rose/50 blur-3xl motion-safe:animate-drift-a" />
          <div className="absolute top-24 -right-48 size-[34rem] rounded-full bg-bordo/20 blur-3xl motion-safe:animate-drift-b" />
          <div className="absolute top-[55%] left-1/4 size-[30rem] rounded-full bg-branco/80 blur-3xl motion-safe:animate-drift-c" />
          <div className="absolute -bottom-40 right-1/4 size-[28rem] rounded-full bg-rose/35 blur-3xl motion-safe:animate-drift-a" />
        </motion.div>

        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-3 z-40 px-3 sm:top-4"
        >
          <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-full border border-branco/70 pr-2 pl-5 backdrop-blur-xl">
            <motion.span aria-hidden style={{ opacity: headerSolid }} className="absolute inset-0 -z-10 rounded-full bg-branco" />
            <motion.span aria-hidden style={{ opacity: headerShadow }} className="absolute inset-0 -z-20 rounded-full shadow-soft" />
            <Link to="/" className="font-script text-[1.7rem] leading-none whitespace-nowrap text-vinho" aria-label="Spasso Bella, página inicial">
              Spasso Bella
            </Link>
            <nav aria-label="Seções do site" className="flex items-center gap-5 text-sm text-vinho/80">
              <a href="/#procedimentos" className="hidden transition-colors hover:text-vinho sm:inline">
                Procedimentos
              </a>
              <a href="/#onde" className="hidden transition-colors hover:text-vinho sm:inline">
                Onde estamos
              </a>
              {booking && (
                <a
                  href={booking}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-full bg-vinho px-5 text-sm font-medium text-branco transition hover:scale-[1.03] hover:bg-bordo active:scale-95"
                >
                  Agendar
                  <span className="sr-only"> pelo {s?.phone ? 'WhatsApp' : 'Instagram'} (abre em nova aba)</span>
                </a>
              )}
            </nav>
          </div>
        </motion.header>

        <main id="conteudo" tabIndex={-1} className="relative z-10 flex-1 focus:outline-none">
          <Outlet context={context} />
        </main>

        <footer className="relative z-10 px-5 pt-6 pb-10">
          <div className="mx-auto flex max-w-5xl flex-col gap-5 border-t border-vinho/15 pt-8 text-center text-[13px] text-vinho/75 sm:text-left">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p>
                <span className="font-script text-xl text-vinho">Spasso Bella</span>
                <span className="mx-2" aria-hidden>
                  ·
                </span>
                MG Beauty Studio
              </p>
              <nav aria-label="Informações legais" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
                <Link to="/privacidade" className="inline-flex min-h-11 items-center underline-offset-2 hover:text-vinho hover:underline">
                  Política de Privacidade
                </Link>
                <Link to="/termos" className="inline-flex min-h-11 items-center underline-offset-2 hover:text-vinho hover:underline">
                  Termos de Uso
                </Link>
                <button type="button" onClick={openConsentSettings} className="inline-flex min-h-11 items-center underline-offset-2 hover:text-vinho hover:underline">
                  Preferências de privacidade
                </button>
                <Link to="/login" className="inline-flex min-h-11 items-center underline-offset-2 hover:text-vinho hover:underline">
                  Área da profissional
                </Link>
              </nav>
            </div>
            {/* Identificação do fornecedor (Decreto 7.962/2013): mostra só o que foi preenchido */}
            {(s?.legal_name || s?.document_id || s?.address) && (
              <p className="text-xs">{[s.legal_name, s.document_id && `CNPJ/CPF ${s.document_id}`, s.address].filter(Boolean).join(' · ')}</p>
            )}
          </div>
        </footer>

        <ConsentBanner />
      </div>
    </MotionConfig>
  )
}
