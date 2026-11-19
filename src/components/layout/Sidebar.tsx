import { ExternalLink } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Brand from '../shared/Brand'
import { navItems } from '../../routes/navigation'

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-rose/30 bg-branco px-4 py-6 lg:flex">
      <Link to="/dashboard" className="mb-8 px-2">
        <Brand />
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Menu principal">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 h-11 text-sm font-medium transition-colors ${
                isActive ? 'bg-vinho text-branco' : 'text-bordo hover:bg-rosa-claro'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-3 h-11 text-sm text-bordo hover:bg-rosa-claro"
      >
        <ExternalLink size={18} strokeWidth={1.75} aria-hidden />
        Visualizar site público
        <span className="sr-only"> (abre em nova aba)</span>
      </Link>
    </aside>
  )
}
