import { ChevronDown, MessageCircle, AtSign } from 'lucide-react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef, type MouseEvent } from 'react'
import { EASE } from '../../utils/motion'

type Props = { booking: string | null; bookingLabel: string; viaWhatsapp: boolean }

const TAGLINE = 'Beleza, cuidado e autoestima.'.split(' ')

/**
 * Abertura animada. O nome "se escreve", as palavras sobem em sequência e o medalhão
 * inclina com o mouse (computador) e tem profundidade na rolagem.
 */
export default function Hero({ booking, bookingLabel, viaWhatsapp }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const medalY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // Inclinação com o mouse (só onde existe mouse)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 14 })
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 14 })
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  const BookingIcon = viaWhatsapp ? MessageCircle : AtSign

  return (
    <section ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="relative px-5 pt-12 pb-16 sm:pt-20 lg:min-h-[calc(100dvh-5rem)] lg:pb-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div style={{ y: textY, opacity: fade }} className="text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-branco bg-branco/70 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-bordo uppercase backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-bordo motion-safe:animate-pulse" aria-hidden />
            MG · Beauty Studio
          </motion.span>

          <h1 className="mt-6">
            {/* O nome "se escreve" da esquerda para a direita */}
            <motion.span
              initial={{ clipPath: 'inset(-30% 100% -40% 0)' }}
              animate={{ clipPath: 'inset(-30% 0% -40% 0)' }}
              transition={{ duration: 1.8, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
              className="block font-script text-[3.75rem] leading-[1.05] whitespace-nowrap text-vinho sm:text-[6.75rem]"
            >
              Spasso Bella
            </motion.span>
            <span className="mt-3 block text-2xl font-medium tracking-tight text-vinho sm:text-[2rem]">
              {TAGLINE.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.9, delay: 1.2 + i * 0.09, ease: EASE }}
                  >
                    {word}&nbsp;
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.6, ease: EASE }}
            className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-vinho/75 lg:mx-0"
          >
            Cabelo, make, sobrancelhas, pele e cílios, com hora marcada e atenção só para você.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.8, ease: EASE }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            {booking && (
              <a
                href={booking}
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-vinho px-7 text-[15px] font-medium text-branco shadow-soft transition hover:-translate-y-0.5 hover:bg-bordo active:scale-95"
              >
                {/* brilho que atravessa o botão */}
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-branco/35 to-transparent motion-safe:animate-shimmer" />
                <BookingIcon size={18} strokeWidth={1.75} aria-hidden />
                {bookingLabel}
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            )}
            <a
              href="#procedimentos"
              className="inline-flex h-12 items-center rounded-full border border-vinho/30 bg-branco/80 px-7 text-[15px] font-medium text-vinho backdrop-blur transition hover:-translate-y-0.5 hover:bg-branco active:scale-95"
            >
              Ver procedimentos
            </a>
          </motion.div>
        </motion.div>

        {/* Medalhão com o olho do logo */}
        <motion.div style={{ y: medalY }} className="relative mx-auto w-full max-w-[21rem] [perspective:1000px] sm:max-w-[24rem]">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.4, delay: 0.5, ease: EASE }}
            style={{ rotateX, rotateY }}
            className="relative aspect-square"
          >
            <div className="absolute inset-4 rounded-full bg-rose/60 blur-2xl" aria-hidden />
            {/* Anéis decorativos girando devagar */}
            <svg aria-hidden viewBox="0 0 200 200" className="absolute -inset-5 size-[calc(100%+2.5rem)] motion-safe:animate-spin-slow">
              <circle cx="100" cy="100" r="97" fill="none" className="stroke-bordo/40" strokeWidth="0.6" strokeDasharray="2 5" />
            </svg>
            <svg aria-hidden viewBox="0 0 200 200" className="absolute -inset-10 size-[calc(100%+5rem)] motion-safe:animate-spin-slower">
              <circle cx="100" cy="100" r="98" fill="none" className="stroke-rose" strokeWidth="0.5" strokeDasharray="60 20 4 20" />
              <circle cx="100" cy="2" r="2.2" className="fill-bordo" />
            </svg>
            <div className="relative size-full rounded-full bg-gradient-to-br from-branco via-branco to-rose/50 p-3 shadow-glow">
              <div className="flex size-full items-center justify-center rounded-full bg-branco">
                <img src="/logo/spasso-bella-icone.png" alt="" width={512} height={512} className="w-[66%] motion-safe:animate-float" />
              </div>
            </div>
          </motion.div>

          {/* Etiquetas flutuantes (fatos: uma profissional; hora marcada) */}
          <motion.span
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 2 }}
            className="absolute -bottom-3 left-0 rounded-full bg-branco px-4 py-2.5 text-sm whitespace-nowrap text-vinho shadow-soft sm:-left-6"
          >
            <span className="motion-safe:animate-float inline-block">Uma cliente por vez</span>
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 2.2 }}
            className="absolute top-6 right-0 rounded-full bg-vinho px-4 py-2.5 text-sm whitespace-nowrap text-branco shadow-soft sm:-right-4"
          >
            Com hora marcada
          </motion.span>
        </motion.div>
      </div>

      {/* Convite para rolar */}
      <motion.a
        href="#diferenciais"
        aria-label="Rolar para conhecer o studio"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1 }}
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-vinho/75 lg:flex"
      >
        Role para conhecer
        <ChevronDown size={18} strokeWidth={1.75} className="motion-safe:animate-nudge" aria-hidden />
      </motion.a>
    </section>
  )
}
