import { Skeleton } from '@/shared/components'

const HEADERS = ['Cliente', 'Canales', 'Etiquetas', 'Pedidos', 'Última actividad']
const SKELETON_ROWS = 10

export function ClientsTableSkeleton() {
  return (
    <table className="w-full text-left text-sm" aria-busy="true" aria-label="Cargando clientes">
      <thead>
        <tr className="border-b border-neutral-100 text-ink-muted">
          {HEADERS.map((header) => (
            <th key={header} scope="col" className="px-4 py-2 font-medium">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => rowIndex).map((rowIndex) => (
          <tr key={rowIndex} className="border-b border-neutral-50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <Skeleton className="size-5 rounded-full" />
            </td>
            <td className="px-4 py-3">
              <Skeleton className="h-5 w-16 rounded-full" />
            </td>
            <td className="px-4 py-3">
              <Skeleton className="h-3.5 w-6" />
            </td>
            <td className="px-4 py-3">
              <Skeleton className="h-3.5 w-20" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
