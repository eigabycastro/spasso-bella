import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/authContext'
import { formatDate } from '../../utils/formatDate'
import Brand from '../shared/Brand'

export default function Header() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [today] = useState(() => formatDate(new Date(), "EEEE, d 'de' MMMM"))

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-rose/30 bg-branco/90 px-4 backdrop-blur lg:px-8">
      <Link to="/dashboard" className="lg:hidden">
        <Brand size="sm" />
      </Link>
      <p className="hidden text-sm first-letter:uppercase text-bordo lg:block">{today}</p>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm text-bordo hover:bg-rosa-claro"
        aria-label="Sair da conta"
      >
        <LogOut size={18} strokeWidth={1.75} aria-hidden />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  )
}
