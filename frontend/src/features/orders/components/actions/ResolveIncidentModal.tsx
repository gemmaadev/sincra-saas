import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { SincraButton, SincraModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useResolveOrderIncident } from '../../hooks/useResolveOrderIncident'
import type { OrderStatus } from '../../types/order.types'

const NOTE_MAX_LENGTH = 1000

interface ResolveIncidentModalProps {
  orderId: string
  resolvedStatus: OrderStatus
  opened: boolean
  onClose: () => void
}

export function ResolveIncidentModal({
  orderId,
  resolvedStatus,
  opened,
  onClose,
}: ResolveIncidentModalProps) {
  const resolveIncident = useResolveOrderIncident(orderId)
  const [note, setNote] = useState<string>('')

  function handleClose() {
    resolveIncident.reset()
    setNote('')
    onClose()
  }

  function handleSubmit() {
    const resolutionNote = note.trim()
    if (!resolutionNote) return

    resolveIncident.mutate(
      { status: resolvedStatus, resolutionNote },
      {
        onSuccess: () => {
          notifySuccess('Incidencia resuelta')
          handleClose()
        },
      },
    )
  }

  const error = resolveIncident.isError
    ? resolveIncident.error instanceof ApiError
      ? resolveIncident.error.message
      : 'No se ha podido resolver la incidencia. Inténtalo de nuevo.'
    : undefined

  return (
    <SincraModal
      opened={opened}
      onClose={handleClose}
      title="Resolver incidencia"
      size="sm"
      icon={<CheckCircle size={18} className="text-success" aria-hidden="true" />}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <p className="text-sm text-ink-muted">
          Cuenta cómo se ha resuelto. El pedido vuelve a su estado anterior y la nota también se
          guarda en Notas.
        </p>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink" htmlFor="resolution-note">
          Cómo se ha resuelto
          <textarea
            id="resolution-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={NOTE_MAX_LENGTH}
            required
            placeholder="Por ejemplo: se ha reenviado el pedido y el cliente lo ha confirmado"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <SincraButton type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </SincraButton>
          <SincraButton type="submit" disabled={!note.trim()} loading={resolveIncident.isPending}>
            Resolver incidencia
          </SincraButton>
        </div>
      </form>
    </SincraModal>
  )
}
