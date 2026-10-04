import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router'
import { Drawer } from '@mantine/core'
import { Users, UserPlus, Repeat, ShoppingCart, Plus } from 'lucide-react'
import { useClients } from '@/features/clients/hooks/useClients'
import { useClientsFilters } from '@/features/clients/hooks/useClientsFilters'
import { ClientsFilterBar } from '@/features/clients/components/ClientsFilterBar'
import { ClientsTableSkeleton } from '@/features/clients/components/ClientsTableSkeleton'
import { ClientDetailPanel } from '@/features/clients/components/ClientDetailPanel'
import { ClientFormModal } from '@/features/clients/components/ClientFormModal'
import { KpiCard } from '@/features/clients/components/KpiCard'
import { clientsTableColumns } from '@/features/clients/components/clientsTableColumns'
import { Table, EmptyState, Pagination, SincraButton } from '@/shared/components'

export default function ClientsPage() {
  const navigate = useNavigate()
  const detailMatch = useMatch('/clients/:id')
  const {
    search,
    channel,
    tagId,
    page,
    setPage,
    changeSearch,
    changeChannel,
    changeTagId,
    queryParams,
  } = useClientsFilters()

  const { data, isLoading, isError } = useClients(queryParams)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-ink">Clientes</h1>
          <p className="text-ink">
            Gestiona todos tus clientes en un único lugar. Busca, filtra y accede a su historial
            completo.
          </p>
        </div>
        <SincraButton className="shrink-0" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          Nuevo cliente
        </SincraButton>
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
        onSearchChange={changeSearch}
        channel={channel}
        onChannelChange={changeChannel}
        tagId={tagId}
        onTagIdChange={changeTagId}
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
              columns={clientsTableColumns}
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

      <ClientFormModal opened={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}
