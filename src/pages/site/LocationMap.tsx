import { MapPin, Navigation } from 'lucide-react'
import { useState } from 'react'
import { useConsent } from '../../hooks/useConsent'
import { saveConsent } from '../../utils/consent'

type Props = { address: string; mapsUrl?: string }

/**
 * Cartão do endereço: ao tocar, abre o mapa do Google com o pino do salão.
 * O mapa é conteúdo de terceiro: só carrega com permissão (LGPD).
 */
export default function LocationMap({ address, mapsUrl }: Props) {
  const consent = useConsent()
  const [open, setOpen] = useState(false)
  const [asking, setAsking] = useState(false)
  const q = encodeURIComponent(address)
  const directions = mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${q}`

  const tap = () => (consent?.maps ? setOpen(true) : setAsking(true))
  const allow = () => {
    saveConsent(true)
    setAsking(false)
    setOpen(true)
  }

  return (
    <div className="overflow-hidden rounded-[2rem] bg-branco shadow-soft">
      {open ? (
        <iframe
          title={`Mapa do Google: ${address}`}
          src={`https://www.google.com/maps?q=${q}&z=17&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block aspect-[4/3] w-full sm:aspect-[16/10]"
        />
      ) : asking ? (
        <div role="dialog" aria-labelledby="map-consent" className="flex aspect-[4/3] flex-col items-center justify-center gap-4 bg-rosa-claro p-6 text-center sm:aspect-[16/10]">
          <p id="map-consent" className="max-w-sm text-[15px] leading-relaxed text-vinho">
            O mapa é carregado do <strong>Google Maps</strong>, que recebe dados da sua navegação (como o endereço IP). Deseja carregar?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              autoFocus
              onClick={allow}
              className="h-11 rounded-full bg-vinho px-5 text-sm font-medium text-branco transition hover:bg-bordo"
            >
              Carregar o mapa
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="h-11 rounded-full border border-vinho px-5 text-sm font-medium text-vinho transition hover:bg-branco"
            >
              Agora não
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={tap}
          className="group relative block aspect-[4/3] w-full overflow-hidden bg-rosa-claro sm:aspect-[16/10]"
          aria-label={`Ver no mapa: ${address}`}
        >
          {/* Desenho de ruas (decorativo) */}
          <svg aria-hidden viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
            <rect width="400" height="250" className="fill-rosa-claro" />
            <g className="fill-rose/25">
              <rect x="18" y="20" width="110" height="70" rx="10" />
              <rect x="150" y="20" width="90" height="70" rx="10" />
              <rect x="262" y="20" width="120" height="70" rx="10" />
              <rect x="18" y="112" width="70" height="118" rx="10" />
              <rect x="110" y="112" width="130" height="50" rx="10" />
              <rect x="110" y="182" width="130" height="48" rx="10" />
              <rect x="262" y="112" width="120" height="118" rx="10" />
            </g>
            <path d="M0 101 H400 M139 0 V250 M251 0 V250 M99 101 V250" className="stroke-branco" strokeWidth="12" fill="none" />
            <path d="M0 101 H400 M139 0 V250 M251 0 V250" className="stroke-rose/50" strokeWidth="1.5" strokeDasharray="6 8" fill="none" />
          </svg>

          <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-[85%] flex-col items-center" aria-hidden>
            <span className="flex size-14 items-center justify-center rounded-full bg-vinho text-branco shadow-soft ring-8 ring-vinho/15 transition-transform duration-300 group-hover:-translate-y-1 motion-safe:animate-float">
              <MapPin size={24} strokeWidth={1.75} />
            </span>
            <span className="mt-1 h-1.5 w-6 rounded-full bg-vinho/20 blur-[2px]" />
          </span>

          <span className="absolute inset-x-0 bottom-5 flex justify-center" aria-hidden>
            <span className="rounded-full bg-branco px-4 py-2 text-sm font-medium text-vinho shadow-soft transition group-hover:bg-rosa-claro">
              Toque para ver no mapa
            </span>
          </span>
        </button>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <p className="flex items-start gap-2 text-[15px] text-vinho">
          <MapPin size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-bordo" aria-hidden />
          {address}
        </p>
        <a
          href={directions}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-vinho px-5 text-sm font-medium text-vinho transition hover:bg-rosa-claro"
        >
          <Navigation size={16} strokeWidth={1.75} aria-hidden />
          Como chegar no Google Maps
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>
    </div>
  )
}
