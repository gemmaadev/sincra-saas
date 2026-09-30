import { useNavigate } from 'react-router'
import { TokenPasswordForm } from '@/features/auth/components/TokenPasswordForm'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword, isSubmitting, error } = useResetPassword()

  async function handleSubmit(token: string, password: string) {
    const success = await resetPassword(token, password)
    if (success) navigate('/login')
  }

  return (
    <TokenPasswordForm
      heroTitle="Crea una nueva contraseña"
      heroDescription="Elige una contraseña segura y diferente a la anterior para volver a acceder a tu cuenta."
      formTitle="Nueva contraseña"
      formDescription="Introduce y confirma tu nueva contraseña."
      passwordLabel="Nueva contraseña"
      submitLabel="Restablecer contraseña"
      submittingLabel="Restableciendo..."
      invalidLinkMessage="Este enlace de recuperación no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión."
      invalidLinkCtaLabel="Solicitar nuevo enlace"
      invalidLinkCtaTo="/forgot-password"
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={handleSubmit}
    />
  )
}
