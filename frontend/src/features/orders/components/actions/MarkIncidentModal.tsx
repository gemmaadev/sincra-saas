import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { SincraButton, SincraModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useMarkOrderIncident } from '../../hooks/useMarkOrderIncident'

const NOTE_MAX_LENGTH = 1000

interface MarkIncidentModalProps {
  orderId: string
  opened: boolean
  onClose: () => void
}

export function MarkIncidentModal({ orderId, opened, onClose }: MarkIncidentModalProps) {
  const markIncident = useMarkOrderIncident(orderId)
  const [note, setNote] = useState('')

  function handleClose() {
    markIncident.reset()
    setNote('')
    onClose()
  }

  function handleSubmit() {
    const incidentNote = note.trim()
    if (!incidentNote) return

    markIncident.mutate(incidentNote, {
      onSuccess: () => {
        notifySuccess('Pedido marcado como incidencia')
        handleClose()
      },
    })
  }

  const error = markIncident.isError
    ? markIncident.error instanceof ApiError
      ? markIncident.error.message
      : 'No se ha podido marcar la incidencia. Inténtalo de nuevo.'
    : undefined

  return (
    <SincraModal
      opened={opened}
      onClose={handleClose}
      title="Marcar incidencia"
      size="sm"
      icon={<AlertTriangle size={18} className="text-error" aria-hidden="true" />}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <p className="text-sm text-ink-muted">
          Cuenta qué ha pasado. El pedido pasa a Incidencia hasta que lo resuelvas. La nota también
          se guarda en Notas.
        </p>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink" htmlFor="incident-note">
          Qué ha pasado
          <textarea
            id="incident-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={NOTE_MAX_LENGTH}
            required
            placeholder="Por ejemplo: el cliente ha recibido el pedido dañado"
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
          <SincraButton
            type="submit"
            variant="danger"
            disabled={!note.trim()}
            loading={markIncident.isPending}
          >
            Marcar incidencia
          </SincraButton>
        </div>
      </form>
    </SincraModal>
  )
}
