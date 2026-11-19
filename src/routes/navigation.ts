import {
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  Package,
  Settings,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = { to: string; label: string; icon: LucideIcon }

/** Os 8 itens da área logada, na ordem do plano. */
export const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/servicos', label: 'Serviços', icon: Sparkles },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/relatorios', label: 'Relatórios', icon: ChartColumn },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

/** Itens fixos da barra inferior no celular; o resto vai em "Mais". */
export const bottomNavPaths = ['/agenda', '/clientes', '/financeiro']
