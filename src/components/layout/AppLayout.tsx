import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import SkipLink from '../shared/SkipLink'
import BottomNav from './BottomNav'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex min-h-dvh">
      <SkipLink />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 outline-none lg:px-8 lg:pb-10">
          {/* Suspense aqui mantém menu e header na tela enquanto a página carrega */}
          <Suspense fallback={<p role="status" className="py-16 text-center text-sm text-bordo">Carregando…</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
