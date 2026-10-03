import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router'
import { Drawer, Tooltip } from '@mantine/core'
import { Users, UserPlus, Repeat, ShoppingCart, Info, type LucideIcon } from 'lucide-react'
import { useClients } from '@/features/clients/hooks/useClients'
import type { Client, ChannelFilter } from '@/features/clients/types/client.types'
import { ClientsFilterBar } from '@/features/clients/components/ClientsFilterBar'
import { ClientsTableSkeleton } from '@/features/clients/components/ClientsTableSkeleton'
import { ClientDetailPanel } from '@/features/clients/components/ClientDetailPanel'
import { Table, EmptyState, Avatar, Card, TagPill, Pagination } from '@/shared/components'
import { useDebouncedValue } from '@/shared/hooks'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string
  pending?: boolean
  infoTooltip?: string
}

function KpiCard({ icon: Icon, label, value, pending = false, infoTooltip }: KpiCardProps) {
  return (
    <Card padding="sm" className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg text-primary">
        <Icon size={26} aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <p className="text-sm text-ink-muted">{label}</p>
          {infoTooltip && (
            <Tooltip label={infoTooltip} withArrow position="top">
              <Info size={13} className="text-ink-muted" aria-hidden="true" />
            </Tooltip>
          )}
        </div>
        <p
          className={`text-2xl font-semibold ${pending ? 'text-ink-muted' : 'text-ink'}`}
          title={pending ? 'Disponible cuando exista el módulo de pedidos/estadísticas' : undefined}
        >
          {value}
        </p>
      </div>
    </Card>
  )
}

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
    key: 'tags',
    header: 'Etiquetas',
    render: (client: Client) => (
      <div className="flex flex-wrap items-center gap-2">
        {client.clientTags.length === 0 && <span className="text-sm text-ink-muted">—</span>}
        {client.clientTags.map(({ id, tag }) => (
          <TagPill key={id} name={tag.name} color={tag.color} />
        ))}
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
]

export function ClientsPage() {
  const navigate = useNavigate()
  const detailMatch = useMatch('/clients/:id')
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState<ChannelFilter | ''>('')
  const [tagId, setTagId] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleChannelChange(value: ChannelFilter | '') {
    setChannel(value)
    setPage(1)
  }

  function handleTagIdChange(value: string) {
    setTagId(value)
    setPage(1)
  }

  const { data, isLoading, isError } = useClients({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    channel: channel || undefined,
    tagId: tagId || undefined,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-ink">Clientes</h1>
        <p className="text-ink">
          Gestiona todos tus clientes en un único lugar. Busca, filtra y accede a su historial
          completo.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Total de clientes"
          value={String(data?.pagination.total ?? 0)}
        />
        <KpiCard
          icon={UserPlus}
          label="Clientes nuevos"
          value={String(data?.newClientsCount ?? 0)}
          infoTooltip="Añadidos en los últimos 30 días"
        />
        <KpiCard icon={Repeat} label="Clientes recurrentes" value="—" pending />
        <KpiCard icon={ShoppingCart} label="Total de pedidos" value="—" pending />
      </div>

      <ClientsFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        channel={channel}
        onChannelChange={handleChannelChange}
        tagId={tagId}
        onTagIdChange={handleTagIdChange}
      />

      {isLoading && (
        <div className="overflow-x-auto">
          <ClientsTableSkeleton />
        </div>
      )}
      {isError && <p className="text-error">No se han podido cargar los clientes.</p>}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={data?.data ?? []}
              getRowKey={(client) => client.id}
              onRowClick={(client) => navigate(`/clients/${client.id}`)}
              emptyState={<EmptyState title="Todavía no tienes clientes" />}
            />
          </div>
          <Pagination
            page={page}
            totalPages={data?.pagination.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      )}

      <Drawer
        opened={!!detailMatch}
        onClose={() => navigate('/clients')}
        position="right"
        size="lg"
        closeButtonProps={{ 'aria-label': 'Cerrar' }}
        transitionProps={{ duration: 300, timingFunction: 'ease-out' }}
      >
        {detailMatch && <ClientDetailPanel id={detailMatch.params.id!} />}
      </Drawer>
    </div>
  )
}
