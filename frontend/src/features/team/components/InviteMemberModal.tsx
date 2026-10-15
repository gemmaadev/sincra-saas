import { useForm } from 'react-hook-form'
import { UserPlus } from 'lucide-react'
import { Input, SincraButton, SincraModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { useInviteMember } from '../hooks/useInviteMember'
import type { InviteMemberFormValues } from '../types/team.types'

interface InviteMemberModalProps {
  opened: boolean
  onClose: () => void
}

export function InviteMemberModal({ opened, onClose }: InviteMemberModalProps) {
  const inviteMember = useInviteMember()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({ defaultValues: { name: '', email: '' } })

  function handleClose() {
    inviteMember.reset()
    reset()
    onClose()
  }

  function handleInvited() {
    notifySuccess('Invitación enviada')
    handleClose()
  }

  function handleFormSubmit(values: InviteMemberFormValues) {
    inviteMember.mutate(values, { onSuccess: handleInvited })
  }

  const submitError = inviteMember.isError
    ? inviteMember.error instanceof ApiError
      ? inviteMember.error.message
      : 'No se ha podido enviar la invitación. Inténtalo de nuevo.'
    : undefined

  return (
    <SincraModal
      opened={opened}
      onClose={handleClose}
      title="Invitar empleado"
      icon={<UserPlus size={26} className="text-primary" aria-hidden="true" />}
      size="sm"
    >
      <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          error={errors.name?.message}
          {...register('name', { validate: (value) => value.trim() !== '' || 'Obligatorio' })}
        />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', {
            validate: (value) => value.trim() !== '' || 'Obligatorio',
          })}
        />

        {submitError && <p className="text-sm text-error">{submitError}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <SincraButton type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </SincraButton>
          <SincraButton type="submit" loading={inviteMember.isPending}>
            Enviar invitación
          </SincraButton>
        </div>
      </form>
    </SincraModal>
  )
}
