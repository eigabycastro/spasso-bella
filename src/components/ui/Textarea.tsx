import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { fieldClasses } from './fieldClasses'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hint, id, ...props }, ref) {
  const autoId = useId()
  const areaId = id ?? autoId
  const hintId = `${areaId}-hint`
  return (
    <div>
      <label htmlFor={areaId} className="mb-1.5 block text-sm font-medium text-vinho">
        {label}
      </label>
      <textarea ref={ref} id={areaId} rows={3} aria-describedby={hint ? hintId : undefined} className={`${fieldClasses()} py-2.5`} {...props} />
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-bordo">
          {hint}
        </p>
      )}
    </div>
  )
})

export default Textarea
