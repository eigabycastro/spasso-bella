import { ShieldX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAuth } from '../hooks/authContext'

/** Só a administradora (logada e em public.admins) passa. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, session, error, signOut, retry } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center text-sm text-bordo">
        Verificando acesso…
      </div>
    )
  }

  if (status === 'signed-out') return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (status === 'not-admin' || status === 'error') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Card className="w-full max-w-sm p-8 text-center">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rosa-claro text-bordo">
            <ShieldX size={26} strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="text-lg font-semibold">{status === 'error' ? 'Não foi possível verificar' : 'Acesso não liberado'}</h1>
          <p className="mt-2 text-sm text-bordo">
            {status === 'error'
              ? error
              : `A conta ${session?.user.email ?? ''} entrou, mas não tem permissão para usar o Spasso Bella Manager.`}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {status === 'error' && <Button onClick={retry}>Tentar de novo</Button>}
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
