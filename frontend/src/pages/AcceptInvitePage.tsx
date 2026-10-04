import { useNavigate } from 'react-router'
import { TokenPasswordForm } from '@/features/auth/components/TokenPasswordForm'
import { useAcceptInvite } from '@/features/auth/hooks/useAcceptInvite'

export default function AcceptInvitePage() {
  const navigate = useNavigate()
  const { acceptInvite, isSubmitting, error } = useAcceptInvite()

  async function handleSubmit(token: string, password: string) {
    const success = await acceptInvite(token, password)
    if (success) navigate('/login')
  }

  return (
    <TokenPasswordForm
      heroTitle="Te han invitado a un equipo"
      heroDescription="Elige una contraseña para activar tu cuenta y empezar a trabajar con tu equipo."
      formTitle="Crea tu contraseña"
      formDescription="Este será el último paso para unirte al equipo."
      passwordLabel="Contraseña"
      submitLabel="Unirme al equipo"
      submittingLabel="Uniéndote al equipo..."
      invalidLinkMessage="Este enlace de invitación no es válido. Pide a quien te haya invitado que te mande uno nuevo."
      invalidLinkCtaLabel="Ir a iniciar sesión"
      invalidLinkCtaTo="/login"
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={handleSubmit}
    />
  )
}
