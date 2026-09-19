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
  MoveRight,
} from 'lucide-react'
import { SiWhatsapp, SiInstagram, SiMessenger, SiGmail } from 'react-icons/si'
import { SidebarItem } from './SidebarItem'
import { Card } from '@/shared/components/card'
import { SincraButton } from '@/shared/components/button'

const navItems = [
  { to: '/inbox', icon: <Inbox size={18} />, label: 'Bandeja', badge: 12 },
  { to: '/clients', icon: <Users size={18} />, label: 'Clientes' },
  { to: '/orders', icon: <ShoppingCart size={18} />, label: 'Pedidos', badge: 3 },
  { to: '/calendar', icon: <Calendar size={18} />, label: 'Calendario' },
  { to: '/map', icon: <Map size={18} />, label: 'Mapa' },
  { to: '/stats', icon: <BarChart3 size={18} />, label: 'Estadísticas' },
  { to: '/team', icon: <UserCog size={18} />, label: 'Equipo' },
  { to: '/automations', icon: <Sparkles size={18} />, label: 'Automatizaciones' },
  { to: '/settings', icon: <Settings size={18} />, label: 'Ajustes' },
]

const channels = [
  { icon: <SiGmail size={16} />, label: 'Gmail', count: 6 },
  { icon: <SiWhatsapp size={16} />, label: 'WhatsApp', count: 4 },
  { icon: <SiInstagram size={16} />, label: 'Instagram', count: 1 },
  { icon: <SiMessenger size={16} />, label: 'Messenger', count: 1 },
]

const labels = [
  { color: 'bg-primary', name: 'Nuevo cliente' },
  { color: 'bg-warning', name: 'Consulta' },
  { color: 'bg-success', name: 'Pedido' },
  { color: 'bg-error', name: 'Urgente' },
]

export function Sidebar() {
  return (
    <aside className="flex w-64 flex-col gap-6 overflow-y-auto border-r border-neutral-100 bg-surface-sidebar p-4 max-md:hidden">
      <span className="text-lg font-bold text-primary">Sincra</span>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="flex flex-col gap-2">
        <span className="px-3 text-xs font-semibold uppercase text-ink-muted">Canales</span>
        {channels.map((channel) => (
          <div
            key={channel.label}
            className="flex items-center justify-between px-3 py-1 text-sm text-ink-muted"
          >
            <span className="flex items-center gap-2">
              {channel.icon}
              {channel.label}
            </span>
            <span>{channel.count}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="px-3 text-xs font-semibold uppercase text-ink-muted">Etiquetas</span>
        {labels.map((label) => (
          <div
            key={label.name}
            className="flex items-center gap-2 px-3 py-1 text-sm text-ink-muted"
          >
            <span className={`h-2 w-2 rounded-full ${label.color}`} />
            {label.name}
          </div>
        ))}
        <SincraButton variant="text" className="justify-start">
          Ver todas
        </SincraButton>
      </div>

      <Card padding="sm" className="mt-auto flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Sparkles size={16} className="text-primary" />
          IA de Sincra
        </span>
        <p className="text-xs text-ink-muted">
          Te ayuda a priorizar, clasificar y responder más rápido.
        </p>
        <SincraButton variant="text" size="sm" icon={<MoveRight size={16} />}>
          Ver sugerencias
        </SincraButton>
      </Card>
    </aside>
  )
}
