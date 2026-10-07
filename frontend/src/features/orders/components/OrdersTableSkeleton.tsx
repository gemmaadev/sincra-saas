import { Skeleton, TableSkeleton } from '@/shared/components'
import type { SkeletonColumn } from '@/shared/components'

const COLUMNS: SkeletonColumn[] = [
  {
    key: 'number',
    header: 'Pedido',
    renderCell: () => <Skeleton className="h-3.5 w-10" />,
  },
  {
    key: 'client',
    header: 'Cliente',
    renderCell: () => <Skeleton className="h-3.5 w-28" />,
  },
  {
    key: 'product',
    header: 'Producto / Servicio',
    renderCell: () => (
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    renderCell: () => <Skeleton className="h-5 w-20 rounded-full" />,
  },
  {
    key: 'channel',
    header: 'Canal',
    renderCell: () => <Skeleton className="size-5 rounded-full" />,
  },
  {
    key: 'createdAt',
    header: 'Fecha',
    renderCell: () => <Skeleton className="h-3.5 w-16" />,
  },
  {
    key: 'price',
    header: 'Total',
    renderCell: () => <Skeleton className="h-3.5 w-12" />,
  },
]

export function OrdersTableSkeleton() {
  return <TableSkeleton columns={COLUMNS} label="Cargando pedidos" />
}
