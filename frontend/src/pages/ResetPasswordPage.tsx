import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { SincraButton } from '@/shared/components/button'
import { SincraLogo } from '@/shared/components/logo'
import { PasswordInput } from '@/shared/components/input'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { resetPassword, isSubmitting, error } = useResetPassword()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordFormData>()

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return
    const success = await resetPassword(token, data.password)
    if (success) {
      navigate('/login')
    }
  }

  if (!token) {
    return (
      <AuthLayout
        leftPanel={
          <div className="flex h-full flex-col justify-center gap-6 bg-primary p-12 text-white">
            <SincraLogo size={28} variant="white" />
            <h2 className="text-3xl font-bold">Enlace no válido</h2>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-ink">Enlace no válido</h1>
          <p className="text-ink-muted">
            Este enlace de recuperación no es válido. Solicita uno nuevo desde la pantalla de inicio
            de sesión.
          </p>
          <SincraButton
            type="button"
            variant="primary"
            onClick={() => navigate('/forgot-password')}
          >
            Solicitar nuevo enlace
          </SincraButton>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      leftPanel={
        <div className="flex h-full flex-col justify-center gap-6 bg-primary p-12 text-white">
          <SincraLogo size={28} variant="white" />
          <h2 className="text-3xl font-bold">Crea una nueva contraseña</h2>
          <p className="text-white/90">
            Elige una contraseña segura y diferente a la anterior para volver a acceder a tu cuenta.
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-ink">Nueva contraseña</h1>
          <p className="text-ink-muted">Introduce y confirma tu nueva contraseña.</p>
        </div>

        {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <PasswordInput
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            registration={register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
            })}
          />

          <PasswordInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword', {
              required: 'Repite tu contraseña',
              validate: (value) =>
                value === getValues('password') || 'Las contraseñas no coinciden',
            })}
          />

          <SincraButton type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Restableciendo...' : 'Restablecer contraseña'}
          </SincraButton>
        </form>
      </div>
    </AuthLayout>
  )
}
