import { Circle, CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/shared/utils'
import { SincraButton } from '@/shared/components'
import type { BadgeColor } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { ORDER_STATUS_ICONS, ORDER_STATUS_COLORS } from '../../orderStatus.constants'
import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus'
import type { OrderDetail, OrderStatus } from '../../types/order.types'

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Pedido recibido' },
  { status: 'PREPARING', label: 'En preparación' },
  { status: 'SHIPPED', label: 'Enviado' },
  { status: 'DELIVERED', label: 'Entregado' },
]

// No next step once DELIVERED/CANCELLED — nowhere for "Actualizar estado" to go.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PREPARING',
  PREPARING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

const STATUS_BG_COLORS: Record<BadgeColor, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  neutral: 'bg-neutral-400',
}

interface OrderTimelineProps {
  order: OrderDetail
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const updateStatus = useUpdateOrderStatus(order.id)
  const nextStatus = NEXT_STATUS[order.status]

  const errorMessage = updateStatus.isError
    ? updateStatus.error instanceof ApiError
      ? updateStatus.error.message
      : 'No se ha podido actualizar el estado. Inténtalo de nuevo.'
    : undefined

  // Based on position, not history entries (never pruned); CANCELLED uses the prior status.
  const isCancelled = order.status === 'CANCELLED'
  const lastReachedStatus = isCancelled
    ? [...order.statusHistory].reverse().find((entry) => entry.status !== 'CANCELLED')?.status
    : order.status
  const lastReachedIndex = TIMELINE_STEPS.findIndex((step) => step.status === lastReachedStatus)

  return (
    <div className="flex flex-col gap-4 p-3">
      <ul className="flex flex-col">
        {TIMELINE_STEPS.map((step, index) => {
          const isLast = index === TIMELINE_STEPS.length - 1
          const isCompleted = isCancelled ? index <= lastReachedIndex : index < lastReachedIndex
          const isCurrent = !isCancelled && index === lastReachedIndex
          // Show the most recent entry — a status can be reached more than once.
          const historyEntry = [...order.statusHistory]
            .reverse()
            .find((entry) => entry.status === step.status)

          const Icon = isCompleted
            ? CheckCircle
            : isCurrent
              ? ORDER_STATUS_ICONS[step.status]
              : Circle
          const bgClassName = isCompleted
            ? 'bg-success'
            : isCurrent
              ? STATUS_BG_COLORS[ORDER_STATUS_COLORS[step.status]]
              : 'bg-neutral-100'
          const iconClassName = isCompleted || isCurrent ? 'text-white' : 'text-neutral-400'

          const dateLabel =
            (isCompleted || isCurrent) && historyEntry
              ? formatDateTime(new Date(historyEntry.changedAt))
              : '—'

          // Connector line is positioned separately so the hover box doesn't stretch into it.
          const rowContent = (
            <>
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full ${bgClassName}`}
              >
                <Icon size={16} className={iconClassName} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-ink">{step.label}</span>
                <span className="text-sm text-ink-muted">{dateLabel}</span>
              </div>
            </>
          )

          return (
            <li key={step.status} className="relative pb-6">
              {!isLast && (
                <div className="absolute left-3.25 top-7 bottom-0 w-px bg-neutral-200" />
              )}
              {/* Clicking a reached step reverts to it — works even from DELIVERED/CANCELLED. */}
              {isCompleted ? (
                <button
                  type="button"
                  aria-label={`Volver a "${step.label}"`}
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate(step.status)}
                  className="relative flex w-full items-center gap-3 rounded-lg p-1 -m-1 text-left transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
                >
                  {rowContent}
                </button>
              ) : (
                <div className="flex items-center gap-3">{rowContent}</div>
              )}
            </li>
          )
        })}
      </ul>

      {order.status === 'CANCELLED' && (
        <p className="text-sm text-error">Este pedido ha sido cancelado.</p>
      )}

      {nextStatus && (
        <SincraButton
          variant="secondary"
          className="w-full"
          loading={updateStatus.isPending}
          onClick={() => updateStatus.mutate(nextStatus)}
        >
          Actualizar estado
        </SincraButton>
      )}

      {errorMessage && (
        <p role="alert" className="text-sm text-error">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
