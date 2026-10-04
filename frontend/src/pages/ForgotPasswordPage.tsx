import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { SincraButton } from '@/shared/components/button'
import { SincraLogo } from '@/shared/components/logo'
import { Input } from '@/shared/components/input'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'

interface ForgotPasswordFormData {
  email: string
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { requestPasswordReset, isSubmitting } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await requestPasswordReset(data.email)
    navigate('/verify-email', { state: { email: data.email } })
  }

  return (
    <AuthLayout
      leftPanel={
        <div className="flex h-full flex-col justify-center gap-6 bg-primary p-12 text-white">
          <SincraLogo size={28} variant="white" />
          <h2 className="text-3xl font-bold">¿Problemas para acceder?</h2>
          <p className="text-white/90">
            No te preocupes, te enviamos un enlace para que puedas crear una nueva contraseña.
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-ink">Recuperar contraseña</h1>
          <p className="text-ink-muted">
            Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Introduce un email válido',
              },
            })}
          />

          <SincraButton type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
          </SincraButton>
        </form>

        <p className="text-center text-sm text-ink-muted">
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="text-primary">
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
