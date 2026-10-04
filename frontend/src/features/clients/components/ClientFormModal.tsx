import { Modal } from '@mantine/core'
import type { ClientDetail } from '../types/client.types'

const MODAL_PROPS = {
  size: 'lg',
  centered: true,
  closeButtonProps: { 'aria-label': 'Cerrar' },
} as const

interface ClientFormModalProps {
  opened: boolean
  onClose: () => void
  client?: ClientDetail
}

export function ClientFormModal({ opened, onClose, client }: ClientFormModalProps) {
  const isEditing = client !== undefined

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Editar cliente' : 'Nuevo cliente'}
      {...MODAL_PROPS}
    >
      {/* The form fields arrive in the next step. */}
    </Modal>
  )
}
