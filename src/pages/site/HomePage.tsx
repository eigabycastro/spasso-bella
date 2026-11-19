import { AtSign, Clock, MessageCircle } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { SiteContext } from '../../components/layout/SiteLayout'
import Reveal from '../../components/shared/Reveal'
import { useResource } from '../../hooks/useResource'
import { listPublicServices } from '../../services/catalog'
import { listGallery } from '../../services/gallery'
import { formatCurrency } from '../../utils/formatCurrency'
import { minutesToLabel } from '../../utils/formatDate'
import { serviceCategories, weekdayLabels } from '../../utils/labels'
import { EASE } from '../../utils/motion'
import Hero from './Hero'
import LocationMap from './LocationMap'
import ServicesMarquee from './ServicesMarquee'

// Procedimentos do logo: aparecem enquanto não houver serviços públicos cadastrados
const logoProcedures = ['Cabelo', 'Make', 'Design de sobrancelhas', 'Limpeza de pele', 'Brow lamination', 'Lash lifting', 'Extensão de cílios']
const displayOrder = [1, 2, 3, 4, 5, 6, 0]

// Diferenciais: só fatos verificáveis (CDC art. 37) — uma profissional, os serviços do logo, agendamento por mensagem
const HIGHLIGHTS = [
  ['Um horário só seu', 'Uma profissional, uma cliente por vez: o horário fica reservado para você.'],
  ['Do cabelo aos cílios', 'Do design de sobrancelhas à extensão de cílios, tudo num lugar só.'],
  ['Agende em uma mensagem', 'Escolha o procedimento e mande uma mensagem. A confirmação chega por lá.'],
]

/** Lista que entra item por item */
const listVariants = { hidden: {}, shown: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }
const itemVariants = { hidden: { opacity: 0, y: 18 }, shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }

function SoftButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-12 items-center gap-2 rounded-full border border-vinho/30 bg-branco/80 px-7 text-[15px] font-medium text-vinho backdrop-blur transition hover:-translate-y-0.5 hover:bg-branco active:scale-95"
    >
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  )
}

/** Título de seção: pequeno rótulo + título grande, centralizados. */
function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium tracking-[0.2em] text-bordo uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-vinho sm:text-5xl">{title}</h2>
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, ease: EASE }}
        className="mx-auto mt-5 block h-px w-24 origin-center bg-gradient-to-r from-transparent via-bordo to-transparent"
      />
      {text && <p className="mt-4 text-[17px] leading-relaxed text-vinho/75">{text}</p>}
    </Reveal>
  )
}

export default function HomePage() {
  const { settings: s, booking } = useOutletContext<SiteContext>()
  const services = useResource('site-services', listPublicServices)
  const gallery = useResource('site-gallery', () => listGallery(true))

  const list = services.data ?? []
  const photos = gallery.data ?? []
  const categories = serviceCategories.filter((c) => list.some((x) => x.category === c))
  const viaWhatsapp = !!s?.phone
  const bookingLabel = viaWhatsapp ? 'Agendar pelo WhatsApp' : 'Falar pelo Instagram'
  const BookingIcon = viaWhatsapp ? MessageCircle : AtSign
  const marqueeItems = list.length ? [...new Set(list.map((x) => x.name))] : logoProcedures

  return (
    <>
      <Hero booking={booking} bookingLabel={bookingLabel} viaWhatsapp={viaWhatsapp} />

      <ServicesMarquee items={marqueeItems} />

      {/* ——— Diferenciais ——— */}
      <section id="diferenciais" className="scroll-mt-24 px-5 pt-10 pb-24">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map(([title, text], i) => (
            <Reveal key={title} delay={i * 120}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-[1.75rem] bg-branco/85 p-7 shadow-soft backdrop-blur transition-shadow hover:shadow-glow"
              >
                <span aria-hidden className="absolute -top-6 -right-2 text-[6rem] leading-none font-semibold text-rose/30 transition-colors group-hover:text-rose/50">
                  0{i + 1}
                </span>
                <span aria-hidden className="block h-1 w-8 rounded-full bg-rose transition-all duration-500 group-hover:w-16 group-hover:bg-bordo" />
                <h3 className="relative mt-5 text-xl font-semibold tracking-tight text-vinho">{title}</h3>
                <p className="relative mt-2 text-[15px] leading-relaxed text-vinho/75">{text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— Procedimentos ——— */}
      <section id="procedimentos" className="scroll-mt-24 px-5 pb-24">
        <SectionTitle
          eyebrow="Procedimentos"
          title="Procedimentos e valores"
          text={list.length ? 'Valores por procedimento. A duração é aproximada.' : undefined}
        />

        {services.status !== 'loading' && list.length === 0 && (
          <motion.ul
            variants={listVariants}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true }}
            className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2.5"
          >
            {logoProcedures.map((p) => (
              <motion.li key={p} variants={itemVariants} className="rounded-full bg-branco px-5 py-2.5 text-[15px] text-vinho shadow-soft">
                {p}
              </motion.li>
            ))}
          </motion.ul>
        )}

        {categories.length > 0 && (
          <div className={`mx-auto mt-12 grid gap-5 ${categories.length > 1 ? 'max-w-5xl md:grid-cols-2' : 'max-w-2xl'}`}>
            {categories.map((cat, i) => (
              <Reveal key={cat} delay={(i % 2) * 120}>
                <div className="h-full rounded-[2rem] bg-branco p-7 shadow-soft transition-shadow duration-500 hover:shadow-glow sm:p-8">
                  <span className="inline-flex rounded-full bg-rosa-claro px-3.5 py-1 text-xs font-medium tracking-wide text-bordo">{cat}</span>
                  <motion.ul variants={listVariants} initial="hidden" whileInView="shown" viewport={{ once: true }} className="mt-4 divide-y divide-rose/30">
                    {list
                      .filter((x) => x.category === cat)
                      .map((x) => (
                        <motion.li
                          key={x.id}
                          variants={itemVariants}
                          className="-mx-3 flex items-start justify-between gap-5 rounded-2xl px-3 py-4 transition-colors hover:bg-rosa-claro/70"
                        >
                          <div className="min-w-0">
                            <p className="text-lg font-medium tracking-tight text-vinho">{x.name}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-vinho/75">
                              <Clock size={13} strokeWidth={1.75} aria-hidden />
                              {minutesToLabel(x.duration_min)}
                            </p>
                            {x.description && <p className="mt-1.5 text-sm leading-relaxed text-vinho/75">{x.description}</p>}
                          </div>
                          <p className="shrink-0 text-lg font-semibold text-vinho tabular-nums">{formatCurrency(x.price)}</p>
                        </motion.li>
                      ))}
                  </motion.ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ——— Galeria (só aparece quando houver fotos) ——— */}
      {photos.length > 0 && (
        <section className="px-5 pb-24">
          <SectionTitle eyebrow="Galeria" title="Resultados" />
          <motion.ul
            variants={listVariants}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.1 }}
            className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
          >
            {photos.map((p, i) => (
              <motion.li key={p.id} variants={itemVariants} className={i === 0 ? 'lg:row-span-2' : ''}>
                <figure className="group h-full overflow-hidden rounded-[1.75rem] border-4 border-branco shadow-soft">
                  <img
                    src={p.url}
                    alt={p.caption || 'Trabalho do Spasso Bella'}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                      i === 0 ? 'aspect-[4/5] lg:aspect-auto lg:h-full' : 'aspect-square'
                    }`}
                  />
                </figure>
              </motion.li>
            ))}
          </motion.ul>
          {s?.instagram && (
            <p className="mt-8 text-center">
              <SoftButton href={`https://instagram.com/${s.instagram}`}>
                <AtSign size={18} strokeWidth={1.75} aria-hidden />
                Mais no @{s.instagram}
              </SoftButton>
            </p>
          )}
        </section>
      )}

      {/* ——— Onde estamos ——— */}
      <section id="onde" className="scroll-mt-24 px-5 pb-24">
        <SectionTitle eyebrow="Onde estamos" title="Venha nos visitar" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="h-full rounded-[2rem] bg-branco p-7 shadow-soft sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-vinho">
                <Clock size={18} strokeWidth={1.75} className="text-bordo" aria-hidden />
                Horários
              </h3>
              {s ? (
                <>
                  <motion.dl variants={listVariants} initial="hidden" whileInView="shown" viewport={{ once: true }} className="mt-4 divide-y divide-rose/30 text-[15px]">
                    {displayOrder.map((i) => {
                      const h = s.opening_hours[i]
                      return (
                        <motion.div key={i} variants={itemVariants} className="flex justify-between py-2.5">
                          <dt className="text-vinho">{weekdayLabels[i]}</dt>
                          <dd className="text-vinho/75 tabular-nums">{h.open ? `${h.start} – ${h.end}` : 'Fechado'}</dd>
                        </motion.div>
                      )
                    })}
                  </motion.dl>
                  {s.lunch.enabled && (
                    <p className="mt-4 rounded-2xl bg-rosa-claro px-4 py-3 text-sm text-vinho/80">
                      Pausa para almoço das {s.lunch.start} às {s.lunch.end}.
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-vinho/75">Carregando…</p>
              )}
              {s?.instagram && (
                <a
                  href={`https://instagram.com/${s.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-bordo hover:text-vinho"
                >
                  <AtSign size={18} strokeWidth={1.75} aria-hidden />@{s.instagram}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={150}>
            {s?.address ? (
              <LocationMap address={s.address} mapsUrl={s.maps_url || undefined} />
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-[2rem] bg-branco/75 p-8 text-center text-[15px] text-vinho/75 shadow-soft">
                O endereço é enviado na confirmação do horário.
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ——— Fechamento ——— */}
      {booking && (
        <section className="px-5 pb-20">
          <Reveal>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-vinho px-6 py-16 text-center sm:py-24">
              <div aria-hidden className="absolute -top-28 -right-20 size-80 rounded-full bg-rose/45 blur-3xl motion-safe:animate-drift-b" />
              <div aria-hidden className="absolute -bottom-32 -left-16 size-80 rounded-full bg-bordo blur-3xl motion-safe:animate-drift-a" />
              <svg aria-hidden viewBox="0 0 200 200" className="absolute top-1/2 left-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 opacity-20 motion-safe:animate-spin-slower">
                <circle cx="100" cy="100" r="96" fill="none" className="stroke-rose" strokeWidth="0.3" strokeDasharray="1 4" />
                <circle cx="100" cy="100" r="70" fill="none" className="stroke-rose" strokeWidth="0.3" strokeDasharray="1 6" />
              </svg>
              <div className="relative">
                <p className="font-script text-5xl text-rose sm:text-7xl">Spasso Bella</p>
                <h2 className="mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight text-branco sm:text-5xl">Seu horário está a uma mensagem.</h2>
                <span className="relative mt-10 inline-flex">
                  <span aria-hidden className="absolute inset-0 rounded-full bg-branco/40 motion-safe:animate-pulse-ring" />
                  <a
                    href={booking}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-branco px-8 text-base font-medium text-vinho transition hover:-translate-y-0.5 hover:bg-rosa-claro active:scale-95"
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-rose/40 to-transparent motion-safe:animate-shimmer" />
                    <BookingIcon size={18} strokeWidth={1.75} aria-hidden />
                    {bookingLabel}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </span>
              </div>
            </div>
          </Reveal>
        </section>
      )}
    </>
  )
}
