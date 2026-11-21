import { useForm } from 'react-hook-form'
import { Mail } from 'lucide-react'
import { SincraButton } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { SincraModal } from '@/shared/components/modal'
import { EMAIL_PATTERN } from '@/shared/utils'
import type {
  ChannelAccountEmailFormProps,
  ChannelAccountEmailFormValues,
  ChannelAccountEmailModalProps,
  ChannelEmailPurpose,
} from './channel-account-email-modal.types'

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

function ChannelAccountEmailForm({
  initialEmail,
  description,
  submitLabel,
  loading,
  onClose,
  onConfirm,
}: ChannelAccountEmailFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChannelAccountEmailFormValues>({ defaultValues: { email: initialEmail } })

  function submit(values: ChannelAccountEmailFormValues) {
    onConfirm(values.email.trim().toLowerCase())
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">{description}</p>
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
          {submitLabel}
        </SincraButton>
      </div>
    </form>
  )
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

  return (
    <SincraModal
      opened={opened}
      onClose={onClose}
      title={copy.title}
      icon={<Mail size={26} className="text-primary" aria-hidden="true" />}
      size="sm"
    >
      {opened && (
        <ChannelAccountEmailForm
          key={`${purpose}:${initialEmail}`}
          initialEmail={initialEmail}
          description={copy.description}
          submitLabel={copy.submit}
          loading={loading}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </SincraModal>
  )
}
