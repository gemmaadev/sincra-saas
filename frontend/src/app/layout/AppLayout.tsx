import { Outlet } from 'react-router'
import {
  Inbox,
  Users,
  ShoppingCart,
  Calendar,
  Map,
  BarChart3,
  UserCog,
  Sparkles,
  Settings,
  Search,
} from 'lucide-react'
import { SidebarItem } from './components/SidebarItem'
import { Avatar } from '@/shared/components/avatar'
import { Input } from '@/shared/components/input'

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col gap-6 border-r border-neutral-100 bg-surface-sidebar p-4 max-md:hidden">
        <span className="text-lg font-bold text-primary">Sincra</span>

        <nav className="flex flex-col gap-1">
          <SidebarItem to="/bandeja" icon={<Inbox size={18} />} label="Bandeja" badge={12} />
          <SidebarItem to="/clientes" icon={<Users size={18} />} label="Clientes" />
          <SidebarItem to="/pedidos" icon={<ShoppingCart size={18} />} label="Pedidos" badge={3} />
          <SidebarItem to="/calendario" icon={<Calendar size={18} />} label="Calendario" />
          <SidebarItem to="/mapa" icon={<Map size={18} />} label="Mapa" />
          <SidebarItem to="/estadisticas" icon={<BarChart3 size={18} />} label="Estadísticas" />
          <SidebarItem to="/equipo" icon={<UserCog size={18} />} label="Equipo" />
          <SidebarItem
            to="/automatizaciones"
            icon={<Sparkles size={18} />}
            label="Automatizaciones"
          />
          <SidebarItem to="/ajustes" icon={<Settings size={18} />} label="Ajustes" />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-100 px-6 py-3">
          <div className="w-170">
            <Input
              placeholder="Buscar conversaciones, clientes, pedidos..."
              icon={<Search size={18} />}
              className="bg-neutral-50"
            />
          </div>
          <div className="flex items-center gap-4">
            <Avatar name="Laura García" size="md" />
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
