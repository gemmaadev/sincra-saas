import { Modal } from '@mantine/core'
import { UserRound } from 'lucide-react'
import { ClientForm } from './ClientForm'
import type { ClientDetail } from '../types/client.types'

const MODAL_PROPS = {
  size: 'lg',
  centered: true,
  radius: 'lg',
  padding: 'xl',
  overlayProps: { backgroundOpacity: 0.35, blur: 3 },
  closeButtonProps: { 'aria-label': 'Cerrar' },
  styles: {
    header: {
      borderBottom: '1px solid var(--color-neutral-100)',
      paddingBottom: 'var(--mantine-spacing-md)',
      marginBottom: 'var(--mantine-spacing-lg)',
    },
  },
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
      title={
        <span className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg text-primary">
            <UserRound size={26} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold text-ink">
            {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
          </span>
        </span>
      }
      {...MODAL_PROPS}
    >
      <ClientForm client={client} />
    </Modal>
  )
}
