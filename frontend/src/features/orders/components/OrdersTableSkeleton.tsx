import { TableSkeleton } from '@/shared/components'
import { ordersTableColumns } from './ordersTableColumns'

export function OrdersTableSkeleton() {
  return <TableSkeleton columns={ordersTableColumns} label="Cargando pedidos" />
}
