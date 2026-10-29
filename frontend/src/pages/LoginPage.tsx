import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { SincraButton } from '@/shared/components/button'
import { Input, PasswordInput } from '@/shared/components/input'
import { Checkbox } from '@/shared/components/checkbox'
import { SincraLogo } from '@/shared/components/logo'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons'
import { EMAIL_PATTERN } from '@/shared/utils'

interface LoginFormData {
  email: string
  password: string
  remember: boolean
}

export default function LoginPage() {
  const { submitLogin, isSubmitting, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = (data: LoginFormData) => {
    submitLogin({ email: data.email, password: data.password })
  }

  return (
    <AuthLayout
      leftPanel={
        <div className="flex h-full flex-col justify-center gap-6 bg-primary p-12 text-white">
          <SincraLogo size={28} variant="white" />
          <h2 className="text-3xl font-bold">¡Nos alegra verte de nuevo!</h2>
          <p className="text-xl text-white/90">
            Vuelve a tu bandeja: tus conversaciones, clientes y pedidos te están esperando.
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-ink">Iniciar sesión</h1>
          <p className="text-ink-muted">Accede a tu cuenta de Sincra</p>
        </div>

        {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: {
                value: EMAIL_PATTERN,
                message: 'Introduce un email válido',
              },
            })}
          />

          <PasswordInput
            label="Contraseña"
            placeholder="Introduce tu contraseña"
            error={errors.password?.message}
            registration={register('password', { required: 'La contraseña es obligatoria' })}
          />

          <div className="flex items-center justify-between">
            <Checkbox label="Recordarme" {...register('remember')} />
            <Link to="/forgot-password" className="text-sm text-primary">
              ¿Has olvidado tu contraseña?
            </Link>
          </div>

          <SincraButton type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </SincraButton>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-sm text-ink-muted">o continúa con</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <SocialLoginButtons />

        <p className="text-center text-sm text-ink-muted">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-primary underline">
            Regístrate
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
