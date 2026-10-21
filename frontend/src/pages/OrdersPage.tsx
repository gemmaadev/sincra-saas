import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router'
import { Package, Clock, Truck, CheckCircle, XCircle, Plus, Trash2, Ban } from 'lucide-react'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useOrdersFilters } from '@/features/orders/hooks/useOrdersFilters'
import { OrdersFilterBar } from '@/features/orders/components/OrdersFilterBar'
import { OrdersTableSkeleton } from '@/features/orders/components/OrdersTableSkeleton'
import { OrderDetailPanel } from '@/features/orders/components/OrderDetailPanel'
import { OrderFormModal } from '@/features/orders/components/OrderFormModal'
import { BulkDeleteOrdersModal } from '@/features/orders/components/BulkDeleteOrdersModal'
import { BulkCancelOrdersModal } from '@/features/orders/components/BulkCancelOrdersModal'
import { ordersTableColumns } from '@/features/orders/utils/ordersTableColumns'
import {
  Table,
  EmptyState,
  Pagination,
  SincraButton,
  SelectionBar,
  KpiCardsRow,
  DetailDrawer,
} from '@/shared/components'
import { useRowSelection } from '@/shared/hooks'
import { computePageAfterBulkDelete } from '@/shared/utils'

export default function OrdersPage() {
  const navigate = useNavigate()
  const detailMatch = useMatch('/orders/:id')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState<boolean>(false)
  const [isBulkCancelOpen, setIsBulkCancelOpen] = useState<boolean>(false)
  const [bulkActionIds, setBulkActionIds] = useState<string[]>([])
  const {
    search,
    status,
    channel,
    dateFrom,
    dateTo,
    page,
    setPage,
    changeSearch,
    changeStatus,
    changeChannel,
    changeDateFrom,
    changeDateTo,
    isDateRangeInvalid,
    hasActiveFilters,
    clearFilters,
    queryParams,
  } = useOrdersFilters()

  const { data, isLoading, isError } = useOrders(queryParams)
  const orders = data?.data ?? []
  const { selectedKeys, selectedCount, toggleRow, toggleAll, clear } = useRowSelection(
    orders.map((order) => order.id),
  )

  function clearingSelection<Value>(changeFilter: (value: Value) => void) {
    return (value: Value) => {
      changeFilter(value)
      clear()
    }
  }

  function openBulkDelete() {
    setBulkActionIds([...selectedKeys])
    setIsBulkDeleteOpen(true)
  }

  function openBulkCancel() {
    setBulkActionIds([...selectedKeys])
    setIsBulkCancelOpen(true)
  }

  function handleBulkDeleted() {
    setPage(
      computePageAfterBulkDelete(
        page,
        data?.pagination.total ?? 0,
        bulkActionIds.length,
        data?.pagination.limit ?? 1,
      ),
    )
    clear()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-ink">Pedidos</h1>
          <p className="text-ink">
            Gestiona todos tus pedidos en un único lugar. Filtra por estado, canal o fecha para
            encontrar lo que necesites.
          </p>
        </div>
        <SincraButton className="shrink-0" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          Nuevo pedido
        </SincraButton>
      </div>

      <KpiCardsRow
        cards={[
          {
            icon: Package,
            label: 'Total de pedidos',
            value: String(data?.pagination.total ?? 0),
            pending: !data,
          },
          {
            icon: Clock,
            label: 'En preparación',
            value: String(data?.statusCounts?.PREPARING ?? 0),
            pending: !data,
          },
          {
            icon: Truck,
            label: 'Enviados',
            value: String(data?.statusCounts?.SHIPPED ?? 0),
            pending: !data,
          },
          {
            icon: CheckCircle,
            label: 'Entregados',
            value: String(data?.statusCounts?.DELIVERED ?? 0),
            pending: !data,
          },
          {
            icon: XCircle,
            label: 'Cancelados',
            value: String(data?.statusCounts?.CANCELLED ?? 0),
            pending: !data,
          },
        ]}
      />

      <OrdersFilterBar
        search={search}
        onSearchChange={clearingSelection(changeSearch)}
        status={status}
        onStatusChange={clearingSelection(changeStatus)}
        channel={channel}
        onChannelChange={clearingSelection(changeChannel)}
        dateFrom={dateFrom}
        onDateFromChange={clearingSelection(changeDateFrom)}
        dateTo={dateTo}
        onDateToChange={clearingSelection(changeDateTo)}
        isDateRangeInvalid={isDateRangeInvalid}
      />

      {isLoading && (
        <div className="overflow-x-auto">
          <OrdersTableSkeleton />
        </div>
      )}
      {isError && <p className="text-error">No se han podido cargar los pedidos.</p>}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {selectedCount > 0 && (
            <SelectionBar
              label={
                selectedCount === 1
                  ? '1 pedido seleccionado'
                  : `${selectedCount} pedidos seleccionados`
              }
              onClear={clear}
            >
              <SincraButton variant="dangerOutline" size="sm" onClick={openBulkCancel}>
                <Ban size={14} aria-hidden="true" />
                Cancelar ({selectedCount})
              </SincraButton>
              <SincraButton variant="danger" size="sm" onClick={openBulkDelete}>
                <Trash2 size={14} aria-hidden="true" />
                Eliminar ({selectedCount})
              </SincraButton>
            </SelectionBar>
          )}
          <div className="overflow-x-auto">
            <Table
              columns={ordersTableColumns}
              data={orders}
              getRowKey={(order) => order.id}
              onRowClick={(order) => navigate(`/orders/${order.id}`)}
              selection={{
                selectedKeys,
                onToggleRow: toggleRow,
                onToggleAll: toggleAll,
                getRowLabel: (order) => `Seleccionar pedido #${order.number}`,
              }}
              emptyState={
                hasActiveFilters ? (
                  <EmptyState
                    title="No se han encontrado pedidos"
                    description="Prueba a cambiar la búsqueda o los filtros."
                    action={
                      <SincraButton variant="text" size="sm" onClick={clearFilters}>
                        Limpiar filtros
                      </SincraButton>
                    }
                  />
                ) : (
                  <EmptyState title="Todavía no tienes pedidos" />
                )
              }
            />
          </div>
          <Pagination
            page={page}
            totalPages={data?.pagination.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      )}

      <DetailDrawer opened={!!detailMatch} onClose={() => navigate('/orders')}>
        {detailMatch && <OrderDetailPanel id={detailMatch.params.id!} />}
      </DetailDrawer>

      <OrderFormModal opened={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <BulkDeleteOrdersModal
        opened={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        orderIds={bulkActionIds}
        onDeleted={handleBulkDeleted}
      />

      <BulkCancelOrdersModal
        opened={isBulkCancelOpen}
        onClose={() => setIsBulkCancelOpen(false)}
        orderIds={bulkActionIds}
        onCancelled={clear}
      />
    </div>
  )
}
