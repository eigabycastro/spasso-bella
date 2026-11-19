import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { fieldClasses } from './fieldClasses'

type Props = {
  label: string
  /** Sugestões, já na ordem (mais usadas primeiro) */
  options: string[]
  value: string
  onChange: (value: string) => void
  error?: string
}

/** Escolhe uma categoria existente com 1 toque ou cria uma nova digitando. */
export default function CategoryPicker({ label, options, value, onChange, error }: Props) {
  const isCustom = value !== '' && !options.includes(value)
  const [typing, setTyping] = useState(isCustom)

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-vinho">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = !typing && value === o
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setTyping(false)
                onChange(o)
              }}
              className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-sm sm:h-9 ${
                on ? 'border-bordo bg-rosa-claro font-medium text-vinho' : 'border-rose/60 text-bordo hover:border-bordo'
              }`}
            >
              {on && <Check size={14} strokeWidth={1.75} aria-hidden />}
              {o}
            </button>
          )
        })}
        <button
          type="button"
          aria-pressed={typing}
          onClick={() => {
            setTyping(true)
            onChange('')
          }}
          className={`inline-flex h-11 items-center gap-1.5 rounded-full border border-dashed px-3 text-sm sm:h-9 ${
            typing ? 'border-bordo bg-rosa-claro font-medium text-vinho' : 'border-rose text-bordo hover:border-bordo'
          }`}
        >
          <Plus size={14} strokeWidth={1.75} aria-hidden />
          Nova categoria
        </button>
      </div>
      {typing && (
        <input
          autoFocus
          aria-label="Nome da nova categoria"
          placeholder="Ex.: Aluguel, Energia, Cursos…"
          maxLength={40}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClasses(!!error)} mt-2 h-11`}
        />
      )}
      {error && <p className="mt-1 text-xs text-bordo">{error}</p>}
    </fieldset>
  )
}
