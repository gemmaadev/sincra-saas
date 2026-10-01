import { useClients } from '@/features/clients/hooks/useClients'
import type { Client } from '@/features/clients/hooks/useClients'
import { Table, EmptyState, Avatar } from '@/shared/components'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'

const columns = [
  {
    key: 'name',
    header: 'Cliente',
    render: (client: Client) => (
      <div className="flex items-center gap-3">
        <Avatar name={client.name} size="md" />
        <div className="flex flex-col">
          <span className="font-medium text-ink">{client.name}</span>
          <span className="text-sm text-ink-muted">{client.email ?? client.phone ?? '—'}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'channels',
    header: 'Canales',
    render: (client: Client) => (
      <div className="flex items-center gap-2">
        {client.channels.map((channel) => {
          const brand = CHANNEL_BRANDS.find((brand) => brand.id === channel.toLowerCase())

          if (!brand) {
            // WEB/OTHER have no dedicated icon yet
            return (
              <span key={channel} className="text-xs text-ink-muted" title={channel}>
                {channel}
              </span>
            )
          }

          const Icon = brand.icon
          return (
            <Icon
              key={channel}
              size={20}
              className={brand.colorClassName}
              aria-label={brand.name}
            />
          )
        })}
      </div>
    ),
  },
  {
    key: 'orders',
    header: 'Pedidos',
    render: () => (
      <span
        className="text-sm text-ink-muted"
        title="Disponible cuando exista el módulo de pedidos"
      >
        —
      </span>
    ),
  },
  {
    key: 'lastActivity',
    header: 'Última actividad',
    render: () => (
      <span
        className="text-sm text-ink-muted"
        title="Entrada automática desde pedidos/comunicaciones"
      >
        —
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: () => (
      <span
        className="text-sm text-ink-muted"
        title="Disponible cuando exista el módulo de pedidos"
      >
        —
      </span>
    ),
  },
]

export function ClientsPage() {
  const { data, isLoading, isError } = useClients()

  if (isLoading) {
    return <p className="text-ink-muted">Cargando clientes...</p>
  }

  if (isError) {
    return <p className="text-error">No se han podido cargar los clientes.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-ink">Clientes</h1>
        <p className="text-ink">
          Gestiona todos tus clientes en un único lugar. Busca, filtra y accede a su historial
          completo.
        </p>
      </div>
      <Table
        columns={columns}
        data={data?.data ?? []}
        getRowKey={(client) => client.id}
        emptyState={<EmptyState title="Todavía no tienes clientes" />}
      />
    </div>
  )
}
