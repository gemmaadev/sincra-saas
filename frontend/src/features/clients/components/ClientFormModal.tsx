import { UserRound } from 'lucide-react'
import { SincraModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useSaveClient } from '../hooks/useSaveClient'
import { ClientForm } from './ClientForm'
import type { ClientDetail, ClientFormValues, Coordinates } from '../types/client.types'

interface ClientFormModalProps {
  opened: boolean
  onClose: () => void
  client?: ClientDetail
  initialLocation?: Coordinates
}

export function ClientFormModal({
  opened,
  onClose,
  client,
  initialLocation,
}: ClientFormModalProps) {
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
    <SincraModal
      opened={opened}
      onClose={handleClose}
      title={isEditing ? 'Editar cliente' : 'Nuevo cliente'}
      icon={<UserRound size={26} className="text-primary" aria-hidden="true" />}
    >
      <ClientForm
        client={client}
        initialLocation={initialLocation}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isSubmitting={saveClient.isPending}
        submitError={submitError}
      />
    </SincraModal>
  )
}
