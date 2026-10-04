import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { SincraButton } from '@/shared/components/button'
import { SincraLogo } from '@/shared/components/logo'
import { Input, PasswordInput } from '@/shared/components/input'
import { Checkbox } from '@/shared/components/checkbox'
import { saveRegisterCredentials } from '@/features/auth/utils/registerCredentials'
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

const BENEFITS = [
  'Todos tus canales en un solo lugar',
  'Automatiza para ahorrar tiempo',
  'Gestiona tu equipo y pedidos',
  'Analiza y haz crecer tu negocio',
]

export default function RegisterPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const onSubmit = (data: RegisterFormData) => {
    saveRegisterCredentials({ name: data.name, email: data.email, password: data.password })
    navigate('/onboarding')
  }

  return (
    <AuthLayout
      leftPanel={
        <div className="flex h-full flex-col justify-center gap-6 bg-primary p-12 text-white">
          <SincraLogo size={28} variant="white" />
          <h2 className="text-3xl font-bold">
            Empieza a gestionar tu negocio de forma inteligente
          </h2>
          <p className="text-white/90">
            Crea tu cuenta en menos de 2 minutos y conecta tus canales de comunicación.
          </p>
          <ul className="flex flex-col gap-3 text-base">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-ink">Crear cuenta</h1>
          <p className="text-sm text-ink-muted">Paso 1 de 2</p>
          <p className="text-ink-muted">Introduce tus credenciales para empezar.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Nombre de usuario"
            placeholder="Tu nombre"
            error={errors.name?.message}
            {...register('name', {
              required: 'Tu nombre es obligatorio',
            })}
          />

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

          <PasswordInput
            label="Contraseña"
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

          <Checkbox
            label={
              <>
                Acepto los{' '}
                <a href="/terminos" className="text-primary">
                  Términos y Condiciones
                </a>{' '}
                y la{' '}
                <a href="/privacidad" className="text-primary">
                  Política de Privacidad
                </a>
              </>
            }
            error={errors.acceptTerms?.message}
            {...register('acceptTerms', {
              required: 'Debes aceptar los términos para continuar',
            })}
          />

          <SincraButton type="submit" variant="primary">
            Continuar
          </SincraButton>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-sm text-ink-muted">o continúa con</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
        <SocialLoginButtons />

        <p className="text-center text-sm text-ink-muted">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary">
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
