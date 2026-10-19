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
import { SidebarItem } from './SidebarItem'
import { Card } from '@/shared/components/card'
import { SincraButton } from '@/shared/components/button'
import { SincraLogo } from '@/shared/components/logo'
import { TagPill } from '@/shared/components/tag-pill'
import { useTags } from '@/features/tags/hooks/useTags'
import { useConnectedChannels } from '@/features/settings/hooks/useConnectedChannels'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import { Link, useNavigate } from 'react-router'

const navItems = [
  { to: '/inbox', icon: <Inbox size={18} aria-hidden="true" />, label: 'Bandeja', disabled: true },
  { to: '/clients', icon: <Users size={18} aria-hidden="true" />, label: 'Clientes' },
  { to: '/orders', icon: <ShoppingCart size={18} aria-hidden="true" />, label: 'Pedidos' },
  { to: '/calendar', icon: <Calendar size={18} aria-hidden="true" />, label: 'Calendario' },
  { to: '/map', icon: <Map size={18} aria-hidden="true" />, label: 'Mapa' },
  { to: '/stats', icon: <BarChart3 size={18} aria-hidden="true" />, label: 'Estadísticas' },
  { to: '/team', icon: <UserCog size={18} aria-hidden="true" />, label: 'Equipo' },
  {
    to: '/automations',
    icon: <Sparkles size={18} aria-hidden="true" />,
    label: 'Agentes IA',
  },
  { to: '/settings', icon: <Settings size={18} aria-hidden="true" />, label: 'Ajustes' },
]

export function SidebarContent() {
  const { data: labels = [] } = useTags()
  const { data: channelsStatus = [] } = useConnectedChannels()
  const navigate = useNavigate()

  const connectedChannels = channelsStatus.filter((channel) => channel.status === 'CONNECTED')

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <Link to="/stats">
        <SincraLogo size={28} />
      </Link>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>

      {connectedChannels.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="px-3 text-xs font-semibold uppercase text-ink-muted">Canales</span>
          {connectedChannels.map((channel) => {
            const brand = CHANNEL_BRANDS.find(
              (channelBrand) => channelBrand.id === channel.channel.toLowerCase(),
            )
            const Icon = brand?.icon

            return (
              <div
                key={channel.channel}
                className="flex items-center gap-2 px-3 py-1 text-sm text-ink-muted"
              >
                {Icon && (
                  <Icon size={16} className={brand?.colorClassName} aria-hidden="true" />
                )}
                {brand?.name ?? channel.channel}
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-2 px-3">
        <span className="text-xs font-semibold uppercase text-ink-muted">Etiquetas</span>
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <TagPill key={label.id} name={label.name} color={label.color} />
          ))}
        </div>
      </div>

      <Card padding="sm" className="mt-auto flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Sparkles size={16} className="text-primary" aria-hidden="true" />
          Sincra &amp; Sincro
        </span>
        <p className="text-xs text-ink-muted">
          Leen tus mensajes y te dejan listos los clientes y pedidos nuevos.
        </p>
        <SincraButton
          variant="text"
          size="sm"
          icon={<MoveRight size={16} aria-hidden="true" />}
          onClick={() => navigate('/automations')}
        >
          Ver agentes
        </SincraButton>
      </Card>
    </div>
  )
}
