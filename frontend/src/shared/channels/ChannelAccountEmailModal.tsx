import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Mail } from 'lucide-react'
import { Input, SincraButton, SincraModal } from '@/shared/components'
import { EMAIL_PATTERN } from '@/shared/utils'

export type ChannelEmailPurpose = 'connect' | 'add' | 'edit'

interface ChannelAccountEmailModalProps {
  opened: boolean
  channelName: string
  purpose: ChannelEmailPurpose
  asksGoogle?: boolean
  initialEmail?: string
  loading?: boolean
  onClose: () => void
  onConfirm: (email: string) => void
}

interface EmailFormValues {
  email: string
}

function modalCopy(channelName: string, purpose: ChannelEmailPurpose, asksGoogle: boolean) {
  if (purpose === 'add') {
    return {
      title: 'Añadir email',
      description: `Escribe el email de la cuenta de ${channelName} que ya está conectada.`,
      submit: 'Guardar',
    }
  }
  if (purpose === 'edit') {
    return {
      title: 'Cambiar email',
      description: `Escribe el nuevo email de la cuenta de ${channelName}.`,
      submit: 'Guardar',
    }
  }
  if (asksGoogle) {
    return {
      title: `Conectar ${channelName}`,
      description: 'Escribe el email de la cuenta. Después te pediremos confirmarla con Google.',
      submit: 'Continuar',
    }
  }
  return {
    title: `Conectar ${channelName}`,
    description: 'Escribe el email de la cuenta que quieres conectar.',
    submit: 'Conectar',
  }
}

export function ChannelAccountEmailModal({
  opened,
  channelName,
  purpose,
  asksGoogle = false,
  initialEmail = '',
  loading = false,
  onClose,
  onConfirm,
}: ChannelAccountEmailModalProps) {
  const copy = modalCopy(channelName, purpose, asksGoogle)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormValues>({ defaultValues: { email: initialEmail } })

  useEffect(() => {
    if (opened) reset({ email: initialEmail })
  }, [opened, initialEmail, reset])

  function submit(values: EmailFormValues) {
    onConfirm(values.email.trim().toLowerCase())
  }

  return (
    <SincraModal
      opened={opened}
      onClose={onClose}
      title={copy.title}
      icon={<Mail size={26} className="text-primary" aria-hidden="true" />}
      size="sm"
    >
      <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">{copy.description}</p>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            validate: (value) => {
              const email = value.trim()
              if (!email) return 'Obligatorio'
              if (!EMAIL_PATTERN.test(email)) return 'Introduce un email válido'
              return true
            },
          })}
        />
        <div className="flex justify-end gap-3 pt-2">
          <SincraButton type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </SincraButton>
          <SincraButton type="submit" loading={loading}>
            {copy.submit}
          </SincraButton>
        </div>
      </form>
    </SincraModal>
  )
}
