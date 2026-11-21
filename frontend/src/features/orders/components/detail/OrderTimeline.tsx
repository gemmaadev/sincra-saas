import { useState } from 'react'
import { Circle, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import { formatDateTime } from '@/shared/utils'
import { AiSuggestedBadge, SincraButton } from '@/shared/components'
import type { BadgeColor } from '@/shared/components'
import { isSincroNote, sincroNoteBody } from '@/shared/components/notes-tab'
import { ApiError } from '@/shared/services'
import { ORDER_STATUS_ICONS, ORDER_STATUS_COLORS } from '@/shared/orderStatus.constants'
import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus'
import { lastOperationalStatus } from '../../utils/operationalStatus'
import { MarkIncidentModal } from '../actions/MarkIncidentModal'
import { ResolveIncidentModal } from '../actions/ResolveIncidentModal'
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

function noteCopy(entry: OrderStatusChangeEntry | undefined): {
  text: string
  suggestedByAi: boolean
} {
  const raw = entry?.note?.trim() ?? ''
  const suggestedByAi =
    raw.length > 0 && isSincroNote({ content: raw, createdBy: entry?.changedBy ?? null })
  const body = raw ? sincroNoteBody(raw).trim() : ''

  return { text: body || 'Sin una nota escrita.', suggestedByAi }
}

interface IncidentEpisode {
  startEntry: OrderStatusChangeEntry
  resolutionEntry: OrderStatusChangeEntry | undefined
}

// Walks history chronologically pairing each INCIDENT entry with the change that ended it, if any —
// an episode with no resolutionEntry is still open (only possible for the most recent one).
function buildIncidentEpisodes(history: OrderStatusChangeEntry[]): IncidentEpisode[] {
  const episodes: IncidentEpisode[] = []

  for (let index = 0; index < history.length; index += 1) {
    const entry = history[index]!
    if (entry.status !== 'INCIDENT') continue

    episodes.push({ startEntry: entry, resolutionEntry: history[index + 1] })
  }

  return episodes.reverse()
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const updateStatus = useUpdateOrderStatus(order.id)
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState<boolean>(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false)
  // Collapsed by default to save space, except the still-open incident (it needs attention).
  // Keyed by startEntry.id so a toggle survives a re-render once the user has picked it.
  const [expandedEpisodeIds, setExpandedEpisodeIds] = useState<Record<string, boolean>>({})
  const operationalStatus = lastOperationalStatus(order.status, order.statusHistory)
  const nextStatus = order.status === 'CANCELLED' ? undefined : NEXT_STATUS[operationalStatus]
  const isAside = order.status === 'CANCELLED' || order.status === 'INCIDENT'

  const errorMessage = updateStatus.isError
    ? updateStatus.error instanceof ApiError
      ? updateStatus.error.message
      : 'No se ha podido actualizar el estado. Inténtalo de nuevo.'
    : undefined

  const lastReachedIndex = TIMELINE_STEPS.findIndex((step) => step.status === operationalStatus)
  const incidentEpisodes = buildIncidentEpisodes(order.statusHistory)

  return (
    <div className="flex flex-col gap-4 p-3">
      <ul className="flex flex-col">
        {TIMELINE_STEPS.map((step, index) => {
          const isLast = index === TIMELINE_STEPS.length - 1
          const isCompleted = isAside ? index <= lastReachedIndex : index < lastReachedIndex
          const isCurrent = !isAside && index === lastReachedIndex
          // The step an open incident is paused on isn't "done" — it shouldn't get the plain
          // green checkmark, even though it's technically the last one reached.
          const isPausedAt = order.status === 'INCIDENT' && index === lastReachedIndex
          // Show the most recent entry — a status can be reached more than once.
          const historyEntry = [...order.statusHistory]
            .reverse()
            .find((entry) => entry.status === step.status)

          const Icon = isPausedAt
            ? AlertTriangle
            : isCompleted
              ? CheckCircle
              : isCurrent
                ? ORDER_STATUS_ICONS[step.status]
                : Circle
          const bgClassName = isPausedAt
            ? 'bg-error'
            : isCompleted
              ? 'bg-success'
              : isCurrent
                ? STATUS_BG_COLORS[ORDER_STATUS_COLORS[step.status]]
                : 'bg-neutral-100'
          const iconClassName =
            isCompleted || isCurrent || isPausedAt ? 'text-white' : 'text-neutral-400'

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

          // While an incident is open, the connector right after the paused step shows the
          // flow is paused rather than simply continuing — a dashed red line instead of a plain one.
          const isPausedConnector = !isLast && isPausedAt

          return (
            <li key={step.status} className="relative pb-6">
              {!isLast && (
                <div
                  className={
                    isPausedConnector
                      ? 'absolute left-3.25 top-7 bottom-0 w-px border-l-2 border-dashed border-error'
                      : 'absolute left-3.25 top-7 bottom-0 w-px bg-neutral-200'
                  }
                  aria-hidden="true"
                />
              )}
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

      {order.status === 'CANCELLED' && (
        <p className="text-sm text-error">Este pedido ha sido cancelado.</p>
      )}

      {order.status === 'INCIDENT' && (
        <SincraButton
          variant="secondary"
          className="w-full"
          onClick={() => setIsResolveModalOpen(true)}
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

      {incidentEpisodes.map((episode) => {
        const episodeId = episode.startEntry.id
        const isOpen = episode.resolutionEntry === undefined
        const isExpanded = expandedEpisodeIds[episodeId] ?? isOpen
        const incident = noteCopy(episode.startEntry)
        const resolution = episode.resolutionEntry ? noteCopy(episode.resolutionEntry) : null

        return (
          <div
            key={episodeId}
            className={
              isOpen
                ? 'flex flex-col rounded-lg border border-error/40 bg-error/10'
                : 'flex flex-col rounded-lg border border-neutral-200 bg-neutral-50'
            }
          >
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() =>
                setExpandedEpisodeIds((previous) => ({ ...previous, [episodeId]: !isExpanded }))
              }
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <AlertTriangle
                size={16}
                className={isOpen ? 'shrink-0 text-error' : 'shrink-0 text-ink-muted'}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-ink">
                {isOpen ? 'Incidencia' : 'Incidencia resuelta'}
              </span>
              {incident.suggestedByAi && <AiSuggestedBadge />}
              <span className="ml-auto text-sm text-ink-muted">
                {formatDateTime(new Date(episode.startEntry.changedAt))}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-ink-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {isExpanded && (
              <div className="flex flex-col gap-1 px-3 pb-3">
                <p className="text-sm whitespace-pre-wrap text-ink">{incident.text}</p>

                {resolution && episode.resolutionEntry && (
                  <div className="mt-2 flex flex-col gap-1 border-t border-neutral-200 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CheckCircle size={16} className="text-success" aria-hidden="true" />
                      <span className="text-sm font-medium text-ink">Resuelta</span>
                      {resolution.suggestedByAi && <AiSuggestedBadge />}
                    </div>
                    <span className="text-sm text-ink-muted">
                      {formatDateTime(new Date(episode.resolutionEntry.changedAt))}
                    </span>
                    <p className="text-sm whitespace-pre-wrap text-ink">{resolution.text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {isIncidentModalOpen && (
        <MarkIncidentModal
          orderId={order.id}
          opened
          onClose={() => setIsIncidentModalOpen(false)}
        />
      )}

      {isResolveModalOpen && (
        <ResolveIncidentModal
          orderId={order.id}
          resolvedStatus={operationalStatus}
          opened
          onClose={() => setIsResolveModalOpen(false)}
        />
      )}
    </div>
  )
}
