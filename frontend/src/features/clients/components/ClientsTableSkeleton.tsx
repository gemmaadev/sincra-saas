import { Skeleton, TableSkeleton } from '@/shared/components'
import type { SkeletonColumn } from '@/shared/components'

const COLUMNS: SkeletonColumn[] = [
  {
    key: 'name',
    header: 'Cliente',
    renderCell: () => (
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    ),
  },
  {
    key: 'channels',
    header: 'Canales',
    renderCell: () => <Skeleton className="size-5 rounded-full" />,
  },
  {
    key: 'tags',
    header: 'Etiquetas',
    renderCell: () => <Skeleton className="h-5 w-16 rounded-full" />,
  },
  {
    key: 'orders',
    header: 'Pedidos',
    renderCell: () => <Skeleton className="h-3.5 w-6" />,
  },
  { key: 'lastActivity', header: 'Última actividad' },
]

export function ClientsTableSkeleton() {
  return <TableSkeleton columns={COLUMNS} label="Cargando clientes" />
}
