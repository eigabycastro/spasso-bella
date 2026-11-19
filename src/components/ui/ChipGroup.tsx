type ChipGroupProps<T extends string> = {
  label?: string
  /** Usa o label só para leitores de tela */
  hideLabel?: boolean
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/** Escolha única em botões (forma de pagamento, Dia/Semana, filtros…): 1 toque em vez de abrir lista. */
export default function ChipGroup<T extends string>({ label, hideLabel, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label}>
      {label && !hideLabel && <span className="mb-1.5 block text-sm font-medium text-vinho">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`h-11 rounded-full sm:h-9 border px-4 text-sm font-medium transition-colors ${
                active ? 'border-bordo bg-rosa-claro text-vinho' : 'border-rose/60 bg-branco text-bordo hover:border-bordo'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
