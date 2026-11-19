import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from './ProtectedRoute'

// Cada tela é baixada só quando abre: o site público não carrega o código do painel.
// O layout do site também: as animações (motion) não pesam no painel da profissional.
const SiteLayout = lazy(() => import('../components/layout/SiteLayout'))
const HomePage = lazy(() => import('../pages/site/HomePage'))
const PrivacyPage = lazy(() => import('../pages/site/PrivacyPage'))
const TermsPage = lazy(() => import('../pages/site/TermsPage'))
const NotFoundPage = lazy(() => import('../pages/site/NotFoundPage'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const AgendaPage = lazy(() => import('../pages/agenda/AgendaPage'))
const ClientesPage = lazy(() => import('../pages/clientes/ClientesPage'))
const ServicosPage = lazy(() => import('../pages/servicos/ServicosPage'))
const FinanceiroPage = lazy(() => import('../pages/financeiro/FinanceiroPage'))
const EstoquePage = lazy(() => import('../pages/estoque/EstoquePage'))
const RelatoriosPage = lazy(() => import('../pages/relatorios/RelatoriosPage'))
const ConfiguracoesPage = lazy(() => import('../pages/configuracoes/ConfiguracoesPage'))

function Loading() {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center text-sm text-bordo">
      Carregando…
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Site público */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/termos" element={<TermsPage />} />
          {/* Qualquer endereço que não existe (no site ou no painel) */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />

        {/* Spasso Bella Manager (área logada) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/servicos" element={<ServicosPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Route>

      </Routes>
    </Suspense>
  )
}
