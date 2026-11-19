function MarqueeRow({ items, reverse, className }: { items: string[]; reverse?: boolean; className: string }) {
  return (
    <div className={`flex w-max motion-safe:animate-marquee ${reverse ? '[animation-direction:reverse]' : ''} ${className}`}>
      {items.map((name, i) => (
        <span key={i} className="flex items-center gap-6 px-6 whitespace-nowrap">
          {name}
          <span className="text-rose">✦</span>
        </span>
      ))}
    </div>
  )
}

/**
 * Duas faixas cruzadas com os procedimentos passando sem parar.
 * Decorativo (os mesmos nomes estão na lista de procedimentos): escondido do leitor de tela.
 */
export default function ServicesMarquee({ items }: { items: string[] }) {
  // Repete até preencher bem a faixa; depois duplica para a volta ficar contínua (-50%)
  const base = items.length < 6 ? [...items, ...items, ...items] : items
  const loop = [...base, ...base]

  return (
    <div aria-hidden className="relative my-6 h-40 overflow-hidden sm:h-48">
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[3deg] bg-rose/45 py-3 shadow-soft">
        <MarqueeRow items={loop} reverse className="text-lg font-medium tracking-wide text-vinho uppercase" />
      </div>
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 -rotate-[2deg] bg-vinho py-4 shadow-soft">
        <MarqueeRow items={loop} className="text-xl font-medium tracking-wide text-branco uppercase sm:text-2xl" />
      </div>
    </div>
  )
}
