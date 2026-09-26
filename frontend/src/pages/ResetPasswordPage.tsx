import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { SincraButton } from '@/shared/components/button'
import { SincraLogo } from '@/shared/components/logo'
import { PasswordInput } from '@/shared/components/input'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordFormData>()

  const onSubmit = () => {
    // TODO: llamar a POST /auth/reset-password con el token de la URL cuando exista el backend
    navigate('/login')
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

          <SincraButton type="submit" variant="primary">
            Restablecer contraseña
          </SincraButton>
        </form>
      </div>
    </AuthLayout>
  )
}
