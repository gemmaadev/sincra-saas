import { useState } from 'react'
import { Circle, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatDateTime } from '@/shared/utils'
import { AiSuggestedBadge, SincraButton } from '@/shared/components'
import type { BadgeColor } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { isSincroNote, sincroNoteBody } from '@/shared/components/notes-tab/sincroNote'
import { ORDER_STATUS_ICONS, ORDER_STATUS_COLORS } from '../../orderStatus.constants'
import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus'
import { lastOperationalStatus } from '../../utils/operationalStatus'
import { MarkIncidentModal } from '../actions/MarkIncidentModal'
import type { OrderDetail, OrderStatus, OrderStatusChangeEntry } from '../../types/order.types'

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

function incidentCopy(entry: OrderStatusChangeEntry | undefined): {
  text: string
  suggestedByAi: boolean
} {
  const raw = entry?.note?.trim() ?? ''
  const suggestedByAi =
    raw.length > 0 && isSincroNote({ content: raw, createdBy: entry?.changedBy ?? null })
  const body = raw ? sincroNoteBody(raw).trim() : ''

  return { text: body || 'Sin una nota escrita.', suggestedByAi }
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const updateStatus = useUpdateOrderStatus(order.id)
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false)
  const operationalStatus = lastOperationalStatus(order.status, order.statusHistory)
  const nextStatus = order.status === 'CANCELLED' ? undefined : NEXT_STATUS[operationalStatus]
  const isAside = order.status === 'CANCELLED' || order.status === 'INCIDENT'

  const errorMessage = updateStatus.isError
    ? updateStatus.error instanceof ApiError
      ? updateStatus.error.message
      : 'No se ha podido actualizar el estado. Inténtalo de nuevo.'
    : undefined

  const lastReachedIndex = TIMELINE_STEPS.findIndex((step) => step.status === operationalStatus)
  const incidentEntry = [...order.statusHistory]
    .reverse()
    .find((entry) => entry.status === 'INCIDENT')
  const incident = order.status === 'INCIDENT' ? incidentCopy(incidentEntry) : null

  return (
    <div className="flex flex-col gap-4 p-3">
      <ul className="flex flex-col">
        {TIMELINE_STEPS.map((step, index) => {
          const isLast = index === TIMELINE_STEPS.length - 1
          const isCompleted = isAside ? index <= lastReachedIndex : index < lastReachedIndex
          const isCurrent = !isAside && index === lastReachedIndex
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
              {!isLast && <div className="absolute left-3.25 top-7 bottom-0 w-px bg-neutral-200" />}
              {/* Clicking a reached step reverts to it — works even from DELIVERED/CANCELLED/INCIDENT. */}
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

      {incident && (
        <div className="flex flex-col gap-1 rounded-lg border border-error/40 bg-error/10 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <AlertTriangle size={16} className="text-error" aria-hidden="true" />
            <span className="text-sm font-medium text-ink">Incidencia</span>
            {incident.suggestedByAi && <AiSuggestedBadge />}
          </div>
          <span className="text-sm text-ink-muted">
            {incidentEntry ? formatDateTime(new Date(incidentEntry.changedAt)) : '—'}
          </span>
          <p className="text-sm whitespace-pre-wrap text-ink">{incident.text}</p>
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <p className="text-sm text-error">Este pedido ha sido cancelado.</p>
      )}

      {order.status === 'INCIDENT' && (
        <SincraButton
          variant="secondary"
          className="w-full"
          loading={updateStatus.isPending}
          onClick={() => updateStatus.mutate(operationalStatus)}
        >
          Resolver incidencia
        </SincraButton>
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

      {order.status !== 'INCIDENT' && order.status !== 'CANCELLED' && (
        <SincraButton
          variant="dangerOutline"
          className="w-full"
          disabled={updateStatus.isPending}
          onClick={() => setIsIncidentModalOpen(true)}
        >
          Marcar incidencia
        </SincraButton>
      )}

      {errorMessage && (
        <p role="alert" className="text-sm text-error">
          {errorMessage}
        </p>
      )}

      {isIncidentModalOpen && (
        <MarkIncidentModal
          orderId={order.id}
          opened
          onClose={() => setIsIncidentModalOpen(false)}
        />
      )}
    </div>
  )
}
