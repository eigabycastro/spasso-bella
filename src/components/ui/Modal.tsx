import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'

/**
 * No celular abre como gaveta de baixo; no PC, centralizado.
 * Acessível pelo teclado: o foco entra na janela, o Tab circula só dentro dela,
 * Esc fecha e, ao fechar, o foco volta para quem abriu (WCAG 2.1.2 / 2.4.3).
 */
export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const opener = document.activeElement as HTMLElement | null

    // Foco inicial: campo com autoFocus, senão o primeiro campo, senão a própria janela
    const raf = requestAnimationFrame(() => {
      if (!dialog || dialog.contains(document.activeElement)) return
      const first = dialog.querySelector<HTMLElement>('[autofocus], input, select, textarea') ?? dialog
      first.focus()
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !dialog) return
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-vinho/30 sm:items-center sm:p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-branco outline-none sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rose/30 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="-mr-2 flex size-11 items-center justify-center rounded-lg text-bordo hover:bg-rosa-claro" aria-label="Fechar janela">
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex gap-3 border-t border-rose/30 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] [&>*]:flex-1">{footer}</div>}
      </div>
    </div>
  )
}
