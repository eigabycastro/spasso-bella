import { ArrowLeft, MessageCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { Link, useLocation, useOutletContext } from 'react-router-dom'
import type { SiteContext } from '../../components/layout/SiteLayout'
import { EASE } from '../../utils/motion'

/** Página 404: endereço que não existe no site nem no painel. */
export default function NotFoundPage() {
  const { booking, settings } = useOutletContext<SiteContext>()
  const { pathname } = useLocation()

  // Título da aba + pedir aos buscadores para não indexar esta página
  useEffect(() => {
    document.title = 'Página não encontrada · Spasso Bella MG'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => {
      document.title = 'Spasso Bella MG · Beauty Studio'
      robots.remove()
    }
  }, [])

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  })

  return (
    <section className="flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center px-5 py-16 text-center">
      {/* "4 [olho] 4" */}
      <h1 aria-label="Erro 404: página não encontrada" className="flex items-center justify-center gap-2 sm:gap-4">
        <motion.span
          aria-hidden
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="text-[7rem] leading-none font-semibold tracking-tighter text-vinho sm:text-[11rem]"
        >
          4
        </motion.span>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.3 }}
          className="relative flex size-28 items-center justify-center sm:size-44"
        >
          <span className="absolute inset-2 rounded-full bg-rose/60 blur-xl" />
          <svg viewBox="0 0 200 200" className="absolute -inset-4 size-[calc(100%+2rem)] motion-safe:animate-spin-slow">
            <circle cx="100" cy="100" r="96" fill="none" className="stroke-bordo/40" strokeWidth="1" strokeDasharray="2 6" />
          </svg>
          <span className="relative flex size-full items-center justify-center rounded-full bg-branco shadow-glow">
            {/* o olho "pisca" de vez em quando */}
            <motion.img
              src="/logo/spasso-bella-icone.png"
              alt=""
              width={512}
              height={512}
              className="w-[70%]"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ duration: 4, times: [0, 0.86, 0.9, 0.94, 1], repeat: Infinity, repeatDelay: 0.5, delay: 1.5 }}
            />
          </span>
        </motion.span>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="text-[7rem] leading-none font-semibold tracking-tighter text-vinho sm:text-[11rem]"
        >
          4
        </motion.span>
      </h1>

      <motion.h2 {...fadeUp(0.6)} className="mt-6 text-3xl font-semibold tracking-tight text-vinho sm:text-4xl">
        Página não encontrada
      </motion.h2>
      <motion.p {...fadeUp(0.75)} className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-vinho/75">
        O endereço <code className="rounded-md bg-branco/80 px-1.5 py-0.5 text-[15px] break-all text-vinho">{pathname}</code> não existe ou mudou
        de lugar. Confira se foi digitado certo ou volte para o início.
      </motion.p>

      <motion.div {...fadeUp(0.9)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-vinho px-7 text-[15px] font-medium text-branco shadow-soft transition hover:-translate-y-0.5 hover:bg-bordo active:scale-95"
        >
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
          Voltar para o início
        </Link>
        <Link
          to="/#procedimentos"
          className="inline-flex h-12 items-center rounded-full border border-vinho/30 bg-branco/80 px-7 text-[15px] font-medium text-vinho backdrop-blur transition hover:-translate-y-0.5 hover:bg-branco active:scale-95"
        >
          Ver procedimentos
        </Link>
      </motion.div>

      {booking && (
        <motion.p {...fadeUp(1.05)} className="mt-6 text-[15px] text-vinho/75">
          Quer marcar um horário?{' '}
          <a href={booking} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-bordo underline underline-offset-4 hover:text-vinho">
            <MessageCircle size={16} strokeWidth={1.75} aria-hidden />
            {settings?.phone ? 'Fale pelo WhatsApp' : 'Fale pelo Instagram'}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </motion.p>
      )}
    </section>
  )
}
