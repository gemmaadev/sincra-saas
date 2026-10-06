import { AlertTriangle } from 'lucide-react'
import { SincraButton } from '../button'
import { SincraModal } from './SincraModal'

interface ConfirmDeleteModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  isLoading?: boolean
  error?: string
}

export function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Eliminar',
  isLoading = false,
  error,
}: ConfirmDeleteModalProps) {
  return (
    <SincraModal
      opened={opened}
      onClose={onClose}
      title={title}
      size="sm"
      icon={<AlertTriangle size={26} className="text-warning" aria-hidden="true" />}
    >
      <div className="flex flex-col gap-5">
        <p className="text-ink-muted">{message}</p>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <SincraButton variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </SincraButton>
          <SincraButton variant="danger" onClick={onConfirm} loading={isLoading}>
            {confirmLabel}
          </SincraButton>
        </div>
      </div>
    </SincraModal>
  )
}
