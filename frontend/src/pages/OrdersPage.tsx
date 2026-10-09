import { Package, Clock, Truck, CheckCircle, XCircle, Plus } from 'lucide-react'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useOrdersFilters } from '@/features/orders/hooks/useOrdersFilters'
import { OrdersFilterBar } from '@/features/orders/components/OrdersFilterBar'
import { OrdersTableSkeleton } from '@/features/orders/components/OrdersTableSkeleton'
import { ordersTableColumns } from '@/features/orders/utils/ordersTableColumns'
import { Table, EmptyState, Pagination, SincraButton, KpiCardsRow } from '@/shared/components'

export default function OrdersPage() {
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
    queryParams,
  } = useOrdersFilters()

  const { data, isLoading, isError } = useOrders(queryParams)
  const orders = data?.data ?? []

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
        <SincraButton className="shrink-0" disabled title="Disponible próximamente">
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
        onSearchChange={changeSearch}
        status={status}
        onStatusChange={changeStatus}
        channel={channel}
        onChannelChange={changeChannel}
        dateFrom={dateFrom}
        onDateFromChange={changeDateFrom}
        dateTo={dateTo}
        onDateToChange={changeDateTo}
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
          <div className="overflow-x-auto">
            <Table
              columns={ordersTableColumns}
              data={orders}
              getRowKey={(order) => order.id}
              emptyState={<EmptyState title="Todavía no tienes pedidos" />}
            />
          </div>
          <Pagination
            page={page}
            totalPages={data?.pagination.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
