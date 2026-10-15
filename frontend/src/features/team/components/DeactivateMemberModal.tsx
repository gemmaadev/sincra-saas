import { ConfirmDeleteModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useUpdateMemberStatus } from '../hooks/useUpdateMemberStatus'
import type { TeamMember } from '../types/team.types'

interface DeactivateMemberModalProps {
  member: Pick<TeamMember, 'id' | 'name'>
  opened: boolean
  onClose: () => void
}

export function DeactivateMemberModal({ member, opened, onClose }: DeactivateMemberModalProps) {
  const updateMemberStatus = useUpdateMemberStatus()

  function handleClose() {
    updateMemberStatus.reset()
    onClose()
  }

  function handleConfirm() {
    updateMemberStatus.mutate(
      { userId: member.id, status: 'INACTIVE' },
      {
        onSuccess: () => {
          notifySuccess('Acceso desactivado')
          handleClose()
        },
      },
    )
  }

  const error = updateMemberStatus.isError
    ? updateMemberStatus.error instanceof ApiError
      ? updateMemberStatus.error.message
      : 'No se ha podido desactivar el acceso. Inténtalo de nuevo.'
    : undefined

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleConfirm}
      isLoading={updateMemberStatus.isPending}
      error={error}
      title="¿Desactivar acceso?"
      message={`${member.name} perderá acceso a Sincra. Podrás reactivarlo en cualquier momento.`}
      confirmLabel="Desactivar"
    />
  )
}
