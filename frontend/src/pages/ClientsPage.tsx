import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router'
import { Drawer } from '@mantine/core'
import { Users, UserPlus, Repeat, Target, Plus, Trash2 } from 'lucide-react'
import { useClients } from '@/features/clients/hooks/useClients'
import { useClientsFilters } from '@/features/clients/hooks/useClientsFilters'
import { ClientsFilterBar } from '@/features/clients/components/ClientsFilterBar'
import { ClientsTableSkeleton } from '@/features/clients/components/ClientsTableSkeleton'
import { ClientDetailPanel } from '@/features/clients/components/ClientDetailPanel'
import { ClientFormModal } from '@/features/clients/components/ClientFormModal'
import { BulkDeleteClientsModal } from '@/features/clients/components/BulkDeleteClientsModal'
import { clientsTableColumns } from '@/features/clients/utils/clientsTableColumns'
import {
  Table,
  EmptyState,
  Pagination,
  SincraButton,
  SelectionBar,
  KpiCardsRow,
} from '@/shared/components'
import { useRowSelection } from '@/shared/hooks'

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
  const clients = data?.data ?? []
  const { selectedKeys, selectedCount, toggleRow, toggleAll, deselect, clear } = useRowSelection(
    clients.map((client) => client.id),
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState<boolean>(false)
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([])

  function openBulkDelete() {
    setBulkDeleteIds([...selectedKeys])
    setIsBulkDeleteOpen(true)
  }

  function handleBulkDeleted() {
    const remainingClients = (data?.pagination.total ?? 0) - bulkDeleteIds.length
    const pageSize = data?.pagination.limit ?? 1
    const lastPageAfterDelete = Math.max(1, Math.ceil(remainingClients / pageSize))
    setPage(Math.min(page, lastPageAfterDelete))
    clear()
  }

  function clearingSelection<Value>(changeFilter: (value: Value) => void) {
    return (value: Value) => {
      changeFilter(value)
      clear()
    }
  }

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
      <KpiCardsRow
        cards={[
          {
            icon: Users,
            label: 'Total de clientes',
            value: String(data?.pagination.total ?? 0),
            pending: !data,
          },
          {
            icon: UserPlus,
            label: 'Clientes nuevos',
            value: String(data?.newClientsCount ?? 0),
            infoTooltip: 'Añadidos en los últimos 30 días',
            pending: !data,
          },
          {
            icon: Repeat,
            label: 'Clientes recurrentes',
            value: String(data?.recurringClientsCount ?? 0),
            infoTooltip: 'Clientes con 2 o más pedidos',
            pending: !data,
          },
          {
            icon: Target,
            label: 'Clientes potenciales',
            value: String(data?.potentialClientsCount ?? 0),
            infoTooltip: 'Clientes que todavía no han hecho ningún pedido',
            pending: !data,
          },
        ]}
      />

      <ClientsFilterBar
        search={search}
        onSearchChange={clearingSelection(changeSearch)}
        channel={channel}
        onChannelChange={clearingSelection(changeChannel)}
        tagId={tagId}
        onTagIdChange={clearingSelection(changeTagId)}
      />

      {isLoading && (
        <div className="overflow-x-auto">
          <ClientsTableSkeleton />
        </div>
      )}
      {isError && <p className="text-error">No se han podido cargar los clientes.</p>}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {selectedCount > 0 && (
            <SelectionBar
              label={
                selectedCount === 1
                  ? '1 cliente seleccionado'
                  : `${selectedCount} clientes seleccionados`
              }
              onClear={clear}
            >
              <SincraButton variant="danger" size="sm" onClick={openBulkDelete}>
                <Trash2 size={14} aria-hidden="true" />
                Eliminar ({selectedCount})
              </SincraButton>
            </SelectionBar>
          )}
          <div className="overflow-x-auto">
            <Table
              columns={clientsTableColumns}
              data={clients}
              getRowKey={(client) => client.id}
              onRowClick={(client) => navigate(`/clients/${client.id}`)}
              selection={{
                selectedKeys,
                onToggleRow: toggleRow,
                onToggleAll: toggleAll,
                getRowLabel: (client) => `Seleccionar ${client.name}`,
              }}
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
        {detailMatch && (
          <ClientDetailPanel
            id={detailMatch.params.id!}
            onDeleted={() => {
              deselect(detailMatch.params.id!)
              navigate('/clients')
            }}
          />
        )}
      </Drawer>

      <ClientFormModal opened={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <BulkDeleteClientsModal
        opened={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        clientIds={bulkDeleteIds}
        onDeleted={handleBulkDeleted}
      />
    </div>
  )
}
