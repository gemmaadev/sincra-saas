import { Skeleton, TableSkeleton } from '@/shared/components'
import type { SkeletonColumn } from '@/shared/components'

const COLUMNS: SkeletonColumn[] = [
  {
    key: 'name',
    header: 'Nombre',
    renderCell: () => (
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Rol',
    renderCell: () => <Skeleton className="h-5 w-24 rounded-full" />,
  },
  {
    key: 'status',
    header: 'Estado',
    renderCell: () => <Skeleton className="h-5 w-16 rounded-full" />,
  },
  {
    key: 'lastActivity',
    header: 'Última actividad',
    renderCell: () => <Skeleton className="h-3.5 w-20" />,
  },
]

export function TeamTableSkeleton() {
  return <TableSkeleton columns={COLUMNS} label="Cargando equipo" />
}
