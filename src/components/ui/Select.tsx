import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { fieldClasses } from './fieldClasses'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, id, children, ...props }, ref) {
  const autoId = useId()
  const selectId = id ?? autoId
  const errorId = `${selectId}-error`
  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-vinho">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`${fieldClasses(!!error)} h-11`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-bordo">
          {error}
        </p>
      )}
    </div>
  )
})

export default Select
