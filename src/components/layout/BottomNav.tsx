import { Ellipsis, ExternalLink, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { bottomNavPaths, navItems } from '../../routes/navigation'

const tabClass = (active: boolean) =>
  `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? 'text-vinho' : 'text-bordo'}`

export default function BottomNav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const moreButton = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const mainItems = navItems.filter((i) => bottomNavPaths.includes(i.to))
  const moreItems = navItems.filter((i) => !bottomNavPaths.includes(i.to))
  const moreActive = moreItems.some((i) => pathname.startsWith(i.to))
  const close = () => setOpen(false)

  // Teclado: foco no primeiro item ao abrir; Esc fecha e devolve o foco ao botão "Mais"
  useEffect(() => {
    if (!open) return
    sheet.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        moreButton.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-vinho/25 lg:hidden" onClick={close}>
          <div
            ref={sheet}
            id="mais-opcoes"
            role="dialog"
            aria-label="Mais opções"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-branco px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-sm font-semibold">Mais opções</span>
              <button
                type="button"
                onClick={() => {
                  close()
                  moreButton.current?.focus()
                }}
                className="flex size-11 items-center justify-center text-bordo"
                aria-label="Fechar mais opções"
              >
                <X size={20} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <nav aria-label="Mais opções do menu" className="grid gap-1">
              {moreItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={close}
                  className={({ isActive }) =>
                    `flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${isActive ? 'bg-vinho text-branco' : 'text-bordo hover:bg-rosa-claro'}`
                  }
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                  {label}
                </NavLink>
              ))}
              <Link to="/" target="_blank" className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm text-bordo">
                <ExternalLink size={20} strokeWidth={1.75} aria-hidden />
                Visualizar site público
                <span className="sr-only"> (abre em nova aba)</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-rose/30 bg-branco pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Menu principal">
        {mainItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={close} className={({ isActive }) => tabClass(isActive && !open)}>
            <Icon size={22} strokeWidth={1.75} aria-hidden />
            {label}
          </NavLink>
        ))}
        <button
          ref={moreButton}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mais-opcoes"
          className={tabClass(open || moreActive)}
        >
          <Ellipsis size={22} strokeWidth={1.75} aria-hidden />
          Mais
        </button>
      </nav>
    </>
  )
}
