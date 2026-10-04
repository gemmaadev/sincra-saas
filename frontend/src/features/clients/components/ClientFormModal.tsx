import { Modal } from '@mantine/core'
import { UserRound } from 'lucide-react'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useSaveClient } from '../hooks/useSaveClient'
import { ClientForm } from './ClientForm'
import type { ClientDetail, ClientFormValues } from '../types/client.types'

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
  const saveClient = useSaveClient(client?.id)

  function handleClose() {
    saveClient.reset()
    onClose()
  }

  function handleSaved() {
    notifySuccess(isEditing ? 'Cliente actualizado' : 'Cliente creado')
    handleClose()
  }

  function handleSubmit(values: ClientFormValues) {
    saveClient.mutate(values, { onSuccess: handleSaved })
  }

  const submitError = saveClient.isError
    ? saveClient.error instanceof ApiError
      ? saveClient.error.message
      : 'No se ha podido guardar el cliente. Inténtalo de nuevo.'
    : undefined

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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
      <ClientForm
        client={client}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isSubmitting={saveClient.isPending}
        submitError={submitError}
      />
    </Modal>
  )
}
