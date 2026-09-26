import { useLocation, useNavigate } from 'react-router'
import { SincraButton } from '@/shared/components/button'

interface VerifyEmailLocationState {
  email?: string
}

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email } = (location.state as VerifyEmailLocationState) ?? {}

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg text-center">
      <div className="flex flex-col items-center gap-1">
        <img
          src="/correo-recuperar-contrasena.png"
          alt="Ilustración de un sobre abierto"
          className="w-full max-w-lg"
          width={30}
        />
        <h1 className="text-2xl font-bold text-ink">Revisa tu correo</h1>
        <p className="max-w-sm text-ink-muted">
          {email ? (
            <>
              Te hemos enviado un enlace para restablecer tu contraseña a{' '}
              <span className="font-medium text-ink">{email}</span>.
              <span className="mt-2 block">Si no lo encuentras, revisa la carpeta de spam.</span>
            </>
          ) : (
            'Te hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.'
          )}
        </p>
      </div>

      <SincraButton type="button" variant="primary" onClick={() => navigate('/login')}>
        Volver a iniciar sesión
      </SincraButton>
    </div>
  )
}
