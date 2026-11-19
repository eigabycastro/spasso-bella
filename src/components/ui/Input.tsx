import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { fieldClasses } from './fieldClasses'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }

/** Rótulo visível + erro/dica ligados ao campo (aria-describedby), lidos pelo leitor de tela. */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, id, className = '', ...props }, ref) {
  const autoId = useId()
  const inputId = id ?? autoId
  const noteId = `${inputId}-note`
  const note = error || hint
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-vinho">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={note ? noteId : undefined}
        className={`${fieldClasses(!!error)} h-11 ${className}`}
        {...props}
      />
      {note && (
        <p id={noteId} role={error ? 'alert' : undefined} className={`mt-1 text-xs text-bordo ${error ? 'font-medium' : ''}`}>
          {note}
        </p>
      )}
    </div>
  )
})

export default Input
