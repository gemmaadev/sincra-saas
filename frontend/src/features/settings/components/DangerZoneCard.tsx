import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CloudOff } from 'lucide-react'
import { SincraButton, ConfirmDeleteModal, SectionHeader } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useDeleteAccount } from '../hooks/useDeleteAccount'

export function DangerZoneCard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const deleteAccount = useDeleteAccount()
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleClose() {
    deleteAccount.reset()
    setIsModalOpen(false)
  }

  function handleConfirm() {
    deleteAccount.mutate(undefined, {
      onSuccess: async () => {
        await logout()
        navigate('/login')
      },
    })
  }

  const error = deleteAccount.isError
    ? deleteAccount.error instanceof ApiError
      ? deleteAccount.error.message
      : 'No se ha podido eliminar el negocio. Inténtalo de nuevo.'
    : undefined

  return (
    <section aria-label="Eliminar negocio" className="flex flex-col gap-4 py-10 first:pt-0 last:pb-0">
      <SectionHeader
        icon={<CloudOff size={24} aria-hidden="true" />}
        title="Eliminar negocio"
        description="Si necesitas cerrar tu negocio, puedes hacerlo aquí. Esta acción no se puede deshacer."
        action={
          <SincraButton variant="danger" size="sm" onClick={() => setIsModalOpen(true)}>
            Eliminar negocio
          </SincraButton>
        }
      />

      <ConfirmDeleteModal
        opened={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        isLoading={deleteAccount.isPending}
        error={error}
        title="¿Eliminar negocio?"
        message="Se eliminará el acceso de todo tu equipo a Sincra. Esta acción no se puede deshacer."
        confirmLabel="Eliminar negocio"
      />
    </section>
  )
}
